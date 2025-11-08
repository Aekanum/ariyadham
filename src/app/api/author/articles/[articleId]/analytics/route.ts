/**
 * Article Analytics API Route
 *
 * Provides detailed analytics for a specific article
 * Story: 4.4 - Author Dashboard & Analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Daily View Stats Type
 */
export interface DailyViewStats {
  date: string;
  views: number;
  uniqueViewers: number;
}

/**
 * Article Analytics Type
 */
export interface ArticleAnalytics {
  articleId: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  totalViews: number;
  totalAnjali: number;
  totalComments: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  viewsLast90Days: number;
  dailyStats: DailyViewStats[];
}

/**
 * GET /api/author/articles/[articleId]/analytics
 *
 * Fetches detailed analytics for a specific article
 *
 * Query parameters:
 * - period: Time period for daily stats (7, 30, 90) - default: 30
 *
 * @param params - Route parameters with articleId
 * @returns Detailed article analytics
 *
 * @example
 * ```ts
 * const response = await fetch('/api/author/articles/123/analytics?period=30');
 * const { data } = await response.json();
 * console.log(data); // ArticleAnalytics
 * ```
 */
export async function GET(request: NextRequest, { params }: { params: { articleId: string } }) {
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
        createErrorResponse('FORBIDDEN', 'Only authors can access analytics'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const { articleId } = params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30', 10);

    const supabase = createServerClient();

    // First, verify the article belongs to this author
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, slug, status, published_at, author_id')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', 'Article not found'), {
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Check authorization (only article author or admin can view analytics)
    if (article.author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        createErrorResponse(
          'FORBIDDEN',
          'You do not have permission to view this article analytics'
        ),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    // Fetch article summary stats
    const { data: stats, error: statsError } = await supabase
      .from('article_summary_stats')
      .select('*')
      .eq('article_id', articleId)
      .single();

    if (statsError) {
      console.error('Error fetching article stats:', statsError);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch article statistics', {
          error: statsError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Fetch daily stats for the specified period
    const { data: dailyStats, error: dailyError } = await supabase
      .from('article_daily_stats')
      .select('*')
      .eq('article_id', articleId)
      .gte('view_date', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
      .order('view_date', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily stats:', dailyError);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch daily statistics', {
          error: dailyError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Transform daily stats to frontend format
    const formattedDailyStats: DailyViewStats[] = (dailyStats || []).map((stat) => ({
      date: stat.view_date,
      views: stat.views_count || 0,
      uniqueViewers: stat.unique_viewers || 0,
    }));

    // Construct analytics response
    const analytics: ArticleAnalytics = {
      articleId: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      publishedAt: article.published_at,
      totalViews: stats.total_views || 0,
      totalAnjali: stats.total_anjali || 0,
      totalComments: stats.total_comments || 0,
      viewsLast7Days: stats.views_last_7_days || 0,
      viewsLast30Days: stats.views_last_30_days || 0,
      viewsLast90Days: stats.views_last_90_days || 0,
      dailyStats: formattedDailyStats,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error in article analytics API:', error);

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An error occurred while fetching article analytics',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
