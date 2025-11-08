/**
 * useImagePerformance Hook
 * Story 7.1: Image Optimization & CDN
 *
 * React hook for monitoring image loading performance in components.
 * Automatically tracks slow images and layout shifts.
 */

import { useEffect } from 'react';
import {
  monitorImagePerformance,
  monitorImageLayoutShift,
  measureLCP,
  logImagePerformanceSummary,
} from '@/lib/utils/image-performance';

interface UseImagePerformanceOptions {
  /**
   * Enable slow image monitoring
   * @default true
   */
  monitorSlowImages?: boolean;

  /**
   * Threshold in ms to consider an image slow
   * @default 2000
   */
  slowThresholdMs?: number;

  /**
   * Enable layout shift monitoring
   * @default true
   */
  monitorLayoutShift?: boolean;

  /**
   * Enable LCP (Largest Contentful Paint) monitoring
   * @default true
   */
  monitorLCP?: boolean;

  /**
   * Log performance summary on component unmount
   * @default false (true in development)
   */
  logSummary?: boolean;

  /**
   * Callback when a slow image is detected
   */
  onSlowImage?: (metrics: { url: string; loadTime: number; size: number; format: string }) => void;

  /**
   * Callback when layout shift occurs
   */
  onLayoutShift?: (cls: number) => void;

  /**
   * Callback when LCP is measured
   */
  onLCP?: (lcp: number) => void;
}

/**
 * Monitor image performance in React components
 *
 * Automatically sets up performance monitoring for images and cleans up on unmount.
 * Useful for tracking image loading issues and optimizing performance.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   useImagePerformance({
 *     slowThresholdMs: 2000,
 *     onSlowImage: (metrics) => {
 *       // Track slow images
 *       analytics.track('slow_image', metrics);
 *     },
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useImagePerformance(options: UseImagePerformanceOptions = {}) {
  const {
    monitorSlowImages = true,
    slowThresholdMs = 2000,
    monitorLayoutShift: enableLayoutShift = true,
    monitorLCP: enableLCP = true,
    logSummary = process.env.NODE_ENV === 'development',
    onSlowImage,
    onLayoutShift,
    onLCP,
  } = options;

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Monitor slow images
    if (monitorSlowImages) {
      const cleanupSlowImages = monitorImagePerformance(slowThresholdMs, (metrics) => {
        if (onSlowImage) {
          onSlowImage(metrics);
        }
      });
      cleanupFunctions.push(cleanupSlowImages);
    }

    // Monitor layout shift
    if (enableLayoutShift) {
      const cleanupLayoutShift = monitorImageLayoutShift((cls) => {
        if (onLayoutShift) {
          onLayoutShift(cls);
        }
      });
      cleanupFunctions.push(cleanupLayoutShift);
    }

    // Monitor LCP
    if (enableLCP) {
      const cleanupLCP = measureLCP((lcp) => {
        if (onLCP) {
          onLCP(lcp);
        }
      });
      cleanupFunctions.push(cleanupLCP);
    }

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());

      // Log summary if enabled
      if (logSummary) {
        logImagePerformanceSummary();
      }
    };
  }, [
    monitorSlowImages,
    slowThresholdMs,
    enableLayoutShift,
    enableLCP,
    logSummary,
    onSlowImage,
    onLayoutShift,
    onLCP,
  ]);
}
