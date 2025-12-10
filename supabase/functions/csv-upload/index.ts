import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

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

// Parse XLSX content
function parseXLSX(arrayBuffer: ArrayBuffer): Record<string, string>[] {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    
    if (jsonData.length < 2) return [];
    
    const headers = jsonData[0].map(h => String(h || '').trim());
    const records: Record<string, string>[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = String(row[index] ?? '').trim();
      });
      records.push(record);
    }
    
    console.log('XLSX Headers found:', headers);
    console.log('First record sample:', records[0]);
    
    return records;
  } catch (error) {
    console.error('XLSX parsing error:', error);
    return [];
  }
}

// Detect company from filename and content
function detectCompany(records: Record<string, string>[], filename: string): string {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('sig')) return 'SIG';
  if (lowerFilename.includes('ipi')) return 'IPI';
  if (lowerFilename.includes('mil')) return 'MIL';
  
  if (records.length === 0) return 'Unknown';
  
  const firstRecord = records[0];
  const allKeys = Object.keys(firstRecord).join(' ').toLowerCase();
  const allValues = Object.values(firstRecord).join(' ').toLowerCase();
  
  if (allKeys.includes('sig') || allValues.includes('sig')) return 'SIG';
  if (allKeys.includes('ipi') || allValues.includes('ipi')) return 'IPI';
  if (allKeys.includes('mil') || allValues.includes('mil')) return 'MIL';
  
  if (Object.keys(firstRecord).some(k => k.toLowerCase().includes('appointment'))) {
    return 'SIG';
  }
  
  return 'MIL';
}

// Transform records to Airtable format
function transformToAirtableFormat(records: Record<string, string>[], company: string): { fields: Record<string, unknown> }[] {
  const today = new Date().toISOString().split('T')[0];
  const batchId = `${company}-${today.replace(/-/g, '')}`;
  
  console.log('Transforming records. Sample keys:', Object.keys(records[0] || {}));
  
  return records.map((record, index) => {
    const findField = (possibleNames: string[]): string => {
      for (const name of possibleNames) {
        const key = Object.keys(record).find(k => 
          k.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(k.toLowerCase())
        );
        if (key && record[key]) return record[key];
      }
      return '';
    };
    
    const street = findField(['Street', 'Address', 'Property Address', 'Property', 'Location']);
    const city = findField(['City', 'Town']);
    const state = findField(['State', 'ST']) || 'OR';
    const zip = findField(['Zip', 'Zip Code', 'ZIP', 'Postal']);
    const insuredName = findField(['Insured Name', 'Insured', 'Policyholder', 'Name', 'Customer', 'Owner']);
    const dueDate = findField(['Due Date', 'Due', 'Deadline', 'Date Due']);
    const fixedAppointment = findField(['Fixed Appointment', 'Appointment Date', 'Appt Date']);
    const notes = findField(['Notes', 'Comments', 'Remarks']);
    const claimNumber = findField(['Claim', 'Claim Number', 'Claim #', 'Policy', 'Policy Number']);
    
    if (!street) {
      console.log(`Skipping record ${index}: no street address found`);
      return null;
    }
    
    // Build fields object, only including non-empty values
    // Note: 'Full Address' is a computed field in Airtable, don't include it
    const fields: Record<string, unknown> = {
      'Inspection ID': `${company}-${today.replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}`,
      'Company': company,
      'Street': street,
      'State': state,
      'Duration Minutes': company === 'SIG' ? 90 : 15,
      'Status': 'Pending',
      'Date Added': today,
      'Upload Batch ID': batchId,
    };
    
    if (city) fields['City'] = city;
    if (zip) fields['Zip'] = parseInt(zip) || undefined;
    if (insuredName) fields['Insured Name'] = insuredName;
    if (dueDate) fields['Due Date'] = dueDate;
    if (fixedAppointment) fields['Fixed Appointment'] = fixedAppointment;
    if (notes) fields['Notes'] = notes;
    if (claimNumber) fields['Claim Number'] = claimNumber;
    
    return { fields };
  }).filter((r): r is { fields: Record<string, unknown> } => r !== null);
}

serve(async (req) => {
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

    const filename = file.name.toLowerCase();
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    let records: Record<string, string>[];
    
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer();
      records = parseXLSX(arrayBuffer);
      console.log(`Parsed ${records.length} records from Excel file`);
    } else {
      const content = await file.text();
      records = parseCSV(content);
      console.log(`Parsed ${records.length} records from CSV file`);
    }
    
    if (records.length === 0) {
      throw new Error('No valid records found in file');
    }

    const company = detectCompany(records, file.name);
    console.log(`Detected company: ${company}, records: ${records.length}`);
    
    const airtableRecords = transformToAirtableFormat(records, company);
    console.log(`Transformed ${airtableRecords.length} records for Airtable`);

    if (airtableRecords.length === 0) {
      throw new Error('No records could be mapped to Airtable format. Check that your file has address columns.');
    }

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
        throw new Error(`Failed to create records: ${response.status} - ${errorText}`);
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
