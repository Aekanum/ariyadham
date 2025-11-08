/**
 * Author Articles API Route
 *
 * Provides list of author's articles with statistics
 * Story: 4.4 - Author Dashboard & Analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';
import type { Article } from '@/types/database';

/**
 * Article with Statistics Type
 */
export interface ArticleWithStats {
  id: string;
  title: string;
  slug: string;
  status: Article['status'];
  publishedAt: string | null;
  totalViews: number;
  totalAnjali: number;
  totalComments: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  viewsLast90Days: number;
}

/**
 * GET /api/author/articles
 *
 * Fetches all articles for the authenticated author with statistics
 *
 * Query parameters:
 * - status: Filter by article status (draft, published, scheduled, archived)
 * - sort: Sort field (published_at, view_count, anjali_count) - default: published_at
 * - order: Sort order (asc, desc) - default: desc
 *
 * @returns List of articles with statistics
 *
 * @example
 * ```ts
 * const response = await fetch('/api/author/articles?status=published&sort=view_count');
 * const { data } = await response.json();
 * console.log(data); // ArticleWithStats[]
 * ```
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

    // Check if user is an author or admin
    if (!['author', 'admin'].includes(user.role)) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only authors can access this endpoint'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';

    const supabase = createServerClient();

    // Build query
    type ValidSortField = 'published_at' | 'total_views' | 'total_anjali' | 'total_comments';
    let query = supabase
      .from('article_summary_stats')
      .select('*')
      .eq('author_id', user.id)
      .order(sort as ValidSortField, { ascending: order === 'asc' });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: articles, error: articlesError } = await query;

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch articles', {
          error: articlesError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Transform database response to frontend format
    const articlesWithStats: ArticleWithStats[] = (articles || []).map((article) => ({
      id: article.article_id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      publishedAt: article.published_at,
      totalViews: article.total_views || 0,
      totalAnjali: article.total_anjali || 0,
      totalComments: article.total_comments || 0,
      viewsLast7Days: article.views_last_7_days || 0,
      viewsLast30Days: article.views_last_30_days || 0,
      viewsLast90Days: article.views_last_90_days || 0,
    }));

    return NextResponse.json({
      success: true,
      data: articlesWithStats,
    });
  } catch (error) {
    console.error('Error in author articles API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while fetching articles', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
