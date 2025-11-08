/**
 * useWebVitals Hook
 * Story 7.2: Core Web Vitals & Performance
 *
 * React hook for accessing and monitoring Web Vitals metrics in components.
 */

'use client';

import { useState, useEffect } from 'react';
import { getLatestWebVitals, getAverageWebVitals, WebVitalsMetric } from '@/lib/utils/web-vitals';

interface UseWebVitalsResult {
  /**
   * Latest Web Vitals metrics
   */
  latest: Record<WebVitalsMetric['name'], WebVitalsMetric | null>;

  /**
   * Average Web Vitals metrics over the last 24 hours
   */
  averages: Record<
    WebVitalsMetric['name'],
    {
      average: number;
      count: number;
      rating: 'good' | 'needs-improvement' | 'poor';
    } | null
  >;

  /**
   * Whether metrics are currently loading
   */
  isLoading: boolean;

  /**
   * Refresh metrics from localStorage
   */
  refresh: () => void;
}

/**
 * Access Web Vitals metrics in React components
 *
 * Provides access to the latest Web Vitals metrics and averages.
 * Automatically refreshes when new metrics are stored.
 *
 * @returns Web Vitals data and controls
 *
 * @example
 * ```tsx
 * function PerformanceDashboard() {
 *   const { latest, averages, refresh } = useWebVitals();
 *
 *   return (
 *     <div>
 *       <h2>Latest LCP: {latest.LCP?.value}ms</h2>
 *       <h2>Average LCP: {averages.LCP?.average}ms</h2>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebVitals(): UseWebVitalsResult {
  const [latest, setLatest] = useState<Record<WebVitalsMetric['name'], WebVitalsMetric | null>>({
    CLS: null,
    FCP: null,
    FID: null,
    INP: null,
    LCP: null,
    TTFB: null,
  });

  const [averages, setAverages] = useState<
    Record<
      WebVitalsMetric['name'],
      {
        average: number;
        count: number;
        rating: 'good' | 'needs-improvement' | 'poor';
      } | null
    >
  >({
    CLS: null,
    FCP: null,
    FID: null,
    INP: null,
    LCP: null,
    TTFB: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = () => {
    try {
      setIsLoading(true);
      const latestMetrics = getLatestWebVitals();
      const avgMetrics = getAverageWebVitals();

      setLatest(latestMetrics);
      setAverages(avgMetrics);
    } catch (error) {
      console.error('Failed to load Web Vitals metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadMetrics();

    // Listen for storage events (metrics updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'web-vitals-metrics') {
        loadMetrics();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for updates every 30 seconds
    const interval = setInterval(loadMetrics, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    latest,
    averages,
    isLoading,
    refresh: loadMetrics,
  };
}

/**
 * Get specific Web Vitals metric
 *
 * Simplified hook for accessing a single metric.
 *
 * @param metricName - Name of the metric to track
 * @returns Metric data or null
 *
 * @example
 * ```tsx
 * function LCPDisplay() {
 *   const lcp = useWebVitalsMetric('LCP');
 *
 *   if (!lcp) return <p>No LCP data</p>;
 *
 *   return <p>LCP: {lcp.value}ms ({lcp.rating})</p>;
 * }
 * ```
 */
export function useWebVitalsMetric(metricName: WebVitalsMetric['name']): WebVitalsMetric | null {
  const { latest } = useWebVitals();
  return latest[metricName];
}
