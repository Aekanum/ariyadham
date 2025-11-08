/**
 * Role-Based Access Control Middleware
 *
 * Provides server-side role checking and middleware for API routes.
 * Story 2.2: User Roles & Permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import type { UserRole } from '@/types/database';

/**
 * Result of role check
 */
export interface RoleCheckResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
  };
  role?: UserRole;
  error?: string;
}

/**
 * Check if user has required role
 *
 * @param request - Next.js request object
 * @param allowedRoles - Array of roles that are allowed
 * @returns Role check result with authorization status
 *
 * @example
 * const { authorized, user, role } = await requireRole(request, ['admin']);
 * if (!authorized) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 */
export async function requireRole(
  _request: NextRequest,
  allowedRoles: UserRole[]
): Promise<RoleCheckResult> {
  try {
    const supabase = createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        error: 'Not authenticated',
      };
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        authorized: false,
        user: { id: user.id, email: user.email ?? '' },
        error: 'Profile not found',
      };
    }

    const userRole = profile.role as UserRole;
    const authorized = allowedRoles.includes(userRole);

    return {
      authorized,
      user: { id: user.id, email: user.email ?? '' },
      role: userRole,
      error: authorized ? undefined : 'Insufficient permissions',
    };
  } catch (error) {
    console.error('Role check error:', error);
    return {
      authorized: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Check if user is authenticated (any role)
 *
 * @param request - Next.js request object
 * @returns Role check result
 *
 * @example
 * const { authorized, user } = await requireAuth(request);
 */
export async function requireAuth(request: NextRequest): Promise<RoleCheckResult> {
  return requireRole(request, ['reader', 'author', 'admin']);
}

/**
 * Check if user is an author or admin
 *
 * @param request - Next.js request object
 * @returns Role check result
 */
export async function requireAuthor(request: NextRequest): Promise<RoleCheckResult> {
  return requireRole(request, ['author', 'admin']);
}

/**
 * Check if user is an admin
 *
 * @param request - Next.js request object
 * @returns Role check result
 */
export async function requireAdmin(request: NextRequest): Promise<RoleCheckResult> {
  return requireRole(request, ['admin']);
}

/**
 * Middleware wrapper for role-based access control
 *
 * @param allowedRoles - Array of roles that are allowed
 * @returns Middleware function
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   return withRole(['admin'])(request, async (req, user, role) => {
 *     // Handler code here
 *     return NextResponse.json({ success: true });
 *   });
 * }
 */
export function withRole(allowedRoles: UserRole[]) {
  return async function middleware(
    request: NextRequest,
    handler: (
      req: NextRequest,
      user: { id: string; email: string },
      role: UserRole
    ) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const { authorized, user, role, error } = await requireRole(request, allowedRoles);

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error || 'Insufficient permissions',
            code: user ? 'FORBIDDEN' : 'UNAUTHORIZED',
          },
        },
        { status: user ? 403 : 401 }
      );
    }

    return handler(request, user!, role!);
  };
}

/**
 * Middleware wrapper for authenticated requests (any role)
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   return withAuth(request, async (req, user, role) => {
 *     return NextResponse.json({ userId: user.id });
 *   });
 * }
 */
export function withAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: { id: string; email: string },
    role: UserRole
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['reader', 'author', 'admin'])(request, handler);
}

/**
 * Middleware wrapper for author or admin requests
 */
export function withAuthor(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: { id: string; email: string },
    role: UserRole
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['author', 'admin'])(request, handler);
}

/**
 * Middleware wrapper for admin-only requests
 */
export function withAdmin(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: { id: string; email: string },
    role: UserRole
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(['admin'])(request, handler);
}

/**
 * Check if a role has permission for an action
 * Implements role hierarchy: admin > author > reader
 *
 * @param userRole - User's current role
 * @param requiredRole - Minimum required role
 * @returns true if user has permission
 *
 * @example
 * hasPermission('admin', 'author'); // true
 * hasPermission('reader', 'author'); // false
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    reader: 1,
    author: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get user's role from request
 * Utility function to extract role without authorization check
 *
 * @param request - Next.js request object
 * @returns User role or null
 */
export async function getUserRole(_request: NextRequest): Promise<UserRole | null> {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return (profile?.role as UserRole) || 'reader';
  } catch {
    return null;
  }
}
