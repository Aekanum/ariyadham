import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withRole } from '@/lib/middleware/roles';
import { z } from 'zod';

const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

type RouteParams = {
  params: Promise<{ applicationId: string }>;
};

/**
 * POST /api/admin/author-applications/:applicationId/review
 * Approve or reject author application (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { applicationId } = await params;

  return withRole(['admin'])(request, async (_req, adminUser) => {
    const supabase = createServerClient();

    // Validate request body
    const body = await request.json();
    const validation = reviewApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { status, reason } = validation.data;

    // Get application
    const { data: application, error: fetchError } = await supabase
      .from('author_applications')
      .select('*, user_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Application not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if already reviewed
    if (application.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Application already reviewed',
            code: 'ALREADY_REVIEWED',
          },
        },
        { status: 409 }
      );
    }

    // Update application
    const { error: updateError } = await supabase
      .from('author_applications')
      .update({
        status,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? reason : null,
      })
      .eq('id', applicationId);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update application',
            code: 'UPDATE_FAILED',
          },
        },
        { status: 500 }
      );
    }

    // If approved, update user role
    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'author' })
        .eq('user_id', application.user_id);

      if (roleError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to update user role',
              code: 'ROLE_UPDATE_FAILED',
            },
          },
          { status: 500 }
        );
      }

      // Log role change
      await supabase.from('role_change_logs').insert({
        user_id: application.user_id,
        old_role: 'reader',
        new_role: 'author',
        changed_by: adminUser.id,
        reason: 'Author application approved',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status,
      },
    });
  });
}
