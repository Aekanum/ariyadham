'use client';

/**
 * Bookmarks Page
 * Story 5.4: User Reading History & Bookmarks
 *
 * Displays user's bookmarked articles with ability to manage them
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { listBookmarks, toggleBookmark } from '@/lib/api/bookmarks';
import type { BookmarkWithArticle } from '@/types/bookmark';
import { Bookmark, BookmarkCheck, Clock, User, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listBookmarks({ page, limit });
      setBookmarks(data.bookmarks);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemoveBookmark = async (articleId: string, bookmarkId: string) => {
    if (removingId) return;

    setRemovingId(bookmarkId);

    try {
      await toggleBookmark(articleId);
      // Remove from list
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading && bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Articles saved for later reading
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading bookmarks...</p>
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
            <BookmarkCheck className="h-8 w-8 text-blue-600" />
            My Bookmarks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {total > 0 ? `${total} article${total === 1 ? '' : 's'} saved` : 'No bookmarks yet'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No bookmarks yet
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Start bookmarking articles to read them later
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
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex gap-4">
                  {/* Article Image */}
                  {bookmark.article.featured_image_url && (
                    <div className="flex-shrink-0">
                      <Link href={`/articles/${bookmark.article.slug}`}>
                        <img
                          src={bookmark.article.featured_image_url}
                          alt={bookmark.article.title}
                          className="h-24 w-32 rounded-lg object-cover"
                        />
                      </Link>
                    </div>
                  )}

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/articles/${bookmark.article.slug}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {bookmark.article.title}
                      </h3>
                    </Link>

                    {bookmark.article.excerpt && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {bookmark.article.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {/* Author */}
                      {bookmark.article.author?.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {bookmark.article.author.user.full_name ||
                              bookmark.article.author.user.username}
                          </span>
                        </div>
                      )}

                      {/* Reading Time */}
                      {bookmark.article.reading_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{bookmark.article.reading_time_minutes} min read</span>
                        </div>
                      )}

                      {/* Bookmarked Date */}
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        <span>
                          Saved{' '}
                          {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.article_id, bookmark.id)}
                      disabled={removingId === bookmark.id}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      aria-label="Remove bookmark"
                      title="Remove bookmark"
                    >
                      {removingId === bookmark.id ? (
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
