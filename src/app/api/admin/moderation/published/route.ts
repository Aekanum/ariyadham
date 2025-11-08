/**
 * Admin Moderation - Published Articles API Route
 *
 * Fetches published articles for potential unpublishing
 * Story: 6.3 - Content Moderation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * GET /api/admin/moderation/published
 *
 * Fetches all published articles for admin review and potential unpublishing
 *
 * @returns List of published articles with author information
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

    // Fetch published articles with author information
    // Limit to recent 50 articles for performance
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
        published_at,
        author:users!author_id(
          id,
          username,
          full_name
        )
      `
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching published articles:', error);
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch published articles'),
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
      published_at?: string;
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
      published_at: article.published_at,
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
    console.error('Error in published articles API:', error);

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while fetching published articles',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
