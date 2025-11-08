'use client';

/**
 * Reading History Page
 * Story 5.4: User Reading History & Bookmarks
 *
 * Displays user's reading history with completion status
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { listReadingHistory, deleteReadingHistory } from '@/lib/api/reading-history';
import type { ReadingHistoryWithArticle } from '@/types/bookmark';
import { BookOpen, Clock, User, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryWithArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCompleted, setFilterCompleted] = useState<boolean | undefined>(undefined);
  const limit = 20;

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listReadingHistory({ page, limit, completed: filterCompleted });
      setHistory(data.history);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load reading history:', err);
      setError('Failed to load reading history');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterCompleted]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRemoveHistory = async (articleId: string, historyId: string) => {
    if (removingId) return;

    setRemovingId(historyId);

    try {
      await deleteReadingHistory(articleId);
      // Remove from list
      setHistory((prev) => prev.filter((h) => h.id !== historyId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error('Failed to remove history:', err);
      setError('Failed to remove history');
    } finally {
      setRemovingId(null);
    }
  };

  const formatReadingTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (loading && history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reading History</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Track your reading progress</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Reading History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {total > 0
              ? `${total} article${total === 1 ? '' : 's'} read`
              : 'No reading history yet'}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterCompleted(undefined)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterCompleted === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCompleted(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterCompleted === true
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterCompleted(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterCompleted === false
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            In Progress
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No reading history yet
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Start reading articles to build your history
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="group rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex gap-4">
                  {/* Article Image */}
                  {item.article.featured_image_url && (
                    <div className="flex-shrink-0">
                      <Link href={`/articles/${item.article.slug}`}>
                        <img
                          src={item.article.featured_image_url}
                          alt={item.article.title}
                          className="h-24 w-32 rounded-lg object-cover"
                        />
                      </Link>
                    </div>
                  )}

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link
                        href={`/articles/${item.article.slug}`}
                        className="block hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.article.title}
                        </h3>
                      </Link>

                      {/* Completion Status */}
                      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                        {item.completed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-green-700 dark:text-green-300">Completed</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-700 dark:text-amber-300">
                              {item.completion_percentage}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {item.article.excerpt && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.article.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {/* Author */}
                      {item.article.author?.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {item.article.author.user.full_name ||
                              item.article.author.user.username}
                          </span>
                        </div>
                      )}

                      {/* Time Spent */}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatReadingTime(item.time_spent_seconds)} spent</span>
                      </div>

                      {/* Last Read */}
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>
                          Read {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!item.completed && (
                      <div className="mt-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${item.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleRemoveHistory(item.article_id, item.id)}
                      disabled={removingId === item.id}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      aria-label="Remove from history"
                      title="Remove from history"
                    >
                      {removingId === item.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
