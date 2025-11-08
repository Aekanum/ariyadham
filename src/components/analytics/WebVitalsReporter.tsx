'use client';

/**
 * WebVitalsReporter Component
 * Story 7.2: Core Web Vitals & Performance
 *
 * Client component that reports Web Vitals metrics to analytics and local storage.
 * Uses Next.js's built-in Web Vitals reporting.
 */

import { useReportWebVitals } from 'next/web-vitals';
import {
  storeWebVitalsMetric,
  sendWebVitalsToAnalytics,
  WebVitalsMetric,
} from '@/lib/utils/web-vitals';

interface WebVitalsReporterProps {
  /**
   * Enable console logging of metrics (useful for development)
   * @default false
   */
  debug?: boolean;

  /**
   * Send metrics to analytics endpoint
   * @default true
   */
  sendToAnalytics?: boolean;

  /**
   * Store metrics in localStorage for dashboard display
   * @default true
   */
  storeLocally?: boolean;
}

/**
 * Report Web Vitals metrics
 *
 * Automatically captures and reports Core Web Vitals (CLS, FCP, INP, LCP, TTFB).
 * Stores metrics locally and optionally sends them to an analytics endpoint.
 *
 * @example
 * ```tsx
 * // In your root layout
 * <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
 * ```
 */
export default function WebVitalsReporter({
  debug = false,
  sendToAnalytics = true,
  storeLocally = true,
}: WebVitalsReporterProps) {
  useReportWebVitals((metric) => {
    // Convert Next.js metric to our format
    const webVitalsMetric: WebVitalsMetric = {
      id: metric.id,
      name: metric.name as WebVitalsMetric['name'],
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    };

    // Debug logging
    if (debug) {
      console.group(`📊 Web Vitals: ${metric.name}`);
      console.log('Value:', metric.value);
      console.log('Rating:', metric.rating);
      console.log('Delta:', metric.delta);
      console.log('Navigation Type:', metric.navigationType);
      console.groupEnd();
    }

    // Store locally for dashboard
    if (storeLocally) {
      storeWebVitalsMetric(webVitalsMetric);
    }

    // Send to analytics
    if (sendToAnalytics) {
      sendWebVitalsToAnalytics(webVitalsMetric);
    }
  });

  return null; // This component doesn't render anything
}
