/**
 * Web Vitals Utilities
 * Story 7.2: Core Web Vitals & Performance
 *
 * Utilities for tracking and reporting Core Web Vitals metrics.
 * Tracks FCP, LCP, CLS, INP, and TTFB for performance monitoring.
 */

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Web Vitals thresholds based on Google's recommendations
 * https://web.dev/vitals/
 */
export const WEB_VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP) - measures loading performance
  LCP: {
    good: 2500, // < 2.5s is good
    poor: 4000, // > 4s is poor
  },
  // First Contentful Paint (FCP) - measures perceived load speed
  FCP: {
    good: 1800, // < 1.8s is good
    poor: 3000, // > 3s is poor
  },
  // Cumulative Layout Shift (CLS) - measures visual stability
  CLS: {
    good: 0.1, // < 0.1 is good
    poor: 0.25, // > 0.25 is poor
  },
  // Interaction to Next Paint (INP) - measures interactivity
  INP: {
    good: 200, // < 200ms is good
    poor: 500, // > 500ms is poor
  },
  // First Input Delay (FID) - measures interactivity (deprecated in favor of INP)
  FID: {
    good: 100, // < 100ms is good
    poor: 300, // > 300ms is poor
  },
  // Time to First Byte (TTFB) - measures server response time
  TTFB: {
    good: 800, // < 800ms is good
    poor: 1800, // > 1.8s is poor
  },
} as const;

/**
 * Get rating for a Web Vitals metric
 *
 * @param name - Metric name
 * @param value - Metric value
 * @returns Rating: 'good', 'needs-improvement', or 'poor'
 */
export function getMetricRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];

  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.poor) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Format metric value for display
 *
 * @param name - Metric name
 * @param value - Metric value
 * @returns Formatted string
 */
export function formatMetricValue(name: WebVitalsMetric['name'], value: number): string {
  // CLS is unitless, others are in milliseconds
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Get color for metric rating
 *
 * @param rating - Metric rating
 * @returns Tailwind color class
 */
export function getMetricColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 dark:text-green-400';
    case 'needs-improvement':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'poor':
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Get background color for metric rating
 *
 * @param rating - Metric rating
 * @returns Tailwind background color class
 */
export function getMetricBgColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'needs-improvement':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'poor':
      return 'bg-red-100 dark:bg-red-900/20';
  }
}

/**
 * Store Web Vitals metrics in localStorage for dashboard display
 *
 * @param metric - Web Vitals metric
 */
export function storeWebVitalsMetric(metric: WebVitalsMetric): void {
  if (typeof window === 'undefined') return;

  try {
    const key = 'web-vitals-metrics';
    const stored = localStorage.getItem(key);
    const metrics: WebVitalsMetric[] = stored ? JSON.parse(stored) : [];

    // Add new metric
    metrics.push({
      ...metric,
      rating: getMetricRating(metric.name, metric.value),
    });

    // Keep only last 100 metrics to avoid localStorage bloat
    if (metrics.length > 100) {
      metrics.shift();
    }

    localStorage.setItem(key, JSON.stringify(metrics));
  } catch (error) {
    console.error('Failed to store Web Vitals metric:', error);
  }
}

/**
 * Get stored Web Vitals metrics from localStorage
 *
 * @returns Array of stored metrics
 */
export function getStoredWebVitalsMetrics(): WebVitalsMetric[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = 'web-vitals-metrics';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve Web Vitals metrics:', error);
    return [];
  }
}

/**
 * Get latest metric for each Web Vitals type
 *
 * @returns Object with latest metric for each type
 */
export function getLatestWebVitals(): Record<WebVitalsMetric['name'], WebVitalsMetric | null> {
  const metrics = getStoredWebVitalsMetrics();
  const latest: Record<WebVitalsMetric['name'], WebVitalsMetric | null> = {
    CLS: null,
    FCP: null,
    FID: null,
    INP: null,
    LCP: null,
    TTFB: null,
  };

  // Get the latest metric for each type
  metrics.forEach((metric) => {
    latest[metric.name] = metric;
  });

  return latest;
}

/**
 * Calculate average metrics over a time period
 *
 * Note: Currently returns averages for all stored metrics.
 * Time-based filtering will be implemented in a future update.
 *
 * @returns Average metrics
 */
export function getAverageWebVitals(): Record<
  WebVitalsMetric['name'],
  {
    average: number;
    count: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  } | null
> {
  const metrics = getStoredWebVitalsMetrics();

  const averages: Record<
    WebVitalsMetric['name'],
    {
      average: number;
      count: number;
      rating: 'good' | 'needs-improvement' | 'poor';
    } | null
  > = {
    CLS: null,
    FCP: null,
    FID: null,
    INP: null,
    LCP: null,
    TTFB: null,
  };

  // Group metrics by name
  const grouped: Record<WebVitalsMetric['name'], number[]> = {
    CLS: [],
    FCP: [],
    FID: [],
    INP: [],
    LCP: [],
    TTFB: [],
  };

  metrics.forEach((metric) => {
    // Filter by time if we had timestamps (not implemented yet)
    grouped[metric.name].push(metric.value);
  });

  // Calculate averages
  Object.keys(grouped).forEach((name) => {
    const values = grouped[name as WebVitalsMetric['name']];
    if (values.length > 0) {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      averages[name as WebVitalsMetric['name']] = {
        average,
        count: values.length,
        rating: getMetricRating(name as WebVitalsMetric['name'], average),
      };
    }
  });

  return averages;
}

/**
 * Clear all stored Web Vitals metrics
 */
export function clearWebVitalsMetrics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('web-vitals-metrics');
  } catch (error) {
    console.error('Failed to clear Web Vitals metrics:', error);
  }
}

/**
 * Send Web Vitals metric to analytics endpoint
 *
 * @param metric - Web Vitals metric
 */
export async function sendWebVitalsToAnalytics(metric: WebVitalsMetric): Promise<void> {
  try {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Use sendBeacon for reliable analytics even during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      // Fallback to fetch for browsers that don't support sendBeacon
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send Web Vitals to analytics:', error);
  }
}
