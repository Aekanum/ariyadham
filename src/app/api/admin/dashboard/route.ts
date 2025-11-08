/**
 * Admin Dashboard API Route
 *
 * Provides platform-wide statistics for administrators
 * Story: 6.1 - Admin Dashboard Overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { HttpStatus } from '@/types/api';

/**
 * Admin Dashboard Statistics Type
 */
export interface AdminDashboardStats {
  totalUsers: number;
  totalArticles: number;
  monthlyActiveUsers: number;
  articlesPublishedThisMonth: number;
  totalAnjali: number;
  totalComments: number;
  totalViews: number;
  pendingApprovals: number;
}

/**
 * Recent Activity Item
 */
export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'article_published' | 'comment_posted' | 'anjali_given';
  description: string;
  timestamp: string;
  metadata?: {
    userId?: string;
    userName?: string;
    articleId?: string;
    articleTitle?: string;
  };
}

/**
 * Comment with User Data
 */
interface CommentWithUser {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
  users?: {
    username: string;
    full_name?: string;
  }[];
}

/**
 * Anjali Reaction with User Data
 */
interface AnjaliWithUser {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
  users?: {
    username: string;
    full_name?: string;
  }[];
}

/**
 * GET /api/admin/dashboard
 *
 * Fetches platform-wide statistics for administrators
 *
 * @returns Admin dashboard statistics and recent activity
 *
 * @example
 * ```ts
 * const response = await fetch('/api/admin/dashboard');
 * const { data } = await response.json();
 * console.log(data); // { stats: AdminDashboardStats, recentActivity: RecentActivity[] }
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
        createErrorResponse('FORBIDDEN', 'Only administrators can access this dashboard'),
        {
          status: HttpStatus.FORBIDDEN,
        }
      );
    }

    const supabase = createServerClient();

    // Fetch total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (usersError) {
      console.error('Error fetching total users:', usersError);
    }

    // Fetch total articles count
    const { count: totalArticles, error: articlesError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (articlesError) {
      console.error('Error fetching total articles:', articlesError);
    }

    // Calculate monthly active users (users who logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: monthlyActiveUsers, error: mauError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString())
      .is('deleted_at', null);

    if (mauError) {
      console.error('Error fetching MAU:', mauError);
    }

    // Calculate articles published this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { count: articlesPublishedThisMonth, error: monthlyArticlesError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', firstDayOfMonth.toISOString())
      .is('deleted_at', null);

    if (monthlyArticlesError) {
      console.error('Error fetching monthly articles:', monthlyArticlesError);
    }

    // Fetch total Anjali reactions
    const { count: totalAnjali, error: anjaliError } = await supabase
      .from('anjali_reactions')
      .select('*', { count: 'exact', head: true });

    if (anjaliError) {
      console.error('Error fetching total anjali:', anjaliError);
    }

    // Fetch total comments
    const { count: totalComments, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (commentsError) {
      console.error('Error fetching total comments:', commentsError);
    }

    // Calculate total views from all articles
    const { data: viewsData, error: viewsError } = await supabase
      .from('articles')
      .select('view_count')
      .is('deleted_at', null);

    const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

    if (viewsError) {
      console.error('Error fetching total views:', viewsError);
    }

    // Fetch pending article approvals (articles with status 'pending_approval')
    const { count: pendingApprovals, error: pendingError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval')
      .is('deleted_at', null);

    if (pendingError) {
      console.error('Error fetching pending approvals:', pendingError);
    }

    // Fetch recent activity (last 10 activities)
    const recentActivity: RecentActivity[] = [];

    // Recent user registrations
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('users')
      .select('id, username, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!recentUsersError && recentUsers) {
      recentUsers.forEach((user) => {
        recentActivity.push({
          id: `user-${user.id}`,
          type: 'user_registered',
          description: `${user.full_name || user.username} joined the platform`,
          timestamp: user.created_at,
          metadata: {
            userId: user.id,
            userName: user.full_name || user.username,
          },
        });
      });
    }

    // Recent published articles
    const { data: recentArticles, error: recentArticlesError } = await supabase
      .from('articles')
      .select('id, title_en, title_th, published_at, author_id')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    if (!recentArticlesError && recentArticles) {
      recentArticles.forEach((article) => {
        recentActivity.push({
          id: `article-${article.id}`,
          type: 'article_published',
          description: `New article published: ${article.title_en || article.title_th}`,
          timestamp: article.published_at || new Date().toISOString(),
          metadata: {
            articleId: article.id,
            articleTitle: article.title_en || article.title_th,
          },
        });
      });
    }

    // Recent comments
    const { data: recentComments, error: recentCommentsError } = await supabase
      .from('comments')
      .select('id, article_id, user_id, created_at, users!inner(username, full_name)')
      .order('created_at', { ascending: false })
      .limit(2);

    if (!recentCommentsError && recentComments) {
      (recentComments as CommentWithUser[]).forEach((comment) => {
        const user = comment.users?.[0];
        recentActivity.push({
          id: `comment-${comment.id}`,
          type: 'comment_posted',
          description: `${user?.full_name || user?.username || 'A user'} posted a comment`,
          timestamp: comment.created_at,
          metadata: {
            userId: comment.user_id,
            userName: user?.full_name || user?.username,
            articleId: comment.article_id,
          },
        });
      });
    }

    // Recent Anjali reactions
    const { data: recentAnjali, error: recentAnjaliError } = await supabase
      .from('anjali_reactions')
      .select('id, article_id, user_id, created_at, users!inner(username, full_name)')
      .order('created_at', { ascending: false })
      .limit(2);

    if (!recentAnjaliError && recentAnjali) {
      (recentAnjali as AnjaliWithUser[]).forEach((anjali) => {
        const user = anjali.users?.[0];
        recentActivity.push({
          id: `anjali-${anjali.id}`,
          type: 'anjali_given',
          description: `${user?.full_name || user?.username || 'A user'} gave Anjali 🙏`,
          timestamp: anjali.created_at,
          metadata: {
            userId: anjali.user_id,
            userName: user?.full_name || user?.username,
            articleId: anjali.article_id,
          },
        });
      });
    }

    // Sort recent activity by timestamp (most recent first)
    recentActivity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Prepare dashboard stats
    const dashboardStats: AdminDashboardStats = {
      totalUsers: totalUsers || 0,
      totalArticles: totalArticles || 0,
      monthlyActiveUsers: monthlyActiveUsers || 0,
      articlesPublishedThisMonth: articlesPublishedThisMonth || 0,
      totalAnjali: totalAnjali || 0,
      totalComments: totalComments || 0,
      totalViews: totalViews || 0,
      pendingApprovals: pendingApprovals || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: dashboardStats,
        recentActivity: recentActivity.slice(0, 10), // Limit to 10 items
      },
    });
  } catch (error) {
    console.error('Error in admin dashboard API:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while fetching dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
