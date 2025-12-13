import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  referral_code: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_trial_days';
  discount_value: number;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  applicable_tiers: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface ReferralCredit {
  id: string;
  user_id: string;
  referred_user_id: string;
  credit_type: 'free_weeks' | 'cash';
  credit_amount: number;
  status: 'pending' | 'applied' | 'paid_out';
  created_at: string;
  applied_at: string | null;
  paid_out_at: string | null;
  referrer?: { name: string | null; email: string | null };
  referred?: { name: string | null; email: string | null };
}

export interface SubscriptionEvent {
  id: string;
  user_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  from_tier: string | null;
  to_tier: string | null;
  amount: number | null;
  notes: string | null;
  created_at: string;
  user?: { name: string | null; email: string | null };
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();

        console.log('[useAdmin] checkAdmin result', { userId: user.id, data, error });

        if (error) {
          console.error('[useAdmin] error checking admin status', error);
        }

        setIsAdmin(!!data && !error);
      } catch (err) {
        console.error('[useAdmin] unexpected error checking admin status', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user]);

  // Fetch all users (admin only)
  const fetchUsers = useCallback(async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  }, []);

  // Fetch promo codes
  const fetchPromoCodes = useCallback(async (): Promise<PromoCode[]> => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }

    return data || [];
  }, []);

  // Create promo code
  const createPromoCode = useCallback(async (promoCode: Omit<PromoCode, 'id' | 'usage_count' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        ...promoCode,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create promo code');
      throw error;
    }

    toast.success('Promo code created');
    return data;
  }, [user]);

  // Toggle promo code active status
  const togglePromoCode = useCallback(async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update promo code');
      throw error;
    }

    toast.success(isActive ? 'Promo code activated' : 'Promo code deactivated');
  }, []);

  // Delete promo code
  const deletePromoCode = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete promo code');
      throw error;
    }

    toast.success('Promo code deleted');
  }, []);

  // Fetch referral credits
  const fetchReferralCredits = useCallback(async (): Promise<ReferralCredit[]> => {
    const { data, error } = await supabase
      .from('referral_credits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referral credits:', error);
      return [];
    }

    return data || [];
  }, []);

  // Update referral credit status
  const updateReferralStatus = useCallback(async (id: string, status: 'applied' | 'paid_out') => {
    const updates: Record<string, unknown> = { status };
    if (status === 'applied') updates.applied_at = new Date().toISOString();
    if (status === 'paid_out') updates.paid_out_at = new Date().toISOString();

    const { error } = await supabase
      .from('referral_credits')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update referral status');
      throw error;
    }

    toast.success('Referral status updated');
  }, []);

  // Fetch subscription events
  const fetchSubscriptionEvents = useCallback(async (): Promise<SubscriptionEvent[]> => {
    const { data, error } = await supabase
      .from('subscription_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching subscription events:', error);
      return [];
    }

    return data || [];
  }, []);

  // Update user subscription
  const updateUserSubscription = useCallback(async (
    userId: string,
    updates: {
      subscription_status?: string;
      subscription_tier?: string;
      trial_ends_at?: string;
      subscription_ends_at?: string;
    },
    notes?: string
  ) => {
    // Get current user data first
    const { data: currentData } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', userId)
      .single();

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update subscription');
      throw error;
    }

    // Log subscription event
    const eventType = updates.subscription_status === 'canceled' ? 'canceled' :
                      updates.subscription_tier !== currentData?.subscription_tier ? 'upgraded' :
                      'created';

    await supabase.from('subscription_events').insert({
      user_id: userId,
      event_type: eventType,
      from_status: currentData?.subscription_status,
      to_status: updates.subscription_status || currentData?.subscription_status,
      from_tier: currentData?.subscription_tier,
      to_tier: updates.subscription_tier || currentData?.subscription_tier,
      notes,
      created_by: user?.id,
    });

    toast.success('Subscription updated');
  }, [user]);

  // Get subscription stats
  const getSubscriptionStats = useCallback(async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier');

    if (!profiles) return { active: 0, trialing: 0, canceled: 0, pastDue: 0, byTier: {} as Record<string, number> };

    const stats = {
      active: profiles.filter(p => p.subscription_status === 'active').length,
      trialing: profiles.filter(p => p.subscription_status === 'trialing').length,
      canceled: profiles.filter(p => p.subscription_status === 'canceled').length,
      pastDue: profiles.filter(p => p.subscription_status === 'past_due').length,
      byTier: {} as Record<string, number>,
    };

    profiles.forEach(p => {
      const tier = p.subscription_tier || 'unknown';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
    });

    return stats;
  }, []);

  // Get saved routes count for analytics
  const getRoutesStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('saved_routes')
      .select('created_at, user_id');

    if (error || !data) return { total: 0, thisWeek: 0, thisMonth: 0, uniqueUsers: 0 };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: data.length,
      thisWeek: data.filter(r => new Date(r.created_at) > weekAgo).length,
      thisMonth: data.filter(r => new Date(r.created_at) > monthAgo).length,
      uniqueUsers: new Set(data.map(r => r.user_id)).size,
    };
  }, []);

  return {
    isAdmin,
    loading,
    fetchUsers,
    fetchPromoCodes,
    createPromoCode,
    togglePromoCode,
    deletePromoCode,
    fetchReferralCredits,
    updateReferralStatus,
    fetchSubscriptionEvents,
    updateUserSubscription,
    getSubscriptionStats,
    getRoutesStats,
  };
}
