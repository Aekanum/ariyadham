/**
 * Custom hook for managing comments
 * Story 5.2: Comments & Discussions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CommentWithReplies,
  CommentSortOption,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@/types/comment';
import { getComments, createComment, updateComment, deleteComment } from '@/lib/api/comments';

interface UseCommentsOptions {
  articleId: string;
  initialSort?: CommentSortOption;
  pageSize?: number;
}

interface UseCommentsReturn {
  comments: CommentWithReplies[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sort: CommentSortOption;
  setSort: (sort: CommentSortOption) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<void>;
  editComment: (commentId: string, content: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
}

/**
 * Hook to manage comments for an article
 */
export function useComments({
  articleId,
  initialSort = 'newest',
  pageSize = 50,
}: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<CommentSortOption>(initialSort);
  const [offset, setOffset] = useState(0);

  // Fetch comments
  const fetchComments = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;

        const response = await getComments(articleId, {
          sort,
          limit: pageSize,
          offset: currentOffset,
        });

        if (reset) {
          setComments(response.comments);
          setOffset(pageSize);
        } else {
          setComments((prev) => [...prev, ...response.comments]);
          setOffset((prev) => prev + pageSize);
        }

        setTotalCount(response.total_count);
        setHasMore(response.has_more);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    },
    [articleId, sort, pageSize, offset]
  );

  // Load initial comments when articleId or sort changes
  useEffect(() => {
    setOffset(0);
    fetchComments(true);
  }, [articleId, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more comments
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchComments(false);
  }, [hasMore, isLoading, fetchComments]);

  // Refresh comments
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchComments(true);
  }, [fetchComments]);

  // Add a new comment
  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      try {
        setError(null);

        const request: CreateCommentRequest = {
          article_id: articleId,
          content,
          parent_comment_id: parentId || null,
        };

        await createComment(request);

        // Refresh to show new comment
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to post comment';
        setError(errorMessage);
        throw err; // Re-throw so component can handle it
      }
    },
    [articleId, refresh]
  );

  // Edit a comment
  const editComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        setError(null);

        const request: UpdateCommentRequest = {
          content,
        };

        await updateComment(commentId, request);

        // Refresh to show updated comment
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
        setError(errorMessage);
        throw err;
      }
    },
    [refresh]
  );

  // Delete a comment
  const removeComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null);

        await deleteComment(commentId);

        // Refresh to remove deleted comment
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        setError(errorMessage);
        throw err;
      }
    },
    [refresh]
  );

  // Handle sort change
  const handleSortChange = useCallback((newSort: CommentSortOption) => {
    setSort(newSort);
  }, []);

  return {
    comments,
    totalCount,
    isLoading,
    error,
    hasMore,
    sort,
    setSort: handleSortChange,
    loadMore,
    refresh,
    addComment,
    editComment,
    removeComment,
  };
}
