'use client';

/**
 * CommentForm component
 * Story 5.2: Comments & Discussions
 *
 * Form for submitting new comments or replies
 */

import { useState, FormEvent } from 'react';

interface CommentFormProps {
  articleId: string;
  parentCommentId?: string | null;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  isReply?: boolean;
}

export function CommentForm({
  parentCommentId,
  onSubmit,
  onCancel,
  placeholder = 'Share your thoughts...',
  autoFocus = false,
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 5000;
  const isNearLimit = content.length > maxLength * 0.9;
  const isOverLimit = content.length > maxLength;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (isOverLimit) {
      setError('Comment is too long');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim(), parentCommentId || undefined);
      setContent(''); // Clear form on success
      // Note: Parent component should refresh comments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          rows={isReply ? 3 : 4}
          className={`
            w-full px-4 py-3 rounded-lg border
            focus:outline-none focus:ring-2
            transition-colors resize-none
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
        />

        {/* Character counter */}
        {content.length > 0 && (
          <div
            className={`
            absolute bottom-2 right-2 text-xs
            ${isOverLimit ? 'text-red-500 font-semibold' : isNearLimit ? 'text-orange-500' : 'text-gray-400'}
          `}
          >
            {content.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <div className="text-sm text-red-600 flex items-center gap-1">⚠️ {error}</div>}

      {/* Action buttons */}
      <div className="flex items-center gap-2 justify-end">
        {isReply && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || isOverLimit}
          className={`
            px-5 py-2 text-sm font-medium rounded-lg
            transition-all duration-200
            ${
              isSubmitting || !content.trim() || isOverLimit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isReply ? 'Replying...' : 'Posting...'}
            </span>
          ) : isReply ? (
            'Post Reply'
          ) : (
            'Post Comment'
          )}
        </button>
      </div>

      {/* Helper text for anonymous users - would show login prompt */}
      <div className="text-xs text-gray-500">
        {isReply ? 'Reply to this comment' : 'Join the conversation'}
      </div>
    </form>
  );
}
