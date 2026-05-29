import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dskdwqkealdqtngusghm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2R3cWtlYWxkcXRuZ3VzZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODQ5MDAsImV4cCI6MjA5NTM2MDkwMH0.uvQZEhDNuKz2k92d2066CTthWHZtc-ematwH344fJYg';

// Standard public client-safe Supabase singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Gated admin Supabase client with bypass privileges (accessible ONLY server-side)
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: Server-privileged Supabase Admin client can only be instantiated inside Next.js server context!');
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Configuration Violation: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined!');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export default supabase;
