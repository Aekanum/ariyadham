/**
 * Supabase Client for Browser/Client-Side
 *
 * This module provides utility functions for creating Supabase clients
 * for browser (client-side) environments only.
 *
 * Usage:
 * - Client-side components: const supabase = createClient()
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Create a Supabase client for browser/client-side operations
 * Uses the anon key for public access with RLS policies
 *
 * @returns Supabase client instance
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl as string, supabaseAnonKey as string);
}
