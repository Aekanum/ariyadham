'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { AnalyticsResponse } from '@/app/api/admin/analytics/route';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Admin Analytics Page
 *
 * Story: 6.4 - Analytics & Reporting
 *
 * Features:
 * - Protected route (requires admin role)
 * - User growth trends chart
 * - Article publication trends chart
 * - Most popular articles table
 * - Top authors table
 * - Engagement metrics charts
 * - Date range selector
 * - CSV export functionality
 */
export default function AnalyticsPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state (default: last 30 days)
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  /**
   * Redirect if not logged in or not an admin
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access analytics');
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      router.push('/unauthorized?message=Only administrators can access analytics');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(`/api/admin/analytics?${params}`);
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
  }, [isLoggedIn, user, startDate, endDate]);

  /**
   * Fetch analytics on mount and when date range changes
   */
  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;
    fetchAnalytics();
  }, [isLoggedIn, user, startDate, endDate, fetchAnalytics]);

  /**
   * Export data as CSV
   */
  const exportToCSV = (type: 'articles' | 'authors' | 'users' | 'engagement') => {
    if (!analytics) return;

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'articles':
        csvContent = 'Title,Views,Anjali,Comments,Shares\n';
        analytics.topArticles.forEach((article) => {
          csvContent += `"${article.title}",${article.views},${article.anjali},${article.comments},${article.shares}\n`;
        });
        filename = 'top-articles.csv';
        break;

      case 'authors':
        csvContent = 'Author Name,Article Count,Total Views,Total Anjali,Total Comments\n';
        analytics.topAuthors.forEach((author) => {
          csvContent += `"${author.name}",${author.articleCount},${author.totalViews},${author.totalAnjali},${author.totalComments}\n`;
        });
        filename = 'top-authors.csv';
        break;

      case 'users':
        csvContent = 'Date,New Users\n';
        analytics.userGrowth.forEach((point) => {
          csvContent += `${point.date},${point.value}\n`;
        });
        filename = 'user-growth.csv';
        break;

      case 'engagement':
        csvContent = 'Date,Anjali,Comments,Shares\n';
        analytics.engagementTrends.anjali.forEach((point, index) => {
          const comments = analytics.engagementTrends.comments[index]?.value || 0;
          const shares = analytics.engagementTrends.shares[index]?.value || 0;
          csvContent += `${point.date},${point.value},${comments},${shares}\n`;
        });
        filename = 'engagement-trends.csv';
        break;
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Quick date range presets
   */
  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

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
          <button
            onClick={fetchAnalytics}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reporting
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Detailed platform analytics and insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Date Range</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange(7)}
                className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange(30)}
                className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange(90)}
                className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Last 90 Days
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Charts Section */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* User Growth Chart */}
              <ChartCard title="User Growth" onExport={() => exportToCSV('users')}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Article Publications Chart */}
              <ChartCard title="Article Publications" onExport={() => exportToCSV('users')}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.articlePublications}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="Articles Published" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Engagement Trends Chart */}
              <ChartCard
                title="Engagement Trends"
                onExport={() => exportToCSV('engagement')}
                className="lg:col-span-2"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.engagementTrends.anjali}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f59e0b"
                      name="Anjali 🙏"
                      data={analytics.engagementTrends.anjali}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      name="Comments"
                      data={analytics.engagementTrends.comments}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Top Articles Table */}
            <div className="mb-8">
              <TableCard title="Most Popular Articles" onExport={() => exportToCSV('articles')}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Anjali
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Comments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Shares
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {analytics.topArticles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                        >
                          No articles found
                        </td>
                      </tr>
                    ) : (
                      analytics.topArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {article.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {article.views.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {article.anjali.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {article.comments.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {article.shares.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableCard>
            </div>

            {/* Top Authors Table */}
            <div className="mb-8">
              <TableCard title="Top Authors" onExport={() => exportToCSV('authors')}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Articles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total Anjali
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {analytics.topAuthors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                        >
                          No authors found
                        </td>
                      </tr>
                    ) : (
                      analytics.topAuthors.map((author) => (
                        <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {author.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {author.articleCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {author.totalViews.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {author.totalAnjali.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {author.totalComments.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </TableCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ChartCard Component
 */
interface ChartCardProps {
  title: string;
  onExport: () => void;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, onExport, children, className = '' }: ChartCardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow dark:bg-gray-800 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <button
          onClick={onExport}
          className="rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
        >
          Export CSV
        </button>
      </div>
      {children}
    </div>
  );
}

/**
 * TableCard Component
 */
interface TableCardProps {
  title: string;
  onExport: () => void;
  children: React.ReactNode;
}

function TableCard({ title, onExport, children }: TableCardProps) {
  return (
    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <button
          onClick={onExport}
          className="rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
