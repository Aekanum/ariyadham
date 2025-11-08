/**
 * Admin Moderation - Unpublish Article API Route
 *
 * Unpublishes a published article, removing it from public view
 * Story: 6.3 - Content Moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Request body for unpublishing an article
 */
interface UnpublishArticleRequest {
  reason?: string;
}

/**
 * POST /api/admin/moderation/[id]/unpublish
 *
 * Unpublishes a published article, transitioning it to archived status
 *
 * @param id - Article ID to unpublish
 * @param reason - Optional reason for unpublishing (logged for audit)
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
        createErrorResponse('FORBIDDEN', 'Only administrators can unpublish articles'),
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

    const body: UnpublishArticleRequest = await request.json();
    const { reason } = body;

    const supabase = createServerClient();

    // First, verify the article exists and is published
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, status, author_id, published_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', 'Article not found'), {
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (article.status !== 'published') {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Article is not published'),
        {
          status: HttpStatus.BAD_REQUEST,
        }
      );
    }

    // Update article status to archived (removed from public view)
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error unpublishing article:', updateError);
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to unpublish article'),
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }
      );
    }

    // Log the moderation action to audit_logs
    await supabase.from('audit_logs').insert({
      action: 'article_unpublished',
      entity_type: 'article',
      entity_id: id,
      actor_id: user.id,
      actor_role: user.role,
      details: {
        article_title: article.title,
        previous_status: article.status,
        new_status: 'archived',
        unpublish_reason: reason || 'No reason provided',
        was_published_at: article.published_at,
      },
      success: true,
    });

    // TODO: Send notification to author (future enhancement)
    // This would notify the author that their article has been unpublished
    // and provide the reason

    return NextResponse.json({
      success: true,
      data: {
        article: updatedArticle,
        message: 'Article unpublished successfully',
      },
    });
  } catch (error) {
    console.error('Error in unpublish article API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while unpublishing article', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
