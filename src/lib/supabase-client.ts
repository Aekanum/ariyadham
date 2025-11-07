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

/**
 * Create a Supabase client for browser/client-side operations
 * Uses the anon key for public access with RLS policies
 *
 * @returns Supabase client instance
 * @throws Error if environment variables are not set
 */
export function createClient() {
  // Use dummy values during build if environment variables are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // Only validate in browser environment
  if (typeof window !== 'undefined') {
    if (
      supabaseUrl === 'https://placeholder.supabase.co' ||
      supabaseAnonKey === 'placeholder-anon-key'
    ) {
      throw new Error(
        'Missing Supabase environment variables. ' +
          'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
