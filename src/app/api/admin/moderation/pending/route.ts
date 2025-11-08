/**
 * Admin Moderation - Pending Articles API Route
 *
 * Fetches articles pending approval for content moderation
 * Story: 6.3 - Content Moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * GET /api/admin/moderation/pending
 *
 * Fetches all articles with status 'pending_approval' for admin review
 *
 * @returns List of articles pending approval with author information
 */
export async function GET(request: NextRequest) {
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
        createErrorResponse('FORBIDDEN', 'Only administrators can access content moderation'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const supabase = createServerClient();

    // Fetch pending articles with author information
    const { data: articles, error } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        excerpt,
        content,
        status,
        author_id,
        created_at,
        updated_at,
        author:users!author_id(
          id,
          username,
          full_name
        )
      `
      )
      .eq('status', 'pending_approval')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending articles:', error);
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch pending articles'),
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }
      );
    }

    // Transform the data to flatten the author object
    type ArticleWithAuthor = {
      id: string;
      title: string;
      excerpt: string;
      content: string;
      status: string;
      author_id: string;
      created_at: string;
      updated_at: string;
      author?: Array<{
        id: string;
        username: string;
        full_name?: string;
      }>;
    };

    const transformedArticles = articles?.map((article: ArticleWithAuthor) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status,
      author_id: article.author_id,
      created_at: article.created_at,
      updated_at: article.updated_at,
      author: {
        id: article.author?.[0]?.id || '',
        username: article.author?.[0]?.username || '',
        full_name: article.author?.[0]?.full_name,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        articles: transformedArticles || [],
        count: transformedArticles?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in pending articles API:', error);

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while fetching pending articles',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
