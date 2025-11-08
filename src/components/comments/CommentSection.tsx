'use client';

/**
 * CommentSection component
 * Story 5.2: Comments & Discussions
 *
 * Main container component that integrates all comment functionality
 */

import { useEffect, useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

interface CommentSectionProps {
  articleId: string;
  initialCommentCount?: number;
  currentUserId?: string;
}

export function CommentSection({
  articleId,
  initialCommentCount = 0,
  currentUserId,
}: CommentSectionProps) {
  const {
    comments,
    totalCount,
    isLoading,
    error,
    hasMore,
    sort,
    setSort,
    loadMore,
    refresh,
    addComment,
    editComment,
    removeComment,
  } = useComments({
    articleId,
    initialSort: 'newest',
  });

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle adding a new comment
  const handleAddComment = async (content: string) => {
    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }

    await addComment(content);
  };

  // Handle replying to a comment
  const handleReply = async (content: string, parentId: string) => {
    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }

    await addComment(content, parentId);
  };

  // Handle editing a comment
  const handleEdit = async (commentId: string, content: string) => {
    await editComment(commentId, content);
  };

  // Handle deleting a comment
  const handleDelete = async (commentId: string) => {
    await removeComment(commentId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          💬 Comments
          {totalCount > 0 && (
            <span className="text-lg font-normal text-gray-500">({totalCount})</span>
          )}
        </h2>
        <p className="text-sm text-gray-600 mt-1">Join the conversation and share your thoughts</p>
      </div>

      {/* Login prompt for anonymous users */}
      {!currentUserId ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-3">
            <strong>Sign in to join the discussion</strong>
          </p>
          <div className="flex gap-2">
            <a
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-600 hover:bg-blue-50"
            >
              Create Account
            </a>
          </div>
        </div>
      ) : (
        /* Comment form for authenticated users */
        <div className="mb-8">
          <CommentForm
            articleId={articleId}
            onSubmit={handleAddComment}
            placeholder="Share your thoughts on this article..."
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">⚠️ {error}</p>
          <button
            onClick={refresh}
            className="text-sm text-red-600 hover:text-red-800 underline mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {/* Comments list */}
      <CommentList
        comments={comments}
        articleId={articleId}
        currentUserId={currentUserId}
        isLoading={isLoading}
        hasMore={hasMore}
        sort={sort}
        onSortChange={setSort}
        onLoadMore={loadMore}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Login prompt modal (if triggered) */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign in required</h3>
            <p className="text-sm text-gray-600 mb-4">
              You need to be signed in to comment on articles.
            </p>
            <div className="flex gap-2">
              <a
                href="/auth/login"
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center"
              >
                Sign In
              </a>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
