/**
 * Admin Analytics API Route
 *
 * Provides detailed analytics data for administrators
 * Story: 6.4 - Analytics & Reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Analytics Data Point (Time Series)
 */
export interface AnalyticsDataPoint {
  date: string; // ISO date string
  value: number;
}

/**
 * Article Analytics
 */
export interface ArticleAnalytics {
  id: string;
  title: string;
  views: number;
  anjali: number;
  comments: number;
  shares: number;
}

/**
 * Author Analytics
 */
export interface AuthorAnalytics {
  id: string;
  name: string;
  articleCount: number;
  totalViews: number;
  totalAnjali: number;
  totalComments: number;
}

/**
 * Analytics Response
 */
export interface AnalyticsResponse {
  userGrowth: AnalyticsDataPoint[];
  articlePublications: AnalyticsDataPoint[];
  viewTrends: AnalyticsDataPoint[];
  engagementTrends: {
    anjali: AnalyticsDataPoint[];
    comments: AnalyticsDataPoint[];
    shares: AnalyticsDataPoint[];
  };
  topArticles: ArticleAnalytics[];
  topAuthors: AuthorAnalytics[];
}

/**
 * GET /api/admin/analytics
 *
 * Fetches detailed analytics data for administrators
 *
 * Query Parameters:
 * - startDate: Start date for analytics range (ISO string)
 * - endDate: End date for analytics range (ISO string)
 *
 * @returns Detailed analytics data
 *
 * @example
 * ```ts
 * const response = await fetch('/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31');
 * const { data } = await response.json();
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

    // Check if user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only administrators can access analytics'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const supabase = createServerClient();

    // Get date range from query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to last 90 days if not specified
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Helper function to generate date range
    const generateDateRange = (start: Date, end: Date): string[] => {
      const dates: string[] = [];
      const current = new Date(start);

      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      return dates;
    };

    const dateRange = generateDateRange(startDate, endDate);

    // ===== User Growth Trends =====
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .is('deleted_at', null);

    const userGrowth: AnalyticsDataPoint[] = dateRange.map((date) => {
      const count = users?.filter((u) => u.created_at.split('T')[0] === date).length || 0;
      return { date, value: count };
    });

    if (usersError) {
      console.error('Error fetching user growth:', usersError);
    }

    // ===== Article Publication Trends =====
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('published_at, status')
      .eq('status', 'published')
      .gte('published_at', startDate.toISOString())
      .lte('published_at', endDate.toISOString())
      .is('deleted_at', null);

    const articlePublications: AnalyticsDataPoint[] = dateRange.map((date) => {
      const count = articles?.filter((a) => a.published_at?.split('T')[0] === date).length || 0;
      return { date, value: count };
    });

    if (articlesError) {
      console.error('Error fetching article publications:', articlesError);
    }

    // ===== View Trends =====
    // Note: This is a simplified version. In production, you'd track views with timestamps
    // For now, we'll aggregate current view counts by article publish date
    const { data: viewData, error: viewError } = await supabase
      .from('articles')
      .select('view_count, published_at')
      .eq('status', 'published')
      .gte('published_at', startDate.toISOString())
      .lte('published_at', endDate.toISOString())
      .is('deleted_at', null);

    const viewTrends: AnalyticsDataPoint[] = dateRange.map((date) => {
      const views =
        viewData
          ?.filter((a) => a.published_at?.split('T')[0] === date)
          .reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;
      return { date, value: views };
    });

    if (viewError) {
      console.error('Error fetching view trends:', viewError);
    }

    // ===== Engagement Trends =====
    // Anjali reactions
    const { data: anjaliData, error: anjaliError } = await supabase
      .from('anjali_reactions')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const anjaliTrends: AnalyticsDataPoint[] = dateRange.map((date) => {
      const count = anjaliData?.filter((a) => a.created_at.split('T')[0] === date).length || 0;
      return { date, value: count };
    });

    if (anjaliError) {
      console.error('Error fetching anjali trends:', anjaliError);
    }

    // Comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .is('deleted_at', null);

    const commentsTrends: AnalyticsDataPoint[] = dateRange.map((date) => {
      const count = commentsData?.filter((c) => c.created_at.split('T')[0] === date).length || 0;
      return { date, value: count };
    });

    if (commentsError) {
      console.error('Error fetching comments trends:', commentsError);
    }

    // Shares (placeholder - you would track this separately)
    const sharesTrends: AnalyticsDataPoint[] = dateRange.map((date) => ({
      date,
      value: 0,
    }));

    // ===== Top Articles =====
    const { data: topArticlesData, error: topArticlesError } = await supabase
      .from('articles')
      .select(
        `
        id,
        title_en,
        title_th,
        view_count,
        anjali_count,
        comment_count
      `
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(10);

    const topArticles: ArticleAnalytics[] =
      topArticlesData?.map((article) => ({
        id: article.id,
        title: article.title_en || article.title_th || 'Untitled',
        views: article.view_count || 0,
        anjali: article.anjali_count || 0,
        comments: article.comment_count || 0,
        shares: 0, // Placeholder
      })) || [];

    if (topArticlesError) {
      console.error('Error fetching top articles:', topArticlesError);
    }

    // ===== Top Authors =====
    const { data: topAuthorsData, error: topAuthorsError } = await supabase
      .from('articles')
      .select(
        `
        author_id,
        view_count,
        anjali_count,
        comment_count,
        users!inner(id, full_name, username)
      `
      )
      .eq('status', 'published')
      .is('deleted_at', null);

    // Aggregate by author
    const authorMap = new Map<
      string,
      {
        id: string;
        name: string;
        articleCount: number;
        totalViews: number;
        totalAnjali: number;
        totalComments: number;
      }
    >();

    topAuthorsData?.forEach((article: any) => {
      const authorId = article.author_id;
      const user = article.users;

      if (!authorMap.has(authorId)) {
        authorMap.set(authorId, {
          id: authorId,
          name: user?.full_name || user?.username || 'Unknown',
          articleCount: 0,
          totalViews: 0,
          totalAnjali: 0,
          totalComments: 0,
        });
      }

      const author = authorMap.get(authorId)!;
      author.articleCount++;
      author.totalViews += article.view_count || 0;
      author.totalAnjali += article.anjali_count || 0;
      author.totalComments += article.comment_count || 0;
    });

    const topAuthors = Array.from(authorMap.values())
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);

    if (topAuthorsError) {
      console.error('Error fetching top authors:', topAuthorsError);
    }

    // ===== Prepare Response =====
    const analyticsResponse: AnalyticsResponse = {
      userGrowth,
      articlePublications,
      viewTrends,
      engagementTrends: {
        anjali: anjaliTrends,
        comments: commentsTrends,
        shares: sharesTrends,
      },
      topArticles,
      topAuthors,
    };

    return NextResponse.json({
      success: true,
      data: analyticsResponse,
    });
  } catch (error) {
    console.error('Error in analytics API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while fetching analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
