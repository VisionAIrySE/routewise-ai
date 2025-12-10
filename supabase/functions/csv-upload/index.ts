import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = Deno.env.get('VITE_AIRTABLE_BASE_ID');
const API_KEY = Deno.env.get('VITE_AIRTABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse CSV content
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

// Detect company from CSV content
function detectCompany(records: Record<string, string>[]): string {
  if (records.length === 0) return 'Unknown';
  
  const firstRecord = records[0];
  const allKeys = Object.keys(firstRecord).join(' ').toLowerCase();
  const allValues = Object.values(firstRecord).join(' ').toLowerCase();
  
  if (allKeys.includes('sig') || allValues.includes('sig')) return 'SIG';
  if (allKeys.includes('ipi') || allValues.includes('ipi')) return 'IPI';
  if (allKeys.includes('mil') || allValues.includes('mil')) return 'MIL';
  
  // Check for fixed appointment field (SIG specific)
  if (Object.keys(firstRecord).some(k => k.toLowerCase().includes('appointment'))) {
    return 'SIG';
  }
  
  return 'MIL'; // Default
}

// Transform CSV records to Airtable format
function transformToAirtableFormat(records: Record<string, string>[], company: string): any[] {
  const today = new Date().toISOString().split('T')[0];
  const batchId = `${company}-${today.replace(/-/g, '')}`;
  
  return records.map((record, index) => {
    // Map common field names to our Airtable schema
    const street = record['Street'] || record['Address'] || record['Property Address'] || '';
    const city = record['City'] || '';
    const state = record['State'] || 'OR';
    const zip = record['Zip'] || record['Zip Code'] || record['ZIP'] || '';
    const insuredName = record['Insured Name'] || record['Policyholder'] || record['Name'] || '';
    const dueDate = record['Due Date'] || record['Deadline'] || '';
    const fixedAppointment = record['Fixed Appointment'] || record['Appointment'] || '';
    const notes = record['Notes'] || record['Comments'] || '';
    
    return {
      fields: {
        'Inspection ID': `${company}-${today.replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}`,
        'Company': company,
        'Street': street,
        'City': city,
        'State': state,
        'Zip': parseInt(zip) || zip,
        'Insured Name': insuredName,
        'Due Date': dueDate,
        'Duration Minutes': company === 'SIG' ? 90 : 15,
        'Fixed Appointment': fixedAppointment || undefined,
        'Status': 'Pending',
        'Date Added': today,
        'Upload Batch ID': batchId,
        'Notes': notes || (fixedAppointment ? 'Scheduled appointment' : undefined),
        'Full Address': `${street}, ${city}, ${state} ${zip}`.trim(),
        'Needs Call Ahead': record['Call Ahead'] === 'true' || record['Needs Call Ahead'] === 'true',
      }
    };
  }).filter(r => r.fields.Street); // Filter out empty records
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BASE_ID || !API_KEY) {
      console.error('Airtable configuration missing');
      throw new Error('Airtable configuration missing');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    const content = await file.text();
    const records = parseCSV(content);
    
    if (records.length === 0) {
      throw new Error('No valid records found in CSV');
    }

    const company = detectCompany(records);
    console.log(`Detected company: ${company}, records: ${records.length}`);
    
    const airtableRecords = transformToAirtableFormat(records, company);
    console.log(`Transformed ${airtableRecords.length} records for Airtable`);

    // Upload to Airtable in batches of 10 (Airtable limit)
    const batchSize = 10;
    let totalCreated = 0;
    
    for (let i = 0; i < airtableRecords.length; i += batchSize) {
      const batch = airtableRecords.slice(i, i + batchSize);
      
      const response = await fetch(`${AIRTABLE_API}/${BASE_ID}/Inspections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: batch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable create error:', response.status, errorText);
        throw new Error(`Failed to create records: ${response.status}`);
      }

      const result = await response.json();
      totalCreated += result.records?.length || 0;
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: created ${result.records?.length || 0} records`);
    }

    console.log(`Successfully created ${totalCreated} records`);

    return new Response(JSON.stringify({
      success: true,
      records_processed: totalCreated,
      company_detected: company,
      filename: file.name,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in csv-upload function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
