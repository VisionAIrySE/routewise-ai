import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
  vehicle_mpg: number;
  fuel_cost_per_gallon: number;
  typical_start_time: string;
  typical_end_time: string;
  onboarding_completed: boolean;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  default_inspection_minutes: number;
  requires_appointment: boolean;
  is_active: boolean;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string | null;
  company_name: string;
  avg_inspection_minutes: number;
  is_active: boolean;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCompanies(search?: string) {
  return useQuery({
    queryKey: ['companies', search],
    queryFn: async (): Promise<Company[]> => {
      let query = supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (search && search.length > 0) {
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data || [];
    },
  });
}

export function useUserCompanies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_companies', user?.id],
    queryFn: async (): Promise<UserCompany[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user companies:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useAddUserCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company: { company_id: string; company_name: string; avg_inspection_minutes: number }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_companies')
        .insert({
          user_id: user.id,
          company_id: company.company_id,
          company_name: company.company_name,
          avg_inspection_minutes: company.avg_inspection_minutes,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_companies'] });
    },
  });
}

export function useRemoveUserCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_companies'] });
    },
  });
}

export function useUpdateUserCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, avg_inspection_minutes }: { id: string; avg_inspection_minutes: number }) => {
      const { error } = await supabase
        .from('user_companies')
        .update({ avg_inspection_minutes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_companies'] });
    },
  });
}
