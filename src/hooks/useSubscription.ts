import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: string | null;
  loading: boolean;
  error: string | null;
}

// Product ID to tier mapping (from Stripe)
export const SUBSCRIPTION_TIERS = {
  'prod_TbBO42W3Tde65u': 'individual',
  'prod_TbBqMsplBvazKf': 'team',
} as const;

export const PRICE_IDS = {
  individual: 'price_1SdzI9GG50M447BhdYORbWbG',
  team: 'price_1SdzSXGG50M447BhQ2vMf8xn',
} as const;

// Tiers that are always considered subscribed (bypass Stripe check)
const ALWAYS_SUBSCRIBED_TIERS = ['lifetime', 'founder', 'owner'];

export function useSubscription() {
  const { session, user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    tier: null,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token || !user) {
      setState(prev => ({ ...prev, loading: false, subscribed: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // First check if user has a "lifetime" or similar tier in their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      // If user has a lifetime/founder tier, they're always subscribed
      if (profile?.subscription_tier && ALWAYS_SUBSCRIBED_TIERS.includes(profile.subscription_tier)) {
        setState({
          subscribed: true,
          productId: null,
          subscriptionEnd: null,
          tier: profile.subscription_tier,
          loading: false,
          error: null,
        });
        return;
      }
      
      // Otherwise check Stripe subscription
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const stripeTier = data.product_id 
        ? SUBSCRIPTION_TIERS[data.product_id as keyof typeof SUBSCRIPTION_TIERS] ?? null 
        : null;

      setState({
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
        tier: stripeTier || profile?.subscription_tier || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
    }
  }, [session?.access_token, user]);

  const createCheckout = async (priceId: string, quantity: number = 1) => {
    if (!session?.access_token) {
      throw new Error('Must be logged in to subscribe');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: { priceId, quantity },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error('Must be logged in to manage subscription');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
  };

  // Check subscription on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription status every 60 seconds
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
