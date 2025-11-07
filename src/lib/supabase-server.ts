/**
 * Supabase Client for Server-Side
 *
 * This module provides utility functions for creating Supabase clients
 * for server-side environments only (API routes, Server Components, etc.)
 *
 * Usage:
 * - Server components/API routes: const supabase = createServerClient()
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
  );
}

/**
 * Create a Supabase client for server-side operations
 * Uses service role key for privileged operations (bypasses RLS)
 *
 * @returns Supabase client instance with service role access
 */
export function createServerClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }

  return createSupabaseClient(supabaseUrl as string, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
