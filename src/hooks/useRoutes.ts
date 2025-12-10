import { useQuery } from '@tanstack/react-query';
import { fetchTable, RouteFields, RouteStopFields, InspectionFields, AirtableRecord } from '@/lib/airtable';
import type { Route, RouteStop, Inspection } from '@/lib/mockData';
import { format, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';

function transformRoute(record: AirtableRecord<RouteFields>): Route {
  const fields = record.fields;
  return {
    id: record.id,
    routeDate: fields['Route Date'] || '',
    plannedCount: fields['Planned Count'] ?? 0,
    completedCount: fields['Completed Count'] ?? 0,
    completionRate: fields['Completion Rate'] ?? 0,
    totalEstDriveTime: fields['Total Est Drive Time'] ?? 0,
    totalDistanceMiles: fields['Total Distance Miles'] ?? 0,
    geographicFocus: fields['Geographic Focus'] || '',
    aiRecommended: fields['AI Recommended'] ?? false,
    userModified: fields['User Modified'] ?? false,
    routeNotes: fields['Route Notes'] || '',
    sessionId: fields['Session ID'],
  };
}

function transformInspection(record: AirtableRecord<InspectionFields>): Inspection {
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

export function useRoutes(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['routes', dateRange],
    queryFn: async () => {
      const filterByFormula = dateRange
        ? `AND({Route Date} >= '${format(dateRange.start, 'yyyy-MM-dd')}', {Route Date} <= '${format(dateRange.end, 'yyyy-MM-dd')}')`
        : undefined;
      
      const records = await fetchTable<RouteFields>('Routes', {
        filterByFormula,
        sort: [{ field: 'Route Date', direction: 'desc' }],
      });
      return records.map(transformRoute);
    },
    refetchInterval: 60000,
  });
}

export function useMonthRoutes(currentDate: Date) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  return useRoutes({ start: monthStart, end: monthEnd });
}

export function useTodayRoute() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['routes', 'today'],
    queryFn: async () => {
      const records = await fetchTable<RouteFields>('Routes', {
        filterByFormula: `{Route Date} = '${today}'`,
        maxRecords: 1,
      });
      return records.length > 0 ? transformRoute(records[0]) : null;
    },
    refetchInterval: 60000,
  });
}

export function useRouteById(routeId: string) {
  return useQuery({
    queryKey: ['routes', routeId],
    queryFn: async () => {
      const records = await fetchTable<RouteFields>('Routes', {
        filterByFormula: `RECORD_ID() = '${routeId}'`,
        maxRecords: 1,
      });
      return records.length > 0 ? transformRoute(records[0]) : null;
    },
    enabled: !!routeId,
  });
}

export function useRouteStops(routeId: string) {
  return useQuery({
    queryKey: ['route-stops', routeId],
    queryFn: async () => {
      // Fetch route stops
      const stopRecords = await fetchTable<RouteStopFields>('Route_Stops', {
        filterByFormula: `FIND('${routeId}', ARRAYJOIN({Route}))`,
        sort: [{ field: 'Stop Order', direction: 'asc' }],
      });
      
      // Get inspection IDs from stops
      const inspectionIds = stopRecords
        .map(r => r.fields.Inspection?.[0])
        .filter(Boolean) as string[];
      
      // Fetch inspections if we have IDs
      let inspectionsMap: Record<string, Inspection> = {};
      if (inspectionIds.length > 0) {
        const inspectionRecords = await fetchTable<InspectionFields>('Inspections', {
          filterByFormula: `OR(${inspectionIds.map(id => `RECORD_ID() = '${id}'`).join(', ')})`,
        });
        inspectionsMap = Object.fromEntries(
          inspectionRecords.map(r => [r.id, transformInspection(r)])
        );
      }
      
      // Transform stops with inspection data
      return stopRecords.map(record => {
        const fields = record.fields;
        const inspectionId = fields.Inspection?.[0];
        return {
          id: record.id,
          routeId: fields.Route?.[0] || routeId,
          inspectionId: inspectionId || '',
          stopOrder: fields['Stop Order'] ?? 0,
          status: fields.Status || 'PLANNED',
          inspection: inspectionId ? inspectionsMap[inspectionId] : undefined,
        } as RouteStop;
      });
    },
    enabled: !!routeId,
  });
}

export function useFixedAppointments() {
  return useQuery({
    queryKey: ['inspections', 'fixed-appointments'],
    queryFn: async () => {
      const records = await fetchTable<InspectionFields>('Inspections', {
        filterByFormula: "AND({Company} = 'SIG', {Fixed Appointment} != '')",
        sort: [{ field: 'Fixed Appointment', direction: 'asc' }],
      });
      return records.map(transformInspection);
    },
    refetchInterval: 60000,
  });
}
