import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key';

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
