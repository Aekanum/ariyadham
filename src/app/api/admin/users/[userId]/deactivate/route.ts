/**
 * Admin API: Deactivate/Activate User
 *
 * Story 6.2: User Management
 *
 * POST /api/admin/users/:userId/deactivate - Deactivate or activate a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withAdmin } from '@/lib/middleware/roles';
import { z } from 'zod';

/**
 * Request body schema
 */
const deactivateSchema = z.object({
  is_active: z.boolean(),
  reason: z.string().min(1).max(500).optional(),
});

type DeactivateRequest = z.infer<typeof deactivateSchema>;

/**
 * POST /api/admin/users/:userId/deactivate
 *
 * Deactivate or activate a user (admin only)
 *
 * @param request - Next.js request
 * @param props - Route props with params (async in Next.js 16)
 * @returns JSON response with result
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  return withAdmin(request, async (_req, adminUser) => {
    const supabase = createServerClient();
    const { userId: targetUserId } = await props.params;

    // Validate request body
    let body: DeactivateRequest;
    try {
      const rawBody = await request.json();
      body = deactivateSchema.parse(rawBody);
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

    const { is_active, reason } = body;

    // Prevent self-deactivation
    if (targetUserId === adminUser.id && !is_active) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Cannot deactivate your own admin account',
            code: 'SELF_DEACTIVATION_FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    // Get current user profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('is_active, role, email, full_name')
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

    // Check if status is already the same
    if (currentProfile.is_active === is_active) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `User is already ${is_active ? 'active' : 'inactive'}`,
            code: 'STATUS_UNCHANGED',
          },
        },
        { status: 400 }
      );
    }

    // Update active status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_active })
      .eq('user_id', targetUserId);

    if (updateError) {
      console.error('User deactivation error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update user status',
            code: 'UPDATE_FAILED',
            details: updateError.message,
          },
        },
        { status: 500 }
      );
    }

    // Log the change for audit trail
    const { error: logError } = await supabase.from('user_action_logs').insert({
      user_id: targetUserId,
      action_type: is_active ? 'activated' : 'deactivated',
      performed_by: adminUser.id,
      metadata: {
        reason: reason || null,
        previous_status: currentProfile.is_active,
        new_status: is_active,
      },
    });

    if (logError) {
      console.error('Failed to log user action:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        is_active,
        changedBy: adminUser.id,
        changedAt: new Date().toISOString(),
      },
    });
  });
}
