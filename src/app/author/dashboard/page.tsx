'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardStats } from '@/app/api/author/dashboard/route';
import type { ArticleWithStats } from '@/app/api/author/articles/route';

/**
 * Author Dashboard Page
 *
 * Story: 4.4 - Author Dashboard & Analytics
 *
 * Features:
 * - Protected route (requires author/admin role)
 * - Overall statistics display
 * - List of author's articles with key metrics
 * - Quick filters and sorting
 * - Links to detailed analytics per article
 */
export default function AuthorDashboardPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<ArticleWithStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('published_at');

  /**
   * Redirect if not logged in or not an author
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access the dashboard');
      return;
    }

    if (!authLoading && user && !['author', 'admin'].includes(user.role)) {
      router.push('/unauthorized?message=Only authors can access the dashboard');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch dashboard statistics
   */
  useEffect(() => {
    if (!isLoggedIn || !user || !['author', 'admin'].includes(user.role)) return;

    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        setError(null);

        const response = await fetch('/api/author/dashboard');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to load dashboard statistics');
        }

        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [isLoggedIn, user]);

  /**
   * Fetch articles list
   */
  useEffect(() => {
    if (!isLoggedIn || !user || !['author', 'admin'].includes(user.role)) return;

    const fetchArticles = async () => {
      try {
        setIsLoadingArticles(true);

        const params = new URLSearchParams();
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        params.append('sort', sortBy);
        params.append('order', 'desc');

        const response = await fetch(`/api/author/articles?${params.toString()}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to load articles');
        }

        setArticles(data.data);
      } catch (err) {
        console.error('Articles fetch error:', err);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchArticles();
  }, [isLoggedIn, user, statusFilter, sortBy]);

  /**
   * Loading state
   */
  if (authLoading || isLoadingStats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
            onClick={() => window.location.reload()}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Author Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your articles' performance and engagement
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Articles"
              value={stats.totalArticles}
              subtitle={`${stats.publishedArticles} published, ${stats.draftArticles} drafts`}
              icon="📝"
            />
            <StatCard
              title="Total Views"
              value={stats.totalViews.toLocaleString()}
              subtitle="All-time views"
              icon="👁️"
            />
            <StatCard
              title="Total Anjali"
              value={stats.totalAnjali.toLocaleString()}
              subtitle="Gratitude received"
              icon="🙏"
            />
            <StatCard
              title="Total Comments"
              value={stats.totalComments.toLocaleString()}
              subtitle="Community engagement"
              icon="💬"
            />
          </div>
        )}

        {/* Articles List */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Articles</h2>

            <div className="flex gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="scheduled">Scheduled</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="published_at">Recently Published</option>
                <option value="view_count">Most Viewed</option>
                <option value="anjali_count">Most Anjali</option>
                <option value="comment_count">Most Comments</option>
              </select>
            </div>
          </div>

          {/* Articles Table */}
          {isLoadingArticles ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No articles found</p>
              <Link
                href="/cms/create"
                className="mt-4 inline-block rounded bg-primary px-6 py-2 text-white hover:bg-primary-dark"
              >
                Create Your First Article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Views
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Anjali
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Comments
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString()
                              : 'Not published'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : article.status === 'draft'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : article.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                        <div>{article.totalViews.toLocaleString()}</div>
                        {article.viewsLast30Days > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{article.viewsLast30Days} (30d)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                        {article.totalAnjali.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                        {article.totalComments.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/author/analytics/${article.id}`}
                          className="text-primary hover:text-primary-dark dark:text-primary-light"
                        >
                          View Analytics →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}
