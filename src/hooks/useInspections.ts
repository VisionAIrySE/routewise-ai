import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Inspection, Company, UrgencyTier, InspectionStatus } from '@/lib/mockData';
import { startOfWeek, startOfMonth, startOfYear, differenceInDays } from 'date-fns';
import { parseLocalDate, getTodayLocal } from '@/lib/dateUtils';

export interface InspectionFilters {
  company?: Company | 'ALL';
  urgency?: UrgencyTier | 'ALL';
  status?: InspectionStatus | 'ALL';
  search?: string;
}

// Calculate urgency tier based on days remaining
// Critical: 0-3 days or overdue, Urgent: 4-7 days, Soon: 8-15 days, Normal: >15 days
function calculateUrgencyTier(daysRemaining: number): UrgencyTier {
  if (daysRemaining <= 3) return 'CRITICAL';  // 0-3 days or overdue (negative)
  if (daysRemaining <= 7) return 'URGENT';     // 4-7 days
  if (daysRemaining <= 15) return 'SOON';      // 8-15 days
  return 'NORMAL';                              // >15 days
}

// Map database row to frontend Inspection type
function mapDbToInspection(row: any): Inspection {
  const dueDate = row.due_date;
  // Use timezone-safe date parsing
  const dueDateParsed = dueDate ? parseLocalDate(dueDate) : null;
  const today = getTodayLocal();
  const daysRemaining = dueDateParsed 
    ? differenceInDays(dueDateParsed, today) 
    : 999;
  
  // Calculate urgency tier client-side based on actual days remaining
  const urgencyTier = daysRemaining === 999 ? 'NORMAL' : calculateUrgencyTier(daysRemaining);
  
  return {
    id: row.id,
    address_key: row.id,
    street: row.street || '',
    city: row.city || '',
    state: row.state || '',
    zip: row.zip || '',
    fullAddress: row.full_address || `${row.street}, ${row.city}, ${row.state} ${row.zip}`,
    company: row.company_name as Company,
    dueDate: dueDate || '',
    daysRemaining,
    urgencyTier,
    fixedAppointment: row.fixed_appointment || undefined,
    appointmentTime: row.appointment_time || undefined,
    status: row.status as InspectionStatus,
    claimNumber: row.insured_name || '',
    uploadBatchId: row.upload_batch_id || undefined,
  };
}

export function useInspections(filters?: InspectionFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', filters, user?.id],
    queryFn: async (): Promise<Inspection[]> => {
      if (!user) return [];

      let query = supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.company && filters.company !== 'ALL') {
        query = query.eq('company_name', filters.company);
      }
      if (filters?.urgency && filters.urgency !== 'ALL') {
        query = query.eq('urgency_tier', filters.urgency);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inspections:', error);
        throw error;
      }

      let inspections = (data || []).map(mapDbToInspection);

      // Apply search filter client-side
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        inspections = inspections.filter(i => 
          i.fullAddress.toLowerCase().includes(searchLower) ||
          i.claimNumber.toLowerCase().includes(searchLower) ||
          i.city.toLowerCase().includes(searchLower)
        );
      }

      return inspections;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function usePendingInspections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', 'pending', user?.id],
    queryFn: async (): Promise<Inspection[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['PENDING', 'PLANNED'])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching pending inspections:', error);
        throw error;
      }

      return (data || []).map(mapDbToInspection);
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useAllInspections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', 'all', user?.id],
    queryFn: async (): Promise<Inspection[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all inspections:', error);
        throw error;
      }

      return (data || []).map(mapDbToInspection);
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useInspectionStats() {
  const { user } = useAuth();

  const { data: inspections, isLoading, error } = useQuery({
    queryKey: ['inspections', 'stats', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('inspections')
        .select('urgency_tier')
        .eq('user_id', user.id)
        .eq('status', 'PENDING');

      if (error) {
        console.error('Error fetching inspection stats:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
  
  const stats = {
    critical: inspections?.filter(i => i.urgency_tier === 'CRITICAL').length ?? 0,
    urgent: inspections?.filter(i => i.urgency_tier === 'URGENT').length ?? 0,
    soon: inspections?.filter(i => i.urgency_tier === 'SOON').length ?? 0,
    normal: inspections?.filter(i => i.urgency_tier === 'NORMAL').length ?? 0,
    total: inspections?.length ?? 0,
  };
  
  return { stats, isLoading, error, allInspections: inspections?.map(mapDbToInspection) };
}

export function useWeeklyStats() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['inspections', 'weekly-stats', user?.id],
    queryFn: async () => {
      if (!user) return { completed: 0, total: 0 };

      const weekStart = startOfWeek(new Date()).toISOString().split('T')[0];

      const [completedResult, totalResult] = await Promise.all([
        supabase
          .from('inspections')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'COMPLETED')
          .gte('completed_date', weekStart),
        supabase
          .from('inspections')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      return {
        completed: completedResult.count ?? 0,
        total: totalResult.count ?? 0,
      };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
  
  return { 
    completed: data?.completed ?? 0, 
    total: data?.total ?? 0, 
    isLoading 
  };
}

export function useCompletionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', 'completion-stats', user?.id],
    queryFn: async () => {
      if (!user) {
        return { 
          thisWeek: 0, 
          thisMonth: 0, 
          thisYear: 0, 
          total: 0, 
          byCompany: { MIL: 0, IPI: 0, SIG: 0 } 
        };
      }

      const now = new Date();
      const weekStart = startOfWeek(now).toISOString().split('T')[0];
      const monthStart = startOfMonth(now).toISOString().split('T')[0];
      const yearStart = startOfYear(now).toISOString().split('T')[0];

      // Fetch all completed inspections for this year
      const { data, error } = await supabase
        .from('inspections')
        .select('id, company_name, completed_date')
        .eq('user_id', user.id)
        .eq('status', 'COMPLETED')
        .gte('completed_date', yearStart);

      if (error) {
        console.error('Error fetching completion stats:', error);
        throw error;
      }

      const completions = data || [];

      // Calculate stats
      const thisWeek = completions.filter(c => c.completed_date >= weekStart).length;
      const thisMonth = completions.filter(c => c.completed_date >= monthStart).length;
      const thisYear = completions.length;

      // Get total all-time completions
      const { count: total } = await supabase
        .from('inspections')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'COMPLETED');

      // Count by company
      const byCompany = {
        MIL: completions.filter(c => c.company_name === 'MIL').length,
        IPI: completions.filter(c => c.company_name === 'IPI').length,
        SIG: completions.filter(c => c.company_name === 'SIG').length,
      };

      return { 
        thisWeek, 
        thisMonth, 
        thisYear, 
        total: total ?? 0, 
        byCompany 
      };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useUpcomingAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', 'upcoming-appointments', user?.id],
    queryFn: async (): Promise<Inspection[]> => {
      if (!user) return [];

      // Get today's date at midnight in ISO format for database comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .not('fixed_appointment', 'is', null)
        .gte('fixed_appointment', todayISO) // Only get today and future appointments
        .order('fixed_appointment', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw error;
      }

      return (data || []).map(mapDbToInspection);
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}
