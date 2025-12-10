// Airtable API helper
const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;

// Debug: Log configuration status (remove in production)
if (!BASE_ID) {
  console.error('VITE_AIRTABLE_BASE_ID is not configured. Please set it in your environment variables.');
}
if (!API_KEY) {
  console.error('VITE_AIRTABLE_API_KEY is not configured. Please set it in your environment variables.');
}

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
  const params = new URLSearchParams();
  
  if (options?.filterByFormula) {
    params.set('filterByFormula', options.filterByFormula);
  }
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (options?.maxRecords) {
    params.set('maxRecords', String(options.maxRecords));
  }
  if (options?.view) {
    params.set('view', options.view);
  }

  if (!BASE_ID || !API_KEY) {
    throw new Error('Airtable configuration missing. Please set VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_KEY in environment variables.');
  }

  const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(tableName)}?${params}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Airtable API error:', error);
    throw new Error(`Airtable API error: ${response.status}`);
  }

  const data = await response.json();
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
