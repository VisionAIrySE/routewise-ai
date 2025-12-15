// Supabase client for Inspector Route AI
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rsylbntdtflyoaxiwhvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeWxibnRkdGZseW9heGl3aHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTc5NTEsImV4cCI6MjA4MTA5Mzk1MX0.XVg35TYNwHV8-xwVOBnKZhY44Bwd_cclgl6m58wz7WU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
