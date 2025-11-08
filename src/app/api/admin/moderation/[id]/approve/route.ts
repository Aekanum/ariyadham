/**
 * Admin Moderation - Approve Article API Route
 *
 * Approves an article and publishes it
 * Story: 6.3 - Content Moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * POST /api/admin/moderation/[id]/approve
 *
 * Approves a pending article and transitions it to published status
 *
 * @param id - Article ID to approve
 * @returns Updated article
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', 'Authentication required'), {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only administrators can approve articles'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(createErrorResponse('VALIDATION_ERROR', 'Article ID is required'), {
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const supabase = createServerClient();

    // First, verify the article exists and is pending approval
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, status, author_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', 'Article not found'), {
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (article.status !== 'pending_approval') {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Article is not pending approval'),
        {
          status: HttpStatus.BAD_REQUEST,
        }
      );
    }

    // Update article status to published
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving article:', updateError);
      return NextResponse.json(createErrorResponse('DATABASE_ERROR', 'Failed to approve article'), {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    // Log the moderation action to audit_logs
    await supabase.from('audit_logs').insert({
      action: 'article_approved',
      entity_type: 'article',
      entity_id: id,
      actor_id: user.id,
      actor_role: user.role,
      details: {
        article_title: article.title,
        previous_status: article.status,
        new_status: 'published',
      },
      success: true,
    });

    // TODO: Send notification to author (future enhancement)
    // This would notify the author that their article has been approved

    return NextResponse.json({
      success: true,
      data: {
        article: updatedArticle,
        message: 'Article approved and published successfully',
      },
    });
  } catch (error) {
    console.error('Error in approve article API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while approving article', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
