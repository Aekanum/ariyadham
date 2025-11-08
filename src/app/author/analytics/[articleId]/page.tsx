'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { ArticleAnalytics } from '@/app/api/author/articles/[articleId]/analytics/route';

/**
 * Article Analytics Detail Page
 *
 * Story: 4.4 - Author Dashboard & Analytics
 *
 * Features:
 * - Protected route (requires author/admin role)
 * - Detailed analytics for a specific article
 * - Views trend chart over time
 * - Time period selector (7, 30, 90 days)
 * - Engagement metrics (views, anjali, comments)
 */
export default function ArticleAnalyticsPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params?.articleId as string;

  const [analytics, setAnalytics] = useState<ArticleAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);

  /**
   * Redirect if not logged in or not an author
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access analytics');
      return;
    }

    if (!authLoading && user && !['author', 'admin'].includes(user.role)) {
      router.push('/unauthorized?message=Only authors can access analytics');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch article analytics
   */
  useEffect(() => {
    if (!isLoggedIn || !user || !['author', 'admin'].includes(user.role) || !articleId) return;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/author/articles/${articleId}/analytics?period=${period}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to load analytics');
        }

        setAnalytics(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isLoggedIn, user, articleId, period]);

  /**
   * Loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => router.push('/author/dashboard')}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/author/dashboard"
            className="mb-4 inline-block text-primary hover:text-primary-dark dark:text-primary-light"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.title}</h1>
          <div className="mt-2 flex items-center gap-4">
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                analytics.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : analytics.status === 'draft'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : analytics.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {analytics.status}
            </span>
            {analytics.publishedAt && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Published: {new Date(analytics.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Views" value={analytics.totalViews.toLocaleString()} icon="👁️" />
          <MetricCard
            title="Total Anjali"
            value={analytics.totalAnjali.toLocaleString()}
            icon="🙏"
          />
          <MetricCard
            title="Total Comments"
            value={analytics.totalComments.toLocaleString()}
            icon="💬"
          />
          <MetricCard
            title="Engagement Rate"
            value={
              analytics.totalViews > 0
                ? `${(((analytics.totalAnjali + analytics.totalComments) / analytics.totalViews) * 100).toFixed(1)}%`
                : '0%'
            }
            icon="📊"
          />
        </div>

        {/* Time Period Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TimeStatCard period="Last 7 Days" views={analytics.viewsLast7Days} />
          <TimeStatCard period="Last 30 Days" views={analytics.viewsLast30Days} />
          <TimeStatCard period="Last 90 Days" views={analytics.viewsLast90Days} />
        </div>

        {/* Views Chart */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Views Over Time</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod(7)}
                className={`rounded px-4 py-2 text-sm ${
                  period === 7
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod(30)}
                className={`rounded px-4 py-2 text-sm ${
                  period === 30
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod(90)}
                className={`rounded px-4 py-2 text-sm ${
                  period === 90
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          {analytics.dailyStats.length > 0 ? (
            <ViewsChart data={analytics.dailyStats} />
          ) : (
            <div className="py-12 text-center text-gray-600 dark:text-gray-400">
              No view data available for this period
            </div>
          )}
        </div>

        {/* Article Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/articles/${analytics.slug}`}
            className="inline-block rounded bg-primary px-6 py-3 text-white hover:bg-primary-dark"
          >
            View Article →
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * MetricCard Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}

/**
 * TimeStatCard Component
 */
interface TimeStatCardProps {
  period: string;
  views: number;
}

function TimeStatCard({ period, views }: TimeStatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">{period}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
        {views.toLocaleString()} views
      </p>
    </div>
  );
}

/**
 * ViewsChart Component
 * Simple line chart using SVG
 */
interface ViewsChartProps {
  data: Array<{ date: string; views: number; uniqueViewers: number }>;
}

function ViewsChart({ data }: ViewsChartProps) {
  if (data.length === 0) return null;

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = 40;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (d.views / maxViews) * (chartHeight - 2 * padding);
    return { x, y, date: d.date, views: d.views, uniqueViewers: d.uniqueViewers };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ minWidth: '600px' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
                strokeDasharray="4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-600 text-xs dark:fill-gray-400"
              >
                {Math.round(maxViews * ratio)}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathData} fill="none" stroke="#3B82F6" strokeWidth="2" />

        {/* Area fill */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
          fill="#3B82F6"
          opacity="0.1"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle cx={point.x} cy={point.y} r="4" fill="#3B82F6" className="cursor-pointer">
              <title>{`${new Date(point.date).toLocaleDateString()}: ${point.views} views (${point.uniqueViewers} unique)`}</title>
            </circle>
          </g>
        ))}

        {/* X-axis labels (show every few days to avoid crowding) */}
        {points.map((point, i) => {
          const showLabel = data.length <= 7 || i % Math.ceil(data.length / 7) === 0;
          if (!showLabel && i !== data.length - 1) return null;

          return (
            <text
              key={i}
              x={point.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="fill-gray-600 text-xs dark:fill-gray-400"
            >
              {new Date(point.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
