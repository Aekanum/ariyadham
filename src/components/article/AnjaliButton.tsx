'use client';

/**
 * AnjaliButton Component
 * Story 5.1: Anjali Button & Reactions
 *
 * Displays the Anjali (gratitude) button for articles
 * Allows users to express appreciation for dharma content
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleAnjali } from '@/lib/api/anjali';

interface AnjaliButtonProps {
  articleId: string;
  initialCount: number;
  initialHasAnjalied?: boolean;
  isAuthenticated: boolean;
  isOwnArticle?: boolean;
  className?: string;
}

export default function AnjaliButton({
  articleId,
  initialCount,
  initialHasAnjalied = false,
  isAuthenticated,
  isOwnArticle = false,
  className = '',
}: AnjaliButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [hasAnjalied, setHasAnjalied] = useState(initialHasAnjalied);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  // Sync state with props when they change
  useEffect(() => {
    setCount(initialCount);
    setHasAnjalied(initialHasAnjalied);
  }, [initialCount, initialHasAnjalied]);

  const displayMessage = (text: string) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const handleClick = async () => {
    // Prevent authors from giving anjali to their own articles (optional)
    if (isOwnArticle) {
      displayMessage('Cannot anjali your own article');
      return;
    }

    // Require authentication
    if (!isAuthenticated) {
      displayMessage('Please log in to show gratitude');
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
    const previousHasAnjalied = hasAnjalied;

    setIsLoading(true);
    setCount(hasAnjalied ? count - 1 : count + 1);
    setHasAnjalied(!hasAnjalied);

    try {
      const result = await toggleAnjali(articleId);

      // Update with server response
      setCount(result.anjali_count);
      setHasAnjalied(result.has_anjalied);

      // Show success message
      if (result.has_anjalied) {
        displayMessage('🙏 Gratitude recorded');
      } else {
        displayMessage('Anjali removed');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCount(previousCount);
      setHasAnjalied(previousHasAnjalied);

      console.error('Failed to toggle anjali:', error);
      displayMessage('Failed to toggle anjali');
    } finally {
      setIsLoading(false);
    }
  };

  const baseButtonClass =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const buttonClass = hasAnjalied
    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-500 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';

  const disabledClass =
    isOwnArticle || isLoading
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:scale-105 active:scale-95';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseButtonClass} ${buttonClass} ${disabledClass}`}
        aria-label={hasAnjalied ? 'Remove anjali' : 'Give anjali'}
        title={
          isOwnArticle
            ? 'Cannot anjali your own article'
            : hasAnjalied
              ? 'Remove anjali'
              : 'Show gratitude with anjali'
        }
      >
        {/* Anjali Icon (Praying Hands) */}
        <span
          className={`text-2xl ${hasAnjalied ? 'animate-bounce' : ''}`}
          role="img"
          aria-label="anjali"
        >
          🙏
        </span>

        {/* Count */}
        <span className="text-sm font-bold">{count > 0 ? count.toLocaleString() : '0'}</span>

        {/* Label */}
        <span className="text-sm">Anjali</span>
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
