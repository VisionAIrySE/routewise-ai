import { useQuery } from '@tanstack/react-query';
import { fetchTable, InspectionFields, AirtableRecord } from '@/lib/airtable';
import type { Inspection, Company, UrgencyTier, InspectionStatus } from '@/lib/mockData';

export interface InspectionFilters {
  company?: Company | 'ALL';
  urgency?: UrgencyTier | 'ALL';
  status?: InspectionStatus | 'ALL';
  search?: string;
}

function buildFilterFormula(filters?: InspectionFilters): string | undefined {
  const conditions: string[] = [];
  
  if (filters?.company && filters.company !== 'ALL') {
    conditions.push(`{Company} = '${filters.company}'`);
  }
  if (filters?.urgency && filters.urgency !== 'ALL') {
    conditions.push(`{Urgency Tier} = '${filters.urgency}'`);
  }
  if (filters?.status && filters.status !== 'ALL') {
    conditions.push(`{Status} = '${filters.status}'`);
  }
  
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return `AND(${conditions.join(', ')})`;
}

function transformRecord(record: AirtableRecord<InspectionFields>): Inspection {
  const fields = record.fields;
  return {
    id: record.id,
    address_key: fields.address_key || record.id,
    street: fields.Street || '',
    city: fields.City || '',
    state: fields.State || '',
    zip: fields.Zip || '',
    fullAddress: fields['Full Address'] || `${fields.Street}, ${fields.City}, ${fields.State} ${fields.Zip}`,
    company: fields.Company,
    dueDate: fields['Due Date'] || '',
    daysRemaining: fields['Days Remaining'] ?? 999,
    urgencyTier: fields['Urgency Tier'] || 'NORMAL',
    fixedAppointment: fields['Fixed Appointment'],
    status: fields.Status || 'PENDING',
    claimNumber: fields['Claim Number'] || '',
    uploadBatchId: fields['Upload Batch ID'],
  };
}

export function useInspections(filters?: InspectionFilters) {
  return useQuery({
    queryKey: ['inspections', filters],
    queryFn: async () => {
      const records = await fetchTable<InspectionFields>('Inspections', {
        filterByFormula: buildFilterFormula(filters),
        sort: [{ field: 'Days Remaining', direction: 'asc' }],
      });
      return records.map(transformRecord);
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function usePendingInspections() {
  return useQuery({
    queryKey: ['inspections', 'pending'],
    queryFn: async () => {
      // Fetch all inspections that are not completed
      const records = await fetchTable<InspectionFields>('Inspections', {
        filterByFormula: "{Status} != 'COMPLETED'",
        sort: [{ field: 'Days Remaining', direction: 'asc' }],
      });
      return records.map(transformRecord);
    },
    refetchInterval: 60000,
  });
}

export function useAllInspections() {
  return useQuery({
    queryKey: ['inspections', 'all'],
    queryFn: async () => {
      const records = await fetchTable<InspectionFields>('Inspections', {
        sort: [{ field: 'Days Remaining', direction: 'asc' }],
      });
      return records.map(transformRecord);
    },
    refetchInterval: 60000,
  });
}

export function useInspectionStats() {
  // Use all inspections for stats since Status field may not be set
  const { data: inspections, isLoading, error } = useAllInspections();
  
  // Filter to non-completed for pending counts
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
