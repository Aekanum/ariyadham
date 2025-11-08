'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminDashboardStats, RecentActivity } from '@/app/api/admin/dashboard/route';

/**
 * Admin Dashboard Page
 *
 * Story: 6.1 - Admin Dashboard Overview
 *
 * Features:
 * - Protected route (requires admin role)
 * - Platform-wide statistics display
 * - Recent activity feed
 * - Auto-refresh every minute
 * - Quick action links
 */
export default function AdminDashboardPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  /**
   * Redirect if not logged in or not an admin
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access the admin dashboard');
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      router.push('/unauthorized?message=Only administrators can access this page');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch dashboard data
   */
  const fetchDashboard = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;

    try {
      setError(null);

      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load admin dashboard');
      }

      setStats(data.data.stats);
      setRecentActivity(data.data.recentActivity || []);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  /**
   * Initial fetch and setup auto-refresh (every 60 seconds)
   */
  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;

    fetchDashboard();

    // Auto-refresh every minute
    const refreshInterval = setInterval(() => {
      fetchDashboard();
    }, 60000); // 60 seconds

    return () => clearInterval(refreshInterval);
  }, [isLoggedIn, user, fetchDashboard]);

  /**
   * Loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchDashboard();
            }}
            className="mt-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Platform health and activity overview
            </p>
            {lastRefreshed && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchDashboard();
            }}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Refresh Now
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              subtitle={`${stats.monthlyActiveUsers.toLocaleString()} active this month`}
              icon="👥"
              trend={
                stats.monthlyActiveUsers > 0
                  ? `${Math.round((stats.monthlyActiveUsers / stats.totalUsers) * 100)}% active`
                  : undefined
              }
            />
            <StatCard
              title="Total Articles"
              value={stats.totalArticles.toLocaleString()}
              subtitle={`${stats.articlesPublishedThisMonth.toLocaleString()} published this month`}
              icon="📝"
              trend={
                stats.pendingApprovals > 0
                  ? `${stats.pendingApprovals} pending approval`
                  : 'All approved'
              }
              trendColor={stats.pendingApprovals > 0 ? 'text-yellow-600' : 'text-green-600'}
            />
            <StatCard
              title="Total Views"
              value={stats.totalViews.toLocaleString()}
              subtitle="All-time article views"
              icon="👁️"
            />
            <StatCard
              title="Engagement"
              value={`${stats.totalAnjali.toLocaleString()} 🙏`}
              subtitle={`${stats.totalComments.toLocaleString()} comments`}
              icon="💬"
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <QuickActionLink
                  href="/admin/users"
                  label="Manage Users"
                  icon="👥"
                  description="View and manage user accounts"
                />
                <QuickActionLink
                  href="/admin/moderation"
                  label="Content Moderation"
                  icon="🔍"
                  description="Review pending articles"
                  badge={stats?.pendingApprovals}
                />
                <QuickActionLink
                  href="/admin/analytics"
                  label="Analytics & Reports"
                  icon="📊"
                  description="View detailed platform analytics"
                />
                <QuickActionLink
                  href="/admin/settings"
                  label="Platform Settings"
                  icon="⚙️"
                  description="Configure platform settings"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StatCard Component
 * Displays a single dashboard statistic
 */
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  trend?: string;
  trendColor?: string;
}

function StatCard({ title, value, subtitle, icon, trend, trendColor }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 text-xs font-medium ${trendColor || 'text-blue-600 dark:text-blue-400'}`}
            >
              {trend}
            </p>
          )}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}

/**
 * ActivityItem Component
 * Displays a single recent activity item
 */
interface ActivityItemProps {
  activity: RecentActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return '👤';
      case 'article_published':
        return '📝';
      case 'comment_posted':
        return '💬';
      case 'anjali_given':
        return '🙏';
      default:
        return '•';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'article_published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'comment_posted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'anjali_given':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
      >
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {timeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

/**
 * QuickActionLink Component
 * Displays a quick action link
 */
interface QuickActionLinkProps {
  href: string;
  label: string;
  icon: string;
  description: string;
  badge?: number;
}

function QuickActionLink({ href, label, icon, description, badge }: QuickActionLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:border-primary dark:hover:bg-gray-750"
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {badge !== undefined && badge > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
