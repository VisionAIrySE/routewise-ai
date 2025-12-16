import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyProfile {
  id: string;
  code: string;
  name: string;
  default_duration_minutes: number | null;
  high_value_duration_minutes: number | null;
  appointment_type: string | null;
  column_mappings: Record<string, string> | null;
  column_fingerprint: string[] | null;
  created_at: string;
  updated_at: string;
}

interface SaveCompanyProfileParams {
  code: string;
  name: string;
  column_fingerprint: string[];
  column_mappings: Record<string, string>;
  default_duration_minutes: number;
  high_value_duration_minutes: number;
  appointment_type: 'none' | 'call_ahead' | 'date_only' | 'datetime';
}

export function useCompanyProfiles() {
  return useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as CompanyProfile[];
    }
  });
}

export function useCompanyProfileByCode(code: string | null) {
  return useQuery({
    queryKey: ['company-profile', code],
    queryFn: async () => {
      if (!code) return null;
      
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as CompanyProfile;
    },
    enabled: !!code
  });
}

export function useSaveCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveCompanyProfileParams) => {
      const { data, error } = await supabase
        .from('company_profiles')
        .upsert({
          code: params.code.toUpperCase(),
          name: params.name,
          column_fingerprint: params.column_fingerprint,
          column_mappings: params.column_mappings,
          default_duration_minutes: params.default_duration_minutes,
          high_value_duration_minutes: params.high_value_duration_minutes,
          appointment_type: params.appointment_type,
          updated_at: new Date().toISOString()
        }, { onConflict: 'code' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profiles'] });
    }
  });
}

/**
 * Detect company from file headers by matching against stored fingerprints
 */
export function useDetectCompanyFromHeaders() {
  const { data: profiles } = useCompanyProfiles();

  return (headers: string[]): CompanyProfile | null => {
    if (!profiles) return null;
    
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const headerSet = new Set(normalizedHeaders);

    for (const profile of profiles) {
      if (!profile.column_fingerprint || profile.column_fingerprint.length === 0) continue;

      const fingerprint = profile.column_fingerprint.map(h => h.toLowerCase().trim());
      const matches = fingerprint.filter(h => headerSet.has(h));
      const matchRatio = matches.length / fingerprint.length;

      // 90%+ match = confident identification
      if (matchRatio >= 0.9) {
        return profile;
      }
    }

    return null;
  };
}
