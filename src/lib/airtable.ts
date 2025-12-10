// Airtable API helper via Edge Function proxy
import { supabase } from '@/integrations/supabase/client';

export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface FetchOptions {
  filterByFormula?: string;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  maxRecords?: number;
  view?: string;
}

export async function fetchTable<T>(
  tableName: string,
  options?: FetchOptions
): Promise<AirtableRecord<T>[]> {
  const { data, error } = await supabase.functions.invoke('airtable-proxy', {
    body: {
      tableName,
      filterByFormula: options?.filterByFormula,
      sort: options?.sort,
      maxRecords: options?.maxRecords,
      view: options?.view,
    },
  });

  if (error) {
    console.error('Airtable proxy error:', error);
    throw new Error(`Airtable API error: ${error.message}`);
  }

  if (data.error) {
    console.error('Airtable API error:', data.error);
    throw new Error(data.error);
  }

  return data.records;
}

// Airtable field types for each table
export interface InspectionFields {
  address_key: string;
  Street: string;
  City: string;
  State: string;
  Zip: string;
  'Full Address': string;
  Company: 'MIL' | 'IPI' | 'SIG';
  'Due Date': string;
  'Days Remaining': number;
  'Urgency Tier': 'CRITICAL' | 'URGENT' | 'SOON' | 'NORMAL';
  'Fixed Appointment'?: string;
  Status: 'PENDING' | 'PLANNED' | 'COMPLETED';
  'Claim Number': string;
  'Upload Batch ID'?: string;
}

export interface RouteFields {
  route_id: number;
  'Route Date': string;
  'Planned Count': number;
  'Completed Count': number;
  'Completion Rate': number;
  'Total Est Drive Time': number;
  'Total Distance Miles': number;
  'Geographic Focus': string;
  'AI Recommended': boolean;
  'User Modified': boolean;
  'Route Notes': string;
  'Session ID'?: string;
}

export interface RouteStopFields {
  stop_id: number;
  Route: string[];
  Inspection: string[];
  'Stop Order': number;
  Status: 'PLANNED' | 'COMPLETED' | 'SKIPPED';
}
