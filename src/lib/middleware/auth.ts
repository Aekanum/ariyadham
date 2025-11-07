/**
 * Authentication Middleware
 *
 * Middleware functions for verifying authentication and authorization.
 * Used in API routes to protect endpoints and verify user permissions.
 *
 * @see docs/API.md for usage guidelines
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '../supabase-server';
import { ApiErrorResponse, HttpStatus } from '@/types/api';
import { createErrorResponse } from '../validation';
import { User } from '@supabase/supabase-js';

/**
 * Authentication result
 */
export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: ApiErrorResponse; status: HttpStatus };

/**
 * Verifies that the request has a valid authentication token
 *
 * @param request - Next.js request object
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth(request);
 *
 *   if (!authResult.success) {
 *     return NextResponse.json(authResult.error, {
 *       status: authResult.status
 *     });
 *   }
 *
 *   const user = authResult.user;
 *   // ... continue with authenticated user
 * }
 * ```
 */
export async function requireAuth(_request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createServerClient();

    // Get the current user from the session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: createErrorResponse('UNAUTHORIZED', 'Authentication required'),
        status: HttpStatus.UNAUTHORIZED,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'Authentication verification failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

/**
 * Verifies that the user has a specific role
 *
 * @param request - Next.js request object
 * @param allowedRoles - Array of roles that are allowed
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireRole(request, ['author', 'admin']);
 *
 *   if (!authResult.success) {
 *     return NextResponse.json(authResult.error, {
 *       status: authResult.status
 *     });
 *   }
 *
 *   const user = authResult.user;
 *   // ... continue with authorized user
 * }
 * ```
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[],
): Promise<AuthResult> {
  // First verify authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const supabase = await createServerClient();

    // Fetch user profile with role information
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      return {
        success: false,
        error: createErrorResponse('FORBIDDEN', 'User profile not found'),
        status: HttpStatus.FORBIDDEN,
      };
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(profile.role)) {
      return {
        success: false,
        error: createErrorResponse(
          'INSUFFICIENT_PERMISSIONS',
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          {
            required: allowedRoles,
            actual: profile.role,
          },
        ),
        status: HttpStatus.FORBIDDEN,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'Authorization verification failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

/**
 * Verifies that the user has admin privileges
 *
 * @param request - Next.js request object
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function DELETE(request: NextRequest) {
 *   const authResult = await requireAdmin(request);
 *
 *   if (!authResult.success) {
 *     return NextResponse.json(authResult.error, {
 *       status: authResult.status
 *     });
 *   }
 *
 *   // ... continue with admin operation
 * }
 * ```
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['admin']);
}

/**
 * Verifies that the user is an approved author
 *
 * @param request - Next.js request object
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireAuthor(request);
 *
 *   if (!authResult.success) {
 *     return NextResponse.json(authResult.error, {
 *       status: authResult.status
 *     });
 *   }
 *
 *   // ... continue with author operation
 * }
 * ```
 */
export async function requireAuthor(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, ['author', 'admin']);
}

/**
 * Optional authentication - returns user if authenticated, but doesn't fail if not
 *
 * @param request - Next.js request object
 * @returns User object or null
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await optionalAuth(request);
 *
 *   if (user) {
 *     // User is authenticated, personalize response
 *   } else {
 *     // User is not authenticated, return public data
 *   }
 * }
 * ```
 */
export async function optionalAuth(_request: NextRequest): Promise<User | null> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    // Silently fail for optional auth
    return null;
  }
}

/**
 * Verifies that the user has verified their email
 *
 * @param request - Next.js request object
 * @returns AuthResult with user data or error
 */
export async function requireVerifiedEmail(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  if (!user.email_confirmed_at) {
    return {
      success: false,
      error: createErrorResponse(
        'EMAIL_NOT_VERIFIED',
        'Please verify your email address before proceeding',
      ),
      status: HttpStatus.FORBIDDEN,
    };
  }

  return {
    success: true,
    user,
  };
}
