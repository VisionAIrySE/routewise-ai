import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { RouteStop, RouteDay, RouteOptimizerResponse } from '@/lib/routeUtils';

export interface SavedRouteDB {
  id: string;
  user_id: string;
  planning_session_id: string;
  route_date: string;
  day_of_week: number | null;
  route_name: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  stops_count: number;
  total_miles: number | null;
  total_hours: number | null;
  drive_hours: number | null;
  inspection_hours: number | null;
  fuel_cost: number | null;
  zones: string[] | null;
  start_time: string | null;
  finish_time: string | null;
  stops_json: RouteStop[];
  notes: string | null;
  original_request: string | null;
  hours_requested: number | null;
  location_filter: string | null;
  exclusions: string[] | null;
  anchor_stop_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useSavedRoutes(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-routes', dateRange?.start?.toISOString(), dateRange?.end?.toISOString(), user?.id],
    queryFn: async (): Promise<SavedRouteDB[]> => {
      if (!user) return [];

      let query = supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('route_date', { ascending: true });

      if (dateRange) {
        query = query
          .gte('route_date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('route_date', format(dateRange.end, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching saved routes:', error);
        throw error;
      }

      return (data || []).map(row => ({
        ...row,
        stops_json: Array.isArray(row.stops_json) ? row.stops_json : [],
      })) as SavedRouteDB[];
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export function useMonthSavedRoutes(currentDate: Date) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  return useSavedRoutes({ start: monthStart, end: monthEnd });
}

export function useSavedRouteById(routeId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-route', routeId, user?.id],
    queryFn: async (): Promise<SavedRouteDB | null> => {
      if (!user || !routeId) return null;

      const { data, error } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('id', routeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching saved route:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        stops_json: Array.isArray(data.stops_json) ? data.stops_json : [],
      } as SavedRouteDB;
    },
    enabled: !!user && !!routeId,
  });
}

export function useUpdateRouteStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: SavedRouteDB['status'] }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_routes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', routeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-routes'] });
      queryClient.invalidateQueries({ queryKey: ['saved-route'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (routeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_routes')
        .delete()
        .eq('id', routeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-routes'] });
    },
  });
}

export function useDuplicateRoute() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ routeId, newDate }: { routeId: string; newDate: Date }) => {
      if (!user) throw new Error('Not authenticated');

      // Fetch the original route
      const { data: original, error: fetchError } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('id', routeId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !original) throw fetchError || new Error('Route not found');

      // Create a duplicate with new date
      const { error: insertError } = await supabase
        .from('saved_routes')
        .insert({
          user_id: user.id,
          planning_session_id: original.planning_session_id,
          route_date: format(newDate, 'yyyy-MM-dd'),
          day_of_week: newDate.getDay(),
          route_name: original.route_name ? `${original.route_name} (Copy)` : null,
          status: 'planned',
          stops_count: original.stops_count,
          total_miles: original.total_miles,
          total_hours: original.total_hours,
          drive_hours: original.drive_hours,
          inspection_hours: original.inspection_hours,
          fuel_cost: original.fuel_cost,
          zones: original.zones,
          start_time: original.start_time,
          finish_time: original.finish_time,
          stops_json: original.stops_json,
          notes: original.notes,
          original_request: original.original_request,
          hours_requested: original.hours_requested,
          location_filter: original.location_filter,
          exclusions: original.exclusions,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-routes'] });
    },
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      route, 
      fullResponse, 
      originalRequest 
    }: { 
      route: RouteDay; 
      fullResponse?: RouteOptimizerResponse; 
      originalRequest?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Parse date from route
      const routeDate = route.date || fullResponse?.query_date || new Date().toISOString().split('T')[0];
      const parsedDate = new Date(routeDate);
      
      // Extract zones from summary
      const zones = route.summary?.zones || [];

      const { data, error } = await supabase
        .from('saved_routes')
        .insert({
          user_id: user.id,
          route_date: routeDate,
          day_of_week: parsedDate.getDay(),
          route_name: route.day || null,
          status: 'planned',
          stops_count: route.stops?.length || 0,
          total_miles: route.summary?.total_distance_miles || null,
          total_hours: route.summary?.total_route_hours || null,
          drive_hours: route.summary?.total_drive_hours || null,
          fuel_cost: route.summary?.estimated_fuel || null,
          zones: zones.length > 0 ? zones : null,
          start_time: route.stops?.[0]?.scheduled_time || null,
          finish_time: route.stops?.[route.stops.length - 1]?.scheduled_time || null,
          stops_json: route.stops || [],
          original_request: originalRequest || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return { routeId: data?.id };
    },
    onSuccess: () => {
      // Invalidate all route-related queries to refresh calendar and sidebar
      queryClient.invalidateQueries({ queryKey: ['saved-routes'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
