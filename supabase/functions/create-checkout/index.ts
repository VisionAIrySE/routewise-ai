import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body for plan type and quantity
    const { priceId, quantity = 1 } = await req.json();
    logStep("Request body parsed", { priceId, quantity });

    // Validate priceId
    const validPriceIds = [
      "price_1SdzI9GG50M447BhdYORbWbG", // Individual $17/month
      "price_1SdzSXGG50M447BhQ2vMf8xn", // Team tiered pricing
    ];
    if (!validPriceIds.includes(priceId)) {
      throw new Error("Invalid price ID");
    }

    // Enforce minimum quantity of 3 for Team plan
    const isTeamPlan = priceId === "price_1SdzSXGG50M447BhQ2vMf8xn";
    const finalQuantity = isTeamPlan ? Math.max(quantity, 3) : 1;
    logStep("Quantity validated", { isTeamPlan, finalQuantity });

    // Check if user has a valid referral code stored in their profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('referral_code_used, referred_by')
      .eq('id', user.id)
      .maybeSingle();
    
    let trialDays = 14; // Default 2-week trial
    let referrerId: string | null = null;
    
    if (profile?.referral_code_used && !profile?.referred_by) {
      // Validate the referral code - find the user who owns it
      const { data: referrerProfile } = await supabaseClient
        .from('profiles')
        .select('id, subscription_status, subscription_tier')
        .eq('referral_code', profile.referral_code_used)
        .maybeSingle();
      
      if (referrerProfile) {
        // Check if referrer has an active subscription or lifetime tier
        const referrerActive = 
          referrerProfile.subscription_status === 'active' ||
          ['lifetime', 'founder', 'owner'].includes(referrerProfile.subscription_tier || '');
        
        if (referrerActive) {
          logStep("Valid referral code found", { 
            referralCode: profile.referral_code_used, 
            referrerId: referrerProfile.id 
          });
          
          // Extend trial to 4 weeks (28 days) for referred user
          trialDays = 28;
          referrerId = referrerProfile.id;
          
          // Update profile with referred_by so we can credit the referrer later
          await supabaseClient
            .from('profiles')
            .update({ referred_by: referrerId })
            .eq('id', user.id);
          
          // Create a pending referral credit for the referrer (2 weeks free banked)
          await supabaseClient
            .from('referral_credits')
            .insert({
              user_id: referrerId,
              referred_user_id: user.id,
              credit_type: 'free_weeks',
              credit_amount: 2, // 2 weeks
              status: 'pending', // Will be applied when new user's subscription starts
            });
          
          logStep("Referral credit created for referrer", { 
            referrerId, 
            creditAmount: 2,
            creditType: 'free_weeks'
          });
        } else {
          logStep("Referrer does not have active subscription", { 
            referralCode: profile.referral_code_used 
          });
        }
      } else {
        logStep("Referral code not found in database", { 
          referralCode: profile.referral_code_used 
        });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://inspectorroute.com";

    // Create checkout session with trial period
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: finalQuantity,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          user_id: user.id,
          referrer_id: referrerId || '',
        },
      },
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=canceled`,
    });
    
    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      trialDays,
      hasReferral: !!referrerId
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
