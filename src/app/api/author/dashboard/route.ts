/**
 * Author Dashboard API Route
 *
 * Provides overall dashboard statistics for authors
 * Story: 4.4 - Author Dashboard & Analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Dashboard Statistics Type
 */
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalViews: number;
  totalAnjali: number;
  totalComments: number;
  lastPublishedAt: string | null;
}

/**
 * GET /api/author/dashboard
 *
 * Fetches overall dashboard statistics for the authenticated author
 *
 * @returns Dashboard statistics
 *
 * @example
 * ```ts
 * const response = await fetch('/api/author/dashboard');
 * const { data } = await response.json();
 * console.log(data); // DashboardStats
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
        createErrorResponse('FORBIDDEN', 'Only authors can access the dashboard'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const supabase = createServerClient();

    // Fetch dashboard stats using the materialized view
    const { data: stats, error: statsError } = await supabase
      .from('author_dashboard_stats')
      .select('*')
      .eq('author_id', user.id)
      .single();

    // If no stats exist yet (new author), return zeros
    if (statsError && statsError.code === 'PGRST116') {
      return NextResponse.json({
        success: true,
        data: {
          totalArticles: 0,
          publishedArticles: 0,
          draftArticles: 0,
          scheduledArticles: 0,
          totalViews: 0,
          totalAnjali: 0,
          totalComments: 0,
          lastPublishedAt: null,
        } as DashboardStats,
      });
    }

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to fetch dashboard statistics', {
          error: statsError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Transform database response to frontend format
    const dashboardStats: DashboardStats = {
      totalArticles: stats.total_articles || 0,
      publishedArticles: stats.published_articles || 0,
      draftArticles: stats.draft_articles || 0,
      scheduledArticles: stats.scheduled_articles || 0,
      totalViews: stats.total_views || 0,
      totalAnjali: stats.total_anjali || 0,
      totalComments: stats.total_comments || 0,
      lastPublishedAt: stats.last_published_at,
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Error in dashboard API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while fetching dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
