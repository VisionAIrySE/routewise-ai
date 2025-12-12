import { useQuery } from '@tanstack/react-query';
import type { Inspection, Company, UrgencyTier, InspectionStatus } from '@/lib/mockData';

export interface InspectionFilters {
  company?: Company | 'ALL';
  urgency?: UrgencyTier | 'ALL';
  status?: InspectionStatus | 'ALL';
  search?: string;
}

// NOTE: Airtable data fetching has been removed. 
// Inspection data now comes from n8n webhook responses after CSV uploads.
// These hooks return empty/placeholder data until n8n integration is updated.

export function useInspections(filters?: InspectionFilters) {
  return useQuery({
    queryKey: ['inspections', filters],
    queryFn: async (): Promise<Inspection[]> => {
      // Data now comes from n8n webhook - return empty for now
      return [];
    },
    refetchInterval: 60000,
  });
}

export function usePendingInspections() {
  return useQuery({
    queryKey: ['inspections', 'pending'],
    queryFn: async (): Promise<Inspection[]> => {
      return [];
    },
    refetchInterval: 60000,
  });
}

export function useAllInspections() {
  return useQuery({
    queryKey: ['inspections', 'all'],
    queryFn: async (): Promise<Inspection[]> => {
      return [];
    },
    refetchInterval: 60000,
  });
}

export function useInspectionStats() {
  const { data: inspections, isLoading, error } = useAllInspections();
  
  const pending = inspections?.filter(i => i.status !== 'COMPLETED') ?? [];
  
  const stats = {
    critical: pending.filter(i => i.urgencyTier === 'CRITICAL').length,
    urgent: pending.filter(i => i.urgencyTier === 'URGENT').length,
    soon: pending.filter(i => i.urgencyTier === 'SOON').length,
    total: pending.length,
  };
  
  return { stats, isLoading, error, allInspections: inspections };
}

export function useWeeklyStats() {
  const { data: inspections, isLoading } = useAllInspections();
  
  const completed = inspections?.filter(i => i.status === 'COMPLETED').length ?? 0;
  const total = inspections?.length ?? 0;
  
  return { completed, total, isLoading };
}

export function useCompletionStats() {
  return useQuery({
    queryKey: ['inspections', 'completion-stats'],
    queryFn: async () => {
      // Data now comes from n8n webhook - return placeholder
      return { 
        thisWeek: 0, 
        thisMonth: 0, 
        thisYear: 0, 
        total: 0, 
        byCompany: { MIL: 0, IPI: 0, SIG: 0 } 
      };
    },
    refetchInterval: 60000,
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['inspections', 'upcoming-appointments'],
    queryFn: async (): Promise<Inspection[]> => {
      return [];
    },
    refetchInterval: 60000,
  });
}
