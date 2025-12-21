// Appointment types for the new appointments table

export type AppointmentType = 'inspection' | 'adhoc';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  user_id: string;
  inspection_id: string | null;
  appointment_date: string;
  appointment_time: string | null;
  duration_minutes: number;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  appointment_type: AppointmentType;
  title: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Direct fields on appointments table (populated by n8n from inspection data)
  insured_name: string | null;
  company_name: string | null;
  urgency: string | null;
  // Legacy: virtual inspection object for backward compatibility with UI
  inspection?: {
    id: string;
    insured_name: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    company_name: string | null;
  };
}

export interface AppointmentFormData {
  appointment_type: AppointmentType;
  appointment_date: Date;
  appointment_time: string;
  duration_minutes: number;
  inspection_id?: string;
  title?: string;
  address?: string;
  city?: string;
  notes?: string;
}
