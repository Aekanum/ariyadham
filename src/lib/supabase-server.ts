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

/**
 * Create a Supabase client for server-side operations
 * Uses service role key for privileged operations (bypasses RLS)
 *
 * @returns Supabase client instance with service role access
 * @throws Error if environment variables are not set
 */
export function createServerClient() {
  // Use dummy values during build if environment variables are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  // Only validate in production/runtime environments (not during build)
  // Server-side code doesn't have window, so we check for build-time environment
  const isBuildTime = process.env.NODE_ENV === undefined || process.env.VERCEL_ENV === undefined;

  if (!isBuildTime) {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }

    if (supabaseServiceRoleKey === 'placeholder-service-role-key') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
