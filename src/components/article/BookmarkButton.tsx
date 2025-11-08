'use client';

/**
 * BookmarkButton Component
 * Story 5.4: User Reading History & Bookmarks
 *
 * Displays the Bookmark button for articles
 * Allows users to save articles for later reading
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleBookmark } from '@/lib/api/bookmarks';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  articleId: string;
  initialCount: number;
  initialHasBookmarked?: boolean;
  isAuthenticated: boolean;
  folderName?: string | null;
  className?: string;
  variant?: 'default' | 'icon-only';
}

export default function BookmarkButton({
  articleId,
  initialCount,
  initialHasBookmarked = false,
  isAuthenticated,
  folderName = null,
  className = '',
  variant = 'default',
}: BookmarkButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [hasBookmarked, setHasBookmarked] = useState(initialHasBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  // Sync state with props when they change
  useEffect(() => {
    setCount(initialCount);
    setHasBookmarked(initialHasBookmarked);
  }, [initialCount, initialHasBookmarked]);

  const displayMessage = (text: string) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const handleClick = async () => {
    // Require authentication
    if (!isAuthenticated) {
      displayMessage('Please log in to bookmark');
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push(`/auth/login?returnTo=/articles/${articleId}`);
      }, 1500);
      return;
    }

    // Prevent double-clicks
    if (isLoading) return;

    // Optimistic update
    const previousCount = count;
    const previousHasBookmarked = hasBookmarked;

    setIsLoading(true);
    setCount(hasBookmarked ? count - 1 : count + 1);
    setHasBookmarked(!hasBookmarked);

    try {
      const result = await toggleBookmark(articleId, folderName);

      // Update with server response
      setCount(result.bookmark_count);
      setHasBookmarked(result.has_bookmarked);

      // Show success message
      if (result.has_bookmarked) {
        displayMessage('📑 Bookmarked!');
      } else {
        displayMessage('Bookmark removed');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCount(previousCount);
      setHasBookmarked(previousHasBookmarked);

      console.error('Failed to toggle bookmark:', error);
      displayMessage('Failed to toggle bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            hasBookmarked
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
          aria-label={hasBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          title={hasBookmarked ? 'Remove bookmark' : 'Save for later'}
        >
          {hasBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>

        {/* Toast Message */}
        {showMessage && (
          <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
            {message}
          </div>
        )}
      </div>
    );
  }

  const baseButtonClass =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const buttonClass = hasBookmarked
    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';

  const disabledClass = isLoading
    ? 'cursor-not-allowed opacity-50'
    : 'cursor-pointer hover:scale-105 active:scale-95';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseButtonClass} ${buttonClass} ${disabledClass}`}
        aria-label={hasBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        title={hasBookmarked ? 'Remove bookmark' : 'Save for later'}
      >
        {/* Bookmark Icon */}
        {hasBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}

        {/* Count */}
        {count > 0 && <span className="text-sm font-bold">{count.toLocaleString()}</span>}

        {/* Label */}
        <span className="text-sm">{hasBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      </button>

      {/* Toast Message */}
      {showMessage && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
          {message}
        </div>
      )}
    </div>
  );
}
