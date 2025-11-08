'use client';

/**
 * ReadingHistoryTracker Component
 * Story 5.4: User Reading History & Bookmarks
 *
 * Tracks reading progress and updates reading history
 */

import { useEffect, useRef, useState } from 'react';
import { trackReadingHistory } from '@/lib/api/reading-history';

interface ReadingHistoryTrackerProps {
  articleId: string;
  isAuthenticated: boolean;
}

export default function ReadingHistoryTracker({
  articleId,
  isAuthenticated,
}: ReadingHistoryTrackerProps) {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track scroll percentage
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const percentage = Math.min(
        100,
        Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
      );

      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated]);

  // Update reading history periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateHistory = async () => {
      const now = Date.now();
      const secondsSinceLastUpdate = Math.floor((now - lastUpdateRef.current) / 1000);

      if (secondsSinceLastUpdate < 5) return; // Only update every 5 seconds minimum

      try {
        const completed = scrollPercentage >= 90;
        const completionPercentage = Math.max(scrollPercentage, 0);

        await trackReadingHistory(articleId, {
          scroll_percentage: scrollPercentage,
          time_spent_seconds: secondsSinceLastUpdate,
          completed,
          completion_percentage: completionPercentage,
        });

        lastUpdateRef.current = now;
      } catch (error) {
        console.error('Failed to update reading history:', error);
      }
    };

    // Update immediately on mount
    updateHistory();

    // Then update every 10 seconds
    updateIntervalRef.current = setInterval(updateHistory, 10000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      // Final update on unmount
      updateHistory();
    };
  }, [articleId, scrollPercentage, isAuthenticated]);

  // Track page visibility to pause/resume timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause tracking
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      } else {
        // Page is visible again, resume tracking
        lastUpdateRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  // This component doesn't render anything visible
  return null;
}
