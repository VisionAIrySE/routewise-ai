import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfileSettings {
  id: string;
  user_id: string;
  home_address: string | null;
  home_city: string | null;
  home_state: string | null;
  home_zip: string | null;
  home_lat: number | null;
  home_lng: number | null;
  vehicle_mpg: number;
  fuel_cost_per_gallon: number;
  default_available_hours: number;
  preferred_start_time: string;
  preferred_end_time: string;
  max_drive_minutes: number;
  drive_time_buffer: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  code: string;
  name: string;
  default_duration_minutes: number | null;
  high_value_duration_minutes: number | null;
  appointment_type: string | null;
}

export interface UserCompanySetting {
  id: string;
  user_id: string;
  company_code: string;
  duration_minutes: number | null;
  is_active: boolean;
}

export function useUserProfileSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile-settings', user?.id],
    queryFn: async (): Promise<UserProfileSettings | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile settings:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateUserProfileSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfileSettings>) => {
      if (!user) throw new Error('No user');

      // Check if profile exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            home_address: updates.home_address || '',
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-settings'] });
    },
  });
}

export function useCompanyProfiles() {
  return useQuery({
    queryKey: ['company-profiles'],
    queryFn: async (): Promise<CompanyProfile[]> => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('code');

      if (error) {
        console.error('Error fetching company profiles:', error);
        throw error;
      }

      return data || [];
    },
  });
}

export function useUserCompanySettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-company-settings', user?.id],
    queryFn: async (): Promise<UserCompanySetting[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_company_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user company settings:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useUpdateUserCompanySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: { company_code: string; duration_minutes: number }[]) => {
      if (!user) throw new Error('No user');

      // Upsert each setting
      for (const setting of settings) {
        const { data: existing } = await supabase
          .from('user_company_settings')
          .select('id')
          .eq('user_id', user.id)
          .eq('company_code', setting.company_code)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_company_settings')
            .update({ duration_minutes: setting.duration_minutes })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('user_company_settings')
            .insert({
              user_id: user.id,
              company_code: setting.company_code,
              duration_minutes: setting.duration_minutes,
              is_active: true,
            });
        }
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-company-settings'] });
    },
  });
}
