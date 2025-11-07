/**
 * Supabase Client Initialization
 *
 * This module provides utility functions for creating Supabase clients
 * for both browser (client-side) and server-side environments.
 *
 * Usage:
 * - Client-side: const supabase = createBrowserClient()
 * - Server-side: const supabase = createServerClient(userId)
 * - API routes: const supabase = createClient(userId)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
export function createBrowserClient() {
  return createSupabaseClient(supabaseUrl as string, supabaseAnonKey as string);
}

/**
 * Create a Supabase client for server-side operations
 * Uses service role key for privileged operations (use with caution)
 *
 * @returns Supabase client instance with service role access
 */
export function createServerClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }

  return createSupabaseClient(supabaseUrl as string, supabaseServiceRoleKey);
}

/**
 * Create a Supabase client for API routes
 * Handles authentication via JWT token from request headers
 *
 * @param accessToken - Optional JWT token for authenticated requests
 * @returns Supabase client instance
 */
export function createClient(accessToken?: string) {
  // For API routes, use anon key with optional access token
  const client = createSupabaseClient(supabaseUrl as string, supabaseAnonKey as string);

  // If access token provided, set it as authorization header
  if (accessToken) {
    // Note: Setting session directly may require additional setup in Next.js environment
    // Alternative: Include token in request headers when making queries
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    } as any);
  }

  return client;
}

/**
 * Get current authenticated user from session
 * For use in client components
 *
 * @returns Promise with user data or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get session data from cookies (server-side)
 * For use in server components and API routes
 *
 * @returns Session object or null
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Type definitions for common operations
 */
export type SupabaseClient = ReturnType<typeof createBrowserClient>;
export type SupabaseServerClient = ReturnType<typeof createServerClient>;

/**
 * Helper function to handle Supabase errors
 *
 * @param error - Supabase error object
 * @returns Formatted error message
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.error_description) {
    return error.error_description;
  }

  return 'An unknown error occurred';
}

/**
 * Helper function to check if user has admin role
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @returns Promise with boolean indicating admin status
 */
export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data?.role === 'admin';
}

/**
 * Helper function to check if user is verified author
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @returns Promise with boolean indicating verified author status
 */
export async function isVerifiedAuthor(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('authors')
    .select('verification_status')
    .eq('user_id', userId)
    .eq('deleted_at', null)
    .single();

  if (error) {
    console.error('Error checking author status:', error);
    return false;
  }

  return data?.verification_status === 'verified';
}

/**
 * Helper function to get user's author profile
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns Promise with author data or null
 */
export async function getUserAuthorProfile(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('user_id', userId)
    .eq('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching author profile:', error);
    return null;
  }

  return data;
}

/**
 * Realtime subscription helper
 * Subscribe to changes in a table with callback
 *
 * @param supabase - Supabase client
 * @param table - Table name
 * @param event - Event type ('*', 'INSERT', 'UPDATE', 'DELETE')
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export function subscribeToTable(
  supabase: SupabaseClient,
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes' as any,
      { event, schema: 'public', table },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
