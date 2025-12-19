import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment, AppointmentFormData } from '@/types/appointment';
import { format, startOfDay, endOfDay, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Map database row to frontend Appointment type
function mapDbToAppointment(row: any): Appointment {
  return {
    id: row.id,
    user_id: row.user_id,
    inspection_id: row.inspection_id,
    appointment_date: row.appointment_date,
    appointment_time: row.appointment_time,
    duration_minutes: row.duration_minutes || 30,
    address: row.address,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    appointment_type: row.appointment_type,
    title: row.title,
    notes: row.notes,
    status: row.status || 'scheduled',
    created_at: row.created_at,
    updated_at: row.updated_at,
    inspection: row.inspection ? {
      id: row.inspection.id,
      insured_name: row.inspection.insured_name,
      street: row.inspection.street,
      city: row.inspection.city,
      state: row.inspection.state,
      company_name: row.inspection.company_name,
    } : undefined,
  };
}

// Fetch all appointments for a date range
export function useAppointments(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['appointments', user?.id, dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          inspection:inspections(id, insured_name, street, city, state, company_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true });

      if (dateRange) {
        query = query
          .gte('appointment_date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('appointment_date', format(dateRange.end, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      return (data || []).map(mapDbToAppointment);
    },
    enabled: !!user,
  });
}

// Fetch appointments for a specific month (for calendar view)
export function useMonthAppointments(currentDate: Date) {
  const start = startOfMonth(subMonths(currentDate, 1));
  const end = endOfMonth(addMonths(currentDate, 1));
  
  return useAppointments({ start, end });
}

// Fetch appointments for a specific date
export function useDateAppointments(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['appointments', 'date', user?.id, dateStr],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          inspection:inspections(id, insured_name, street, city, state, company_name)
        `)
        .eq('user_id', user.id)
        .eq('appointment_date', dateStr)
        .eq('status', 'scheduled')
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching date appointments:', error);
        throw error;
      }

      return (data || []).map(mapDbToAppointment);
    },
    enabled: !!user,
  });
}

// Fetch upcoming appointments (from today onwards)
export function useUpcomingNewAppointments(limit = 10) {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['appointments', 'upcoming', user?.id, limit],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          inspection:inspections(id, insured_name, street, city, state, company_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw error;
      }

      return (data || []).map(mapDbToAppointment);
    },
    enabled: !!user,
  });
}

// Fetch appointment for a specific inspection
export function useInspectionAppointment(inspectionId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['appointments', 'inspection', user?.id, inspectionId],
    queryFn: async (): Promise<Appointment | null> => {
      if (!user || !inspectionId) return null;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('inspection_id', inspectionId)
        .eq('status', 'scheduled')
        .maybeSingle();

      if (error) {
        console.error('Error fetching inspection appointment:', error);
        throw error;
      }

      return data ? mapDbToAppointment(data) : null;
    },
    enabled: !!user && !!inspectionId,
  });
}

// Create a new appointment (or update existing if inspection already has one)
export function useCreateAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      if (!user) throw new Error('Not authenticated');

      // If this is an inspection appointment, check if one already exists
      if (data.appointment_type === 'inspection' && data.inspection_id) {
        const { data: existing } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_id', user.id)
          .eq('inspection_id', data.inspection_id)
          .eq('status', 'scheduled')
          .maybeSingle();

        // If appointment exists, update it instead of creating duplicate
        if (existing) {
          const { data: result, error } = await supabase
            .from('appointments')
            .update({
              appointment_date: format(data.appointment_date, 'yyyy-MM-dd'),
              appointment_time: data.appointment_time || null,
              duration_minutes: data.duration_minutes,
              notes: data.notes || null,
            })
            .eq('id', existing.id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          return result;
        }
      }

      const appointmentData = {
        user_id: user.id,
        appointment_date: format(data.appointment_date, 'yyyy-MM-dd'),
        appointment_time: data.appointment_time || null,
        duration_minutes: data.duration_minutes,
        appointment_type: data.appointment_type,
        inspection_id: data.appointment_type === 'inspection' ? data.inspection_id : null,
        title: data.appointment_type === 'adhoc' ? data.title : null,
        address: data.appointment_type === 'adhoc' ? data.address : null,
        city: data.appointment_type === 'adhoc' ? data.city : null,
        notes: data.notes || null,
        status: 'scheduled',
      };

      const { data: result, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// Update an existing appointment
export function useUpdateAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) => {
      if (!user) throw new Error('Not authenticated');

      const updateData: any = {};
      if (data.appointment_date) {
        updateData.appointment_date = format(data.appointment_date, 'yyyy-MM-dd');
      }
      if (data.appointment_time !== undefined) {
        updateData.appointment_time = data.appointment_time;
      }
      if (data.duration_minutes !== undefined) {
        updateData.duration_minutes = data.duration_minutes;
      }
      if (data.title !== undefined) {
        updateData.title = data.title;
      }
      if (data.address !== undefined) {
        updateData.address = data.address;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      const { data: result, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// Cancel an appointment
export function useCancelAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// Complete an appointment
export function useCompleteAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
