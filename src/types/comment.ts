/**
 * Comment type definitions
 * Story 5.2: Comments & Discussions
 */

/**
 * Comment status enum
 */
export type CommentStatus = 'published' | 'pending' | 'approved' | 'rejected' | 'deleted' | 'spam';

/**
 * Comment sort options
 */
export type CommentSortOption = 'newest' | 'oldest';

/**
 * Base comment interface
 */
export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommentStatus;
  flagged_as_spam: boolean;
  reply_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Comment with user profile information
 */
export interface CommentWithUser extends Comment {
  user: {
    id: string;
    full_name: string | null;
    username: string;
    avatar_url: string | null;
  };
}

/**
 * Comment with nested replies (tree structure)
 */
export interface CommentWithReplies extends CommentWithUser {
  replies: CommentWithReplies[];
  depth: number; // Nesting level (0 = top-level)
}

/**
 * Comment tree node for rendering
 */
export interface CommentTreeNode {
  comment: CommentWithUser;
  replies: CommentTreeNode[];
  depth: number;
  isCollapsed?: boolean;
}

/**
 * Create comment request
 */
export interface CreateCommentRequest {
  article_id: string;
  content: string;
  parent_comment_id?: string | null;
}

/**
 * Update comment request
 */
export interface UpdateCommentRequest {
  content: string;
}

/**
 * Delete comment request (soft delete)
 */
export interface DeleteCommentRequest {
  comment_id: string;
}

/**
 * Get comments query parameters
 */
export interface GetCommentsParams {
  article_id: string;
  sort?: CommentSortOption;
  limit?: number;
  offset?: number;
  parent_id?: string | null; // For fetching only replies to a specific comment
}

/**
 * Comments response (paginated)
 */
export interface CommentsResponse {
  comments: CommentWithReplies[];
  total_count: number;
  has_more: boolean;
  next_offset?: number;
}

/**
 * Single comment response (after create/update)
 */
export interface CommentResponse {
  comment: CommentWithUser;
}

/**
 * Comment API response wrapper
 */
export interface CommentApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Comment form data
 */
export interface CommentFormData {
  content: string;
  parent_comment_id?: string | null;
}

/**
 * Comment action types for UI state
 */
export type CommentAction = 'reply' | 'edit' | 'delete' | 'report';

/**
 * Comment UI state
 */
export interface CommentUIState {
  activeAction: CommentAction | null;
  activeCommentId: string | null;
  editingCommentId: string | null;
  replyingToCommentId: string | null;
  deletingCommentId: string | null;
}

/**
 * Comment permissions
 */
export interface CommentPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
  canReport: boolean;
}

/**
 * Comment metadata (for analytics/moderation)
 */
export interface CommentMetadata {
  edit_count: number;
  last_edited_at: string | null;
  moderator_note: string | null;
  reported_count: number;
}
