'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Article for Moderation
 */
interface ArticleForModeration {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    full_name?: string;
  };
}

/**
 * Admin Content Moderation Page
 *
 * Story: 6.3 - Content Moderation
 *
 * Features:
 * - Protected route (requires admin role)
 * - List articles pending approval
 * - Preview article content
 * - Approve/reject articles with optional reason
 * - Unpublish published articles
 * - Audit trail of moderation actions
 */
export default function AdminModerationPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [pendingArticles, setpendingArticles] = useState<ArticleForModeration[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<ArticleForModeration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

  // Preview modal state
  const [previewArticle, setPreviewArticle] = useState<ArticleForModeration | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Reject modal state
  const [rejectArticle, setRejectArticle] = useState<ArticleForModeration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  /**
   * Redirect if not logged in or not an admin
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access content moderation');
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      router.push('/unauthorized?message=Only administrators can access this page');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch articles for moderation
   */
  const fetchArticles = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;

    try {
      setError(null);

      // Fetch pending articles
      const pendingResponse = await fetch('/api/admin/moderation/pending');
      const pendingData = await pendingResponse.json();

      if (!pendingResponse.ok || !pendingData.success) {
        throw new Error(pendingData.error?.message || 'Failed to load pending articles');
      }

      setpendingArticles(pendingData.data.articles || []);

      // Fetch published articles (for unpublishing)
      const publishedResponse = await fetch('/api/admin/moderation/published');
      const publishedData = await publishedResponse.json();

      if (!publishedResponse.ok || !publishedData.success) {
        throw new Error(publishedData.error?.message || 'Failed to load published articles');
      }

      setPublishedArticles(publishedData.data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      console.error('Articles fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;
    fetchArticles();
  }, [isLoggedIn, user, fetchArticles]);

  /**
   * Handle approve article
   */
  const handleApprove = async (article: ArticleForModeration) => {
    if (!confirm(`Are you sure you want to approve and publish "${article.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/moderation/${article.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to approve article');
      }

      alert('Article approved and published successfully');
      await fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve article');
      console.error('Approve error:', err);
    }
  };

  /**
   * Handle reject article
   */
  const handleReject = async () => {
    if (!rejectArticle) return;

    try {
      const response = await fetch(`/api/admin/moderation/${rejectArticle.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to reject article');
      }

      alert('Article rejected successfully');
      setIsRejectModalOpen(false);
      setRejectArticle(null);
      setRejectReason('');
      await fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject article');
      console.error('Reject error:', err);
    }
  };

  /**
   * Handle unpublish article
   */
  const handleUnpublish = async (article: ArticleForModeration) => {
    const reason = prompt(`Reason for unpublishing "${article.title}":`);
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`/api/admin/moderation/${article.id}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to unpublish article');
      }

      alert('Article unpublished successfully');
      await fetchArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unpublish article');
      console.error('Unpublish error:', err);
    }
  };

  /**
   * Open preview modal
   */
  const openPreview = (article: ArticleForModeration) => {
    setPreviewArticle(article);
    setIsPreviewOpen(true);
  };

  /**
   * Open reject modal
   */
  const openRejectModal = (article: ArticleForModeration) => {
    setRejectArticle(article);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  /**
   * Loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading moderation queue...</p>
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
              fetchArticles();
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review and moderate articles before publication
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Pending Approval
              {pendingArticles.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">
                  {pendingArticles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'published'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Published Articles
            </button>
          </nav>
        </div>

        {/* Pending Articles Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingArticles.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
                <div className="text-6xl">✅</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No pending articles
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  All articles have been reviewed
                </p>
              </div>
            ) : (
              pendingArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onPreview={() => openPreview(article)}
                  onApprove={() => handleApprove(article)}
                  onReject={() => openRejectModal(article)}
                  isPending
                />
              ))
            )}
          </div>
        )}

        {/* Published Articles Tab */}
        {activeTab === 'published' && (
          <div className="space-y-4">
            {publishedArticles.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
                <div className="text-6xl">📝</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No published articles
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  No articles have been published yet
                </p>
              </div>
            ) : (
              publishedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onPreview={() => openPreview(article)}
                  onUnpublish={() => handleUnpublish(article)}
                  isPending={false}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewArticle && (
        <ArticlePreviewModal
          article={previewArticle}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewArticle(null);
          }}
        />
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && rejectArticle && (
        <RejectModal
          article={rejectArticle}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleReject}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectArticle(null);
            setRejectReason('');
          }}
        />
      )}
    </div>
  );
}

/**
 * Article Card Component
 */
interface ArticleCardProps {
  article: ArticleForModeration;
  onPreview: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onUnpublish?: () => void;
  isPending: boolean;
}

function ArticleCard({
  article,
  onPreview,
  onApprove,
  onReject,
  onUnpublish,
  isPending,
}: ArticleCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{article.title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            By {article.author.full_name || article.author.username}
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {article.excerpt || article.content.substring(0, 200) + '...'}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Submitted: {new Date(article.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(article.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="ml-6 flex flex-col gap-2">
          <button
            onClick={onPreview}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            Preview
          </button>
          {isPending && onApprove && (
            <button
              onClick={onApprove}
              className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
            >
              Approve
            </button>
          )}
          {isPending && onReject && (
            <button
              onClick={onReject}
              className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              Reject
            </button>
          )}
          {!isPending && onUnpublish && (
            <button
              onClick={onUnpublish}
              className="rounded bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Article Preview Modal
 */
interface ArticlePreviewModalProps {
  article: ArticleForModeration;
  onClose: () => void;
}

function ArticlePreviewModal({ article, onClose }: ArticlePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{article.title}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              By {article.author.full_name || article.author.username} •{' '}
              {new Date(article.created_at).toLocaleDateString()}
            </p>
          </div>

          {article.excerpt && (
            <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">{article.excerpt}</p>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {article.content}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reject Modal
 */
interface RejectModalProps {
  article: ArticleForModeration;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function RejectModal({ article, reason, onReasonChange, onConfirm, onClose }: RejectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reject Article</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to reject <strong>{article.title}</strong>?
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason for rejection (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Provide feedback to the author..."
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}
