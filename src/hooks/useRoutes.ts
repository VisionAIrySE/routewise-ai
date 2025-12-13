import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Route, RouteStop, Inspection } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Map database row to frontend Route type
function mapDbToRoute(row: any): Route {
  return {
    id: row.id,
    routeDate: row.route_date,
    plannedCount: row.stops_count || 0,
    completedCount: row.status === 'completed' ? row.stops_count : 0,
    completionRate: row.status === 'completed' ? 100 : 0,
    totalEstDriveTime: Math.round((row.drive_hours || 0) * 60),
    totalDistanceMiles: row.total_miles || 0,
    geographicFocus: row.zones?.join(', ') || '',
    aiRecommended: true,
    userModified: false,
    routeNotes: row.notes || '',
    sessionId: row.id,
  };
}

export function useRoutes(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['routes', dateRange, user?.id],
    queryFn: async (): Promise<Route[]> => {
      if (!user) return [];

      let query = supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('route_date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('route_date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('route_date', format(dateRange.end, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching routes:', error);
        throw error;
      }

      return (data || []).map(mapDbToRoute);
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useMonthRoutes(currentDate: Date) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  return useRoutes({ start: monthStart, end: monthEnd });
}

export function useTodayRoute() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['routes', 'today', user?.id],
    queryFn: async (): Promise<Route | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', user.id)
        .eq('route_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching today route:', error);
        throw error;
      }

      return data ? mapDbToRoute(data) : null;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useRouteById(routeId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['routes', routeId, user?.id],
    queryFn: async (): Promise<Route | null> => {
      if (!user || !routeId) return null;

      const { data, error } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('id', routeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching route:', error);
        throw error;
      }

      return data ? mapDbToRoute(data) : null;
    },
    enabled: !!user && !!routeId,
  });
}

export function useRouteStops(routeId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['route-stops', routeId, user?.id],
    queryFn: async (): Promise<RouteStop[]> => {
      if (!user || !routeId) return [];

      // Get the route's stops_json
      const { data, error } = await supabase
        .from('saved_routes')
        .select('stops_json')
        .eq('id', routeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching route stops:', error);
        throw error;
      }

      if (!data?.stops_json) return [];

      // Parse stops_json and map to RouteStop format
      const stops = Array.isArray(data.stops_json) ? data.stops_json : [];
      
      return stops.map((stop: any, index: number) => ({
        id: stop.id || `stop_${index}`,
        routeId,
        inspectionId: stop.id || '',
        stopOrder: stop.order || index + 1,
        status: 'PLANNED' as const,
        inspection: stop.address ? {
          id: stop.id || `stop_${index}`,
          address_key: stop.id || '',
          street: stop.address || '',
          city: '',
          state: '',
          zip: '',
          fullAddress: stop.address || '',
          company: stop.company as any || 'MIL',
          dueDate: '',
          daysRemaining: stop.days_remaining || 0,
          urgencyTier: stop.urgency as any || 'NORMAL',
          status: 'PENDING' as const,
          claimNumber: stop.name || '',
        } : undefined,
      }));
    },
    enabled: !!user && !!routeId,
  });
}

export function useFixedAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inspections', 'fixed-appointments', user?.id],
    queryFn: async (): Promise<Inspection[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .not('fixed_appointment', 'is', null)
        .order('fixed_appointment', { ascending: true });

      if (error) {
        console.error('Error fetching fixed appointments:', error);
        throw error;
      }

      // Map to Inspection type
      return (data || []).map((row: any) => ({
        id: row.id,
        address_key: row.id,
        street: row.street || '',
        city: row.city || '',
        state: row.state || '',
        zip: row.zip || '',
        fullAddress: row.full_address || `${row.street}, ${row.city}, ${row.state} ${row.zip}`,
        company: row.company_name,
        dueDate: row.due_date || '',
        daysRemaining: 0,
        urgencyTier: row.urgency_tier,
        fixedAppointment: row.fixed_appointment,
        status: row.status,
        claimNumber: row.insured_name || '',
      }));
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}
