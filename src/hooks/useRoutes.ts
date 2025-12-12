import { useQuery } from '@tanstack/react-query';
import type { Route, RouteStop, Inspection } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// NOTE: Airtable data fetching has been removed.
// Route data now comes from n8n webhook responses and localStorage.
// These hooks return empty/placeholder data until n8n integration is updated.

export function useRoutes(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['routes', dateRange],
    queryFn: async (): Promise<Route[]> => {
      // Data now comes from n8n webhook - return empty for now
      return [];
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
  return useQuery({
    queryKey: ['routes', 'today'],
    queryFn: async (): Promise<Route | null> => {
      return null;
    },
    refetchInterval: 60000,
  });
}

export function useRouteById(routeId: string) {
  return useQuery({
    queryKey: ['routes', routeId],
    queryFn: async (): Promise<Route | null> => {
      return null;
    },
    enabled: !!routeId,
  });
}

export function useRouteStops(routeId: string) {
  return useQuery({
    queryKey: ['route-stops', routeId],
    queryFn: async (): Promise<RouteStop[]> => {
      return [];
    },
    enabled: !!routeId,
  });
}

export function useFixedAppointments() {
  return useQuery({
    queryKey: ['inspections', 'fixed-appointments'],
    queryFn: async (): Promise<Inspection[]> => {
      return [];
    },
    refetchInterval: 60000,
  });
}
