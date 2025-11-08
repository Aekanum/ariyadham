'use client';

/**
 * CommentItem component
 * Story 5.2: Comments & Discussions
 *
 * Displays an individual comment with actions and nested replies
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithReplies } from '@/types/comment';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: CommentWithReplies;
  articleId: string;
  currentUserId?: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  articleId,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  maxDepth = 4,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const canReply = comment.depth < maxDepth;

  // Check if edit time limit has passed (15 minutes)
  const createdAt = new Date(comment.created_at);
  const now = new Date();
  const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  const canEdit = isOwner && minutesAgo <= 15;

  const handleReplySubmit = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    try {
      await onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } catch {
      // Error is handled by parent
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      setIsDeleting(false);
      // Error is handled by parent
    }
  };

  return (
    <div
      className={`border-l-2 ${comment.depth > 0 ? 'border-gray-200 pl-4' : 'border-transparent'}`}
    >
      <div className="py-4">
        {/* Comment Header */}
        <div className="flex items-start gap-3 mb-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.full_name || comment.user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {(comment.user.full_name || comment.user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User name and timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {comment.user.full_name || comment.user.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400 italic">(edited)</span>
              )}
            </div>

            {/* Comment body */}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSubmit}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {/* Action buttons */}
            {!isEditing && (
              <div className="flex items-center gap-4 mt-2">
                {canReply && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs font-medium text-gray-600 hover:text-blue-600"
                  >
                    Reply
                  </button>
                )}

                {comment.reply_count > 0 && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    {isCollapsed ? 'Show' : 'Hide'} {comment.reply_count}{' '}
                    {comment.reply_count === 1 ? 'reply' : 'replies'}
                  </button>
                )}

                {canEdit && !isDeleting && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-medium text-gray-600 hover:text-blue-600"
                  >
                    Edit
                  </button>
                )}

                {isOwner && !isDeleting && (
                  <button
                    onClick={handleDelete}
                    className="text-xs font-medium text-gray-600 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}

                {isDeleting && <span className="text-xs text-gray-500 italic">Deleting...</span>}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-3">
                <CommentForm
                  articleId={articleId}
                  parentCommentId={comment.id}
                  onSubmit={handleReplySubmit}
                  onCancel={() => setIsReplying(false)}
                  placeholder="Write your reply..."
                  autoFocus
                  isReply
                />
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {!isCollapsed && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                articleId={articleId}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
