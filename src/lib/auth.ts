import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import type { User } from '@/types/database';

/**
 * Get the current authenticated user from a Next.js request
 * Used in API routes and server components
 */
export async function getCurrentUser(
  _request: NextRequest
): Promise<User | null> {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Validate authentication and return user
 * Throws error if not authenticated
 */
export async function validateAuth(request: NextRequest): Promise<{
  user: User | null;
  error: Error | null;
}> {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      user: null,
      error: new Error('Unauthorized'),
    };
  }

  return { user, error: null };
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is an author
 */
export function isAuthor(user: User | null): boolean {
  return hasRole(user, 'author') || isAdmin(user);
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string
): boolean {
  if (!user) return false;
  return user.id === resourceOwnerId || isAdmin(user);
}
