import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AIRTABLE_API = 'https://api.airtable.com/v0';
const BASE_ID = Deno.env.get('VITE_AIRTABLE_BASE_ID');
const API_KEY = Deno.env.get('VITE_AIRTABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BASE_ID || !API_KEY) {
      console.error('Airtable configuration missing:', { BASE_ID: !!BASE_ID, API_KEY: !!API_KEY });
      throw new Error('Airtable configuration missing. Please set VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_KEY secrets.');
    }

    const { tableName, filterByFormula, sort, maxRecords, view } = await req.json();

    if (!tableName) {
      throw new Error('tableName is required');
    }

    console.log(`Fetching from Airtable table: ${tableName}`);

    const params = new URLSearchParams();
    
    if (filterByFormula) {
      params.set('filterByFormula', filterByFormula);
    }
    if (sort) {
      sort.forEach((s: { field: string; direction: string }, i: number) => {
        params.set(`sort[${i}][field]`, s.field);
        params.set(`sort[${i}][direction]`, s.direction);
      });
    }
    if (maxRecords) {
      params.set('maxRecords', String(maxRecords));
    }
    if (view) {
      params.set('view', view);
    }

    const url = `${AIRTABLE_API}/${BASE_ID}/${encodeURIComponent(tableName)}?${params}`;
    console.log(`Airtable URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, errorText);
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.records?.length || 0} records from ${tableName}`);

    return new Response(JSON.stringify({ records: data.records }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in airtable-proxy function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
