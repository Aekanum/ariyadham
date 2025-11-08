/**
 * Comments API client functions
 * Story 5.2: Comments & Discussions
 */

import type {
  CommentsResponse,
  CommentWithUser,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentSortOption,
} from '@/types/comment';

/**
 * Get comments for an article
 * @param articleId - The ID of the article
 * @param options - Query options (sort, limit, offset)
 * @returns Paginated comments with nested replies
 */
export async function getComments(
  articleId: string,
  options?: {
    sort?: CommentSortOption;
    limit?: number;
    offset?: number;
  }
): Promise<CommentsResponse> {
  const params = new URLSearchParams();

  if (options?.sort) {
    params.append('sort', options.sort);
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.offset) {
    params.append('offset', options.offset.toString());
  }

  const url = `/api/articles/${articleId}/comments?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch comments');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a new comment on an article
 * @param request - Comment creation request
 * @returns The created comment
 */
export async function createComment(request: CreateCommentRequest): Promise<CommentWithUser> {
  const response = await fetch(`/api/articles/${request.article_id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: request.content,
      parent_comment_id: request.parent_comment_id || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create comment');
  }

  const result = await response.json();
  return result.data.comment;
}

/**
 * Update an existing comment
 * @param commentId - The ID of the comment to update
 * @param request - Update request with new content
 * @returns The updated comment
 */
export async function updateComment(
  commentId: string,
  request: UpdateCommentRequest
): Promise<CommentWithUser> {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update comment');
  }

  const result = await response.json();
  return result.data.comment;
}

/**
 * Delete a comment (soft delete)
 * @param commentId - The ID of the comment to delete
 */
export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
}
