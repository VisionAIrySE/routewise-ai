import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Product IDs for tier mapping
const PRODUCT_IDS = {
  individual: "prod_TbBO42W3Tde65u",
  team: "prod_TbBqMsplBvazKf",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        status: "none",
        product_id: null,
        tier: null,
        subscription_end: null,
        trial_end: null,
        seats: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active or trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No subscription found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        status: "none",
        product_id: null,
        tier: null,
        subscription_end: null,
        trial_end: null,
        seats: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const status = subscription.status;
    const isActive = status === "active" || status === "trialing";
    
    // Get product info
    const productId = subscription.items.data[0].price.product as string;
    const quantity = subscription.items.data[0].quantity || 1;
    
    // Determine tier
    let tier: string | null = null;
    if (productId === PRODUCT_IDS.individual) {
      tier = "individual";
    } else if (productId === PRODUCT_IDS.team) {
      tier = "team";
    }

    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const trialEnd = subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString() 
      : null;

    logStep("Subscription details", { 
      status, 
      isActive, 
      tier, 
      productId, 
      quantity,
      subscriptionEnd,
      trialEnd,
    });

    return new Response(JSON.stringify({
      subscribed: isActive,
      status,
      product_id: productId,
      tier,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd,
      seats: quantity,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
