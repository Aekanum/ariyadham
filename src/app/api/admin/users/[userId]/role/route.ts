/**
 * Admin API: Update User Role
 *
 * Endpoint for admins to change user roles
 * Story 2.2: User Roles & Permissions
 *
 * POST /api/admin/users/:userId/role
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withAdmin } from '@/lib/middleware/roles';
import { z } from 'zod';
import type { UserRole } from '@/types/database';

/**
 * Request body schema
 */
const updateRoleSchema = z.object({
  newRole: z.enum(['reader', 'author', 'admin']),
  reason: z.string().min(1).max(500).optional(),
});

type UpdateRoleRequest = z.infer<typeof updateRoleSchema>;

/**
 * POST /api/admin/users/:userId/role
 *
 * Update user role (admin only)
 *
 * @param request - Next.js request
 * @param params - Route params with userId
 * @returns JSON response with result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  return withAdmin(request, async (_req, adminUser) => {
    const supabase = createServerClient();
    const targetUserId = params.userId;

    // Validate request body
    let body: UpdateRoleRequest;
    try {
      const rawBody = await request.json();
      body = updateRoleSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Invalid request',
              code: 'VALIDATION_ERROR',
              details: error.issues,
            },
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON',
            code: 'PARSE_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const { newRole, reason } = body;

    // Prevent self-demotion from admin
    if (targetUserId === adminUser.id && newRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Cannot demote yourself from admin role',
            code: 'SELF_DEMOTION_FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // Get current user profile and role
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', targetUserId)
      .single();

    if (fetchError || !currentProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    const oldRole = currentProfile.role as UserRole;

    // Check if role is already the same
    if (oldRole === newRole) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `User already has role '${newRole}'`,
            code: 'ROLE_UNCHANGED',
          },
        },
        { status: 400 }
      );
    }

    // Update role
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', targetUserId);

    if (updateError) {
      console.error('Role update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update role',
            code: 'UPDATE_FAILED',
            details: updateError.message,
          },
        },
        { status: 500 }
      );
    }

    // Log the change for audit trail
    const { error: logError } = await supabase.from('role_change_logs').insert({
      user_id: targetUserId,
      old_role: oldRole,
      new_role: newRole,
      changed_by: adminUser.id,
      reason: reason || null,
    });

    if (logError) {
      console.error('Failed to log role change:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        oldRole,
        newRole,
        changedBy: adminUser.id,
        changedAt: new Date().toISOString(),
      },
    });
  });
}

/**
 * GET /api/admin/users/:userId/role
 *
 * Get user's current role (admin only)
 *
 * @param request - Next.js request
 * @param params - Route params with userId
 * @returns JSON response with user role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  return withAdmin(request, async () => {
    const supabase = createServerClient();
    const targetUserId = params.userId;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, full_name, email')
      .eq('user_id', targetUserId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        role: profile.role,
        fullName: profile.full_name,
        email: profile.email,
      },
    });
  });
}
