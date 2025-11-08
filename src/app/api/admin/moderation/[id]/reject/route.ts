/**
 * Admin Moderation - Reject Article API Route
 *
 * Rejects an article and returns it to draft status
 * Story: 6.3 - Content Moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Request body for rejecting an article
 */
interface RejectArticleRequest {
  reason?: string;
}

/**
 * POST /api/admin/moderation/[id]/reject
 *
 * Rejects a pending article and transitions it to draft status for author revision
 *
 * @param id - Article ID to reject
 * @param reason - Optional reason for rejection (sent to author)
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
        createErrorResponse('FORBIDDEN', 'Only administrators can reject articles'),
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

    const body: RejectArticleRequest = await request.json();
    const { reason } = body;

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

    // Update article status to draft (author can revise)
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting article:', updateError);
      return NextResponse.json(createErrorResponse('DATABASE_ERROR', 'Failed to reject article'), {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    // Log the moderation action to audit_logs
    await supabase.from('audit_logs').insert({
      action: 'article_rejected',
      entity_type: 'article',
      entity_id: id,
      actor_id: user.id,
      actor_role: user.role,
      details: {
        article_title: article.title,
        previous_status: article.status,
        new_status: 'draft',
        rejection_reason: reason || 'No reason provided',
      },
      success: true,
    });

    // TODO: Send notification to author with rejection reason (future enhancement)
    // This would notify the author that their article has been rejected
    // and provide the reason so they can revise

    return NextResponse.json({
      success: true,
      data: {
        article: updatedArticle,
        message: 'Article rejected and returned to draft',
      },
    });
  } catch (error) {
    console.error('Error in reject article API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while rejecting article', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
