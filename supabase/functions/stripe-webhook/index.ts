import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      logStep("Missing signature or webhook secret");
      return new Response("Missing signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    logStep("Received event", { type: event.type });

    // Handle successful subscription payment (first payment after trial)
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Only process subscription invoices (not one-time payments)
      if (!invoice.subscription) {
        logStep("Not a subscription invoice, skipping");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Skip if this is a $0 invoice (trial period)
      if (invoice.amount_paid === 0) {
        logStep("Zero amount invoice (trial), skipping referral credit");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const customerEmail = invoice.customer_email;
      logStep("Processing paid subscription invoice", { 
        customerEmail, 
        amountPaid: invoice.amount_paid,
        subscriptionId: invoice.subscription 
      });

      // Find the user who just paid
      const { data: paidUser, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id, referral_code_used, referred_by")
        .eq("email", customerEmail)
        .maybeSingle();

      if (userError || !paidUser) {
        logStep("Could not find user", { customerEmail, error: userError });
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Check if this user was referred
      if (!paidUser.referral_code_used && !paidUser.referred_by) {
        logStep("User was not referred, no credit to apply");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Find pending referral credit for this referred user
      const { data: pendingCredit, error: creditError } = await supabaseAdmin
        .from("referral_credits")
        .select("*")
        .eq("referred_user_id", paidUser.id)
        .eq("status", "pending")
        .eq("credit_type", "free_weeks")
        .maybeSingle();

      if (creditError || !pendingCredit) {
        logStep("No pending referral credit found", { userId: paidUser.id, error: creditError });
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      logStep("Found pending referral credit", { 
        creditId: pendingCredit.id, 
        referrerId: pendingCredit.user_id,
        amount: pendingCredit.credit_amount 
      });

      // Get the referrer's profile to find their Stripe customer
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, stripe_customer_id")
        .eq("id", pendingCredit.user_id)
        .maybeSingle();

      if (referrerError || !referrer) {
        logStep("Could not find referrer", { error: referrerError });
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Find referrer's Stripe customer by email if not stored
      let referrerCustomerId = referrer.stripe_customer_id;
      if (!referrerCustomerId) {
        const customers = await stripe.customers.list({ 
          email: referrer.email, 
          limit: 1 
        });
        if (customers.data.length > 0) {
          referrerCustomerId = customers.data[0].id;
          // Update profile with Stripe customer ID
          await supabaseAdmin
            .from("profiles")
            .update({ stripe_customer_id: referrerCustomerId })
            .eq("id", referrer.id);
        }
      }

      if (!referrerCustomerId) {
        logStep("Referrer has no Stripe customer", { referrerId: referrer.id });
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Get referrer's active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: referrerCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        // Check for trialing subscriptions too
        const trialingSubscriptions = await stripe.subscriptions.list({
          customer: referrerCustomerId,
          status: "trialing",
          limit: 1,
        });
        
        if (trialingSubscriptions.data.length === 0) {
          logStep("Referrer has no active/trialing subscription", { referrerId: referrer.id });
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }
        
        subscriptions.data = trialingSubscriptions.data;
      }

      const referrerSubscription = subscriptions.data[0];
      const weeksToAdd = pendingCredit.credit_amount; // 2 weeks
      const secondsToAdd = weeksToAdd * 7 * 24 * 60 * 60; // Convert weeks to seconds

      // Extend the subscription by adding time to current_period_end
      const currentPeriodEnd = referrerSubscription.current_period_end;
      const newPeriodEnd = currentPeriodEnd + secondsToAdd;

      logStep("Extending referrer subscription", {
        subscriptionId: referrerSubscription.id,
        currentEnd: new Date(currentPeriodEnd * 1000).toISOString(),
        newEnd: new Date(newPeriodEnd * 1000).toISOString(),
        weeksAdded: weeksToAdd
      });

      // Update the subscription's trial_end to extend the billing period
      // This effectively gives them free time before their next billing
      await stripe.subscriptions.update(referrerSubscription.id, {
        trial_end: newPeriodEnd,
        proration_behavior: "none",
      });

      // Mark the referral credit as applied
      await supabaseAdmin
        .from("referral_credits")
        .update({ 
          status: "applied", 
          applied_at: new Date().toISOString() 
        })
        .eq("id", pendingCredit.id);

      // Log the subscription event
      await supabaseAdmin
        .from("subscription_events")
        .insert({
          user_id: referrer.id,
          event_type: "referral_credit_applied",
          notes: `2 weeks free added from referral of user ${paidUser.id}`,
        });

      logStep("Successfully applied referral credit", {
        referrerId: referrer.id,
        referredUserId: paidUser.id,
        weeksAdded: weeksToAdd
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
