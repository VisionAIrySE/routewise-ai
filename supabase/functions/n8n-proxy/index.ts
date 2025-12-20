import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded n8n webhook URLs - VITE_* env vars are not available in edge functions
const N8N_ROUTE_QUERY_URL = 'https://visionairy.app.n8n.cloud/webhook/route-query';
const N8N_UPLOAD_URL = 'https://visionairy.app.n8n.cloud/webhook/upload-inspections';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client and verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);

    // Determine which n8n endpoint to call based on action
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const isUpload = action === 'upload';
    const n8nUrl = isUpload ? N8N_UPLOAD_URL : N8N_ROUTE_QUERY_URL;

    let n8nResponse: Response;

    if (isUpload) {
      // Handle file upload - forward FormData
      const formData = await req.formData();
      formData.append('user_id', userId);
      
      console.log(`Forwarding upload to n8n for user ${userId}`);
      
      n8nResponse = await fetch(n8nUrl, {
        method: 'POST',
        body: formData,
      });
    } else {
      // Handle JSON requests (route queries, save_route, reconcile, etc.)
      const body = await req.json();
      
      // Add verified user_id to the request
      const enrichedBody = {
        ...body,
        user_id: userId,
      };
      
      console.log(`Forwarding ${body.action || 'route-query'} to n8n for user ${userId}`);
      
      n8nResponse = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedBody),
      });
    }

    const responseData = await n8nResponse.text();
    
    console.log(`n8n response status: ${n8nResponse.status}`);
    console.log(`n8n response data: ${responseData.substring(0, 500)}`);

    // Return the n8n response to the client
    return new Response(responseData, {
      status: n8nResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    const message = err instanceof Error ? err.message : 'Proxy error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
