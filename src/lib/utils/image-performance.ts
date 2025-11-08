/**
 * Image Performance Monitoring
 * Story 7.1: Image Optimization & CDN
 *
 * Utilities for monitoring and optimizing image loading performance.
 * Uses the Performance API to track image metrics and detect issues.
 */

interface ImageMetrics {
  url: string;
  loadTime: number;
  size: number;
  format: string;
  renderTime: number;
}

interface ImagePerformanceEntry extends PerformanceResourceTiming {
  initiatorType: string;
}

/**
 * Monitor image loading performance
 *
 * Tracks all images loaded on the page and logs slow loading images.
 * Uses PerformanceObserver to watch for image resources.
 *
 * @param slowThresholdMs - Threshold in ms to consider an image slow (default: 2000ms)
 * @param onSlowImage - Callback when a slow image is detected
 *
 * @example
 * ```ts
 * // Monitor images and log slow ones
 * monitorImagePerformance(2000, (metrics) => {
 *   console.warn('Slow image detected:', metrics);
 * });
 * ```
 */
export function monitorImagePerformance(
  slowThresholdMs: number = 2000,
  onSlowImage?: (metrics: ImageMetrics) => void
): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}; // No-op cleanup function
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as ImagePerformanceEntry;

      // Only monitor images
      if (
        resourceEntry.initiatorType === 'img' ||
        resourceEntry.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
      ) {
        const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
        const size = resourceEntry.transferSize || resourceEntry.encodedBodySize;

        const metrics: ImageMetrics = {
          url: resourceEntry.name,
          loadTime,
          size,
          format: getImageFormat(resourceEntry.name),
          renderTime: resourceEntry.responseEnd,
        };

        // Check if image is slow
        if (loadTime > slowThresholdMs) {
          console.warn(`[Performance] Slow image detected: ${metrics.url}`, {
            loadTime: `${loadTime.toFixed(2)}ms`,
            size: `${(size / 1024).toFixed(2)}KB`,
            format: metrics.format,
          });

          if (onSlowImage) {
            onSlowImage(metrics);
          }
        }
      }
    }
  });

  observer.observe({ type: 'resource', buffered: true });

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Get image format from URL
 *
 * @param url - Image URL
 * @returns Image format
 */
function getImageFormat(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)($|\?)/i);
  return match ? match[1].toLowerCase() : 'unknown';
}

/**
 * Calculate cumulative layout shift for images
 *
 * Measures layout shift caused by images loading without dimensions.
 * Helps identify images that cause CLS issues.
 *
 * @param onLayoutShift - Callback when layout shift is detected
 * @returns Cleanup function
 *
 * @example
 * ```ts
 * const cleanup = monitorImageLayoutShift((cls) => {
 *   console.log('Cumulative Layout Shift:', cls);
 * });
 * ```
 */
export function monitorImageLayoutShift(onLayoutShift?: (cls: number) => void): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  let cumulativeScore = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Only count layout shifts not from user input
      if (!(entry as any).hadRecentInput) {
        cumulativeScore += (entry as any).value;

        if (onLayoutShift) {
          onLayoutShift(cumulativeScore);
        }

        // Warn if CLS is high
        if (cumulativeScore > 0.1) {
          console.warn(`[Performance] High Cumulative Layout Shift: ${cumulativeScore.toFixed(4)}`);
        }
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });

  return () => {
    observer.disconnect();
  };
}

/**
 * Measure Largest Contentful Paint (LCP)
 *
 * Tracks the LCP metric which is often influenced by hero images.
 * LCP should ideally be under 2.5s for good performance.
 *
 * @param onLCP - Callback with LCP value
 * @returns Cleanup function
 *
 * @example
 * ```ts
 * measureLCP((lcp) => {
 *   console.log('LCP:', lcp, 'ms');
 * });
 * ```
 */
export function measureLCP(onLCP?: (lcp: number) => void): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    const lcp = lastEntry.startTime;

    if (onLCP) {
      onLCP(lcp);
    }

    // Log LCP performance
    if (lcp > 2500) {
      console.warn(`[Performance] Slow LCP: ${lcp.toFixed(2)}ms (target: <2500ms)`);
    } else if (lcp > 4000) {
      console.error(`[Performance] Very slow LCP: ${lcp.toFixed(2)}ms (target: <2500ms)`);
    } else {
      console.log(`[Performance] Good LCP: ${lcp.toFixed(2)}ms`);
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  return () => {
    observer.disconnect();
  };
}

/**
 * Get comprehensive image performance report
 *
 * Returns statistics about all images loaded on the page.
 *
 * @returns Image performance report
 *
 * @example
 * ```ts
 * const report = getImagePerformanceReport();
 * console.log('Total images:', report.totalImages);
 * console.log('Average load time:', report.averageLoadTime);
 * ```
 */
export function getImagePerformanceReport(): {
  totalImages: number;
  averageLoadTime: number;
  totalSize: number;
  slowImages: number;
  formats: Record<string, number>;
} {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return {
      totalImages: 0,
      averageLoadTime: 0,
      totalSize: 0,
      slowImages: 0,
      formats: {},
    };
  }

  const imageEntries = performance.getEntriesByType('resource').filter((entry) => {
    const resourceEntry = entry as ImagePerformanceEntry;
    return (
      resourceEntry.initiatorType === 'img' ||
      resourceEntry.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
    );
  }) as ImagePerformanceEntry[];

  let totalLoadTime = 0;
  let totalSize = 0;
  let slowImages = 0;
  const formats: Record<string, number> = {};

  imageEntries.forEach((entry) => {
    const loadTime = entry.responseEnd - entry.requestStart;
    const size = entry.transferSize || entry.encodedBodySize;
    const format = getImageFormat(entry.name);

    totalLoadTime += loadTime;
    totalSize += size;

    if (loadTime > 2000) {
      slowImages++;
    }

    formats[format] = (formats[format] || 0) + 1;
  });

  return {
    totalImages: imageEntries.length,
    averageLoadTime: imageEntries.length > 0 ? totalLoadTime / imageEntries.length : 0,
    totalSize,
    slowImages,
    formats,
  };
}

/**
 * Preload critical images
 *
 * Preloads important images to improve LCP and perceived performance.
 * Should be used for above-the-fold images like hero images.
 *
 * @param imageUrls - Array of image URLs to preload
 * @param priority - Priority hint for the browser
 *
 * @example
 * ```ts
 * preloadCriticalImages([
 *   '/hero-image.webp',
 *   '/logo.png'
 * ], 'high');
 * ```
 */
export function preloadCriticalImages(
  imageUrls: string[],
  priority: 'high' | 'low' | 'auto' = 'high'
): void {
  if (typeof document === 'undefined') return;

  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;

    // Add fetchpriority if supported
    if ('fetchPriority' in HTMLImageElement.prototype) {
      link.setAttribute('fetchpriority', priority);
    }

    document.head.appendChild(link);
  });
}

/**
 * Log image performance summary to console
 *
 * Useful for debugging image performance issues in development.
 */
export function logImagePerformanceSummary(): void {
  if (typeof window === 'undefined') return;

  const report = getImagePerformanceReport();

  console.group('📊 Image Performance Summary');
  console.log(`Total Images: ${report.totalImages}`);
  console.log(`Average Load Time: ${report.averageLoadTime.toFixed(2)}ms`);
  console.log(`Total Size: ${(report.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Slow Images (>2s): ${report.slowImages}`);
  console.log('Formats:', report.formats);
  console.groupEnd();
}
