'use client';

/**
 * CommentList component
 * Story 5.2: Comments & Discussions
 *
 * Container for displaying a list of comments with sorting and pagination
 */

import { CommentWithReplies, CommentSortOption } from '@/types/comment';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: CommentWithReplies[];
  articleId: string;
  currentUserId?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  sort: CommentSortOption;
  onSortChange: (sort: CommentSortOption) => void;
  onLoadMore: () => void;
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentList({
  comments,
  articleId,
  currentUserId,
  isLoading = false,
  hasMore = false,
  sort,
  onSortChange,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
}: CommentListProps) {
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-3">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No comments yet</h3>
        <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="text-sm text-gray-600">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CommentSortOption)}
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Comments list */}
      <div className="divide-y divide-gray-100">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            articleId={articleId}
            currentUserId={currentUserId}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className={`
              px-6 py-2 text-sm font-medium rounded-lg
              transition-colors
              ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isLoading ? 'Loading...' : 'Load More Comments'}
          </button>
        </div>
      )}
    </div>
  );
}
