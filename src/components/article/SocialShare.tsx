'use client';

/**
 * SocialShare Component
 * Story 5.3: Social Sharing
 *
 * Allows users to share articles on social media platforms
 * Supports Facebook, Line, Twitter, and copy-to-clipboard
 * Uses Web Share API for modern browsers
 */

import { useState } from 'react';

interface SocialShareProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  className?: string;
}

export default function SocialShare({
  articleId,
  articleTitle,
  articleUrl,
  className = '',
}: SocialShareProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const displayMessage = (text: string) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  // Track share action (optional - for analytics)
  const trackShare = (platform: string) => {
    // TODO: Implement share tracking analytics
    // This could send data to analytics service
    console.debug(`Article ${articleId} shared on ${platform}`);
  };

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== 'undefined' && navigator.share;

  const handleWebShare = async () => {
    if (!canUseWebShare) return;

    try {
      await navigator.share({
        title: articleTitle,
        text: `Check out this article: ${articleTitle}`,
        url: articleUrl,
      });

      // Track share (optional - can be implemented later)
      trackShare('web-share-api');
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowOptions(false);
    trackShare('facebook');
  };

  const handleLineShare = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(articleUrl)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
    setShowOptions(false);
    trackShare('line');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowOptions(false);
    trackShare('twitter');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${articleTitle}\n${articleUrl}`);
      displayMessage('Link copied to clipboard!');
      setShowOptions(false);
      trackShare('copy-link');
    } catch (error) {
      console.error('Failed to copy link:', error);
      displayMessage('Failed to copy link');
    }
  };

  const handleMainButtonClick = () => {
    if (canUseWebShare) {
      handleWebShare();
    } else {
      setShowOptions(!showOptions);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={handleMainButtonClick}
        className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-800 transition-all duration-200 hover:scale-105 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
        aria-label="Share article"
      >
        {/* Share Icon */}
        <svg
          className="h-5 w-5"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        <span className="text-sm">Share</span>
      </button>

      {/* Share Options Dropdown (shown when Web Share API not available) */}
      {showOptions && !canUseWebShare && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1" role="menu">
            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Line */}
            <button
              onClick={handleLineShare}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span>Line</span>
            </button>

            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg className="h-5 w-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span>Twitter</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg
                className="h-5 w-5 text-gray-600 dark:text-gray-400"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {showMessage && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
          {message}
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {showOptions && !canUseWebShare && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
