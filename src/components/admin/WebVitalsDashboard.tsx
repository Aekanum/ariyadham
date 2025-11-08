'use client';

/**
 * WebVitalsDashboard Component
 * Story 7.2: Core Web Vitals & Performance
 *
 * Admin dashboard for monitoring Web Vitals metrics.
 * Displays aggregated performance data and trends.
 */

import { useWebVitals } from '@/hooks/useWebVitals';
import {
  formatMetricValue,
  getMetricColor,
  getMetricBgColor,
  WEB_VITALS_THRESHOLDS,
} from '@/lib/utils/web-vitals';

interface WebVitalsMetricCardProps {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
  title: string;
  description: string;
}

/**
 * Individual metric card
 */
function WebVitalsMetricCard({ name, title, description }: WebVitalsMetricCardProps) {
  const { latest, averages, isLoading } = useWebVitals();

  const latestMetric = latest[name];
  const avgMetric = averages[name];

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-4 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  const thresholds = WEB_VITALS_THRESHOLDS[name];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
      </div>

      {/* Latest Value */}
      {latestMetric ? (
        <div className="mb-4">
          <div
            className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getMetricBgColor(latestMetric.rating)} ${getMetricColor(latestMetric.rating)}`}
          >
            {latestMetric.rating.toUpperCase()}
          </div>
          <p className={`text-3xl font-bold ${getMetricColor(latestMetric.rating)}`}>
            {formatMetricValue(name, latestMetric.value)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Latest measurement</p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-xl text-gray-400 dark:text-gray-600">No data yet</p>
        </div>
      )}

      {/* Average Value */}
      {avgMetric && (
        <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className={`text-xl font-semibold ${getMetricColor(avgMetric.rating)}`}>
            {formatMetricValue(name, avgMetric.average)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Average ({avgMetric.count} samples)
          </p>
        </div>
      )}

      {/* Thresholds */}
      <div className="space-y-1 border-t border-gray-200 pt-4 text-xs dark:border-gray-700">
        <div className="flex justify-between">
          <span className="text-green-600 dark:text-green-400">Good:</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {name === 'CLS' ? `≤ ${thresholds.good}` : `≤ ${thresholds.good}ms`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-yellow-600 dark:text-yellow-400">Needs Improvement:</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {name === 'CLS'
              ? `${thresholds.good} - ${thresholds.poor}`
              : `${thresholds.good}ms - ${thresholds.poor}ms`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-red-600 dark:text-red-400">Poor:</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {name === 'CLS' ? `> ${thresholds.poor}` : `> ${thresholds.poor}ms`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Web Vitals Dashboard
 *
 * Displays all Core Web Vitals metrics in a dashboard layout.
 */
export default function WebVitalsDashboard() {
  const { refresh, isLoading } = useWebVitals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Core Web Vitals Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor your site's performance with real user metrics
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> These metrics are collected from your current browser session. For
          production monitoring, check the Admin Analytics page for aggregated data from all users.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WebVitalsMetricCard
          name="LCP"
          title="Largest Contentful Paint (LCP)"
          description="Measures loading performance"
        />
        <WebVitalsMetricCard
          name="FCP"
          title="First Contentful Paint (FCP)"
          description="Measures perceived load speed"
        />
        <WebVitalsMetricCard
          name="CLS"
          title="Cumulative Layout Shift (CLS)"
          description="Measures visual stability"
        />
        <WebVitalsMetricCard
          name="INP"
          title="Interaction to Next Paint (INP)"
          description="Measures interactivity"
        />
        <WebVitalsMetricCard
          name="TTFB"
          title="Time to First Byte (TTFB)"
          description="Measures server response time"
        />
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Understanding Web Vitals
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-gray-900 dark:text-white">
              Largest Contentful Paint (LCP):
            </strong>
            <p className="text-gray-600 dark:text-gray-400">
              Measures when the largest content element becomes visible. Good LCP is under 2.5
              seconds.
            </p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">First Contentful Paint (FCP):</strong>
            <p className="text-gray-600 dark:text-gray-400">
              Measures when the first content appears on screen. Good FCP is under 1.8 seconds.
            </p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Cumulative Layout Shift (CLS):
            </strong>
            <p className="text-gray-600 dark:text-gray-400">
              Measures visual stability by tracking unexpected layout shifts. Good CLS is under 0.1.
            </p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Interaction to Next Paint (INP):
            </strong>
            <p className="text-gray-600 dark:text-gray-400">
              Measures responsiveness by tracking interaction latency. Good INP is under 200ms.
            </p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">Time to First Byte (TTFB):</strong>
            <p className="text-gray-600 dark:text-gray-400">
              Measures server response time. Good TTFB is under 800ms.
            </p>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Resources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://web.dev/vitals/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more about Core Web Vitals
            </a>
          </li>
          <li>
            <a
              href="https://web.dev/lcp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Optimize Largest Contentful Paint
            </a>
          </li>
          <li>
            <a
              href="https://web.dev/cls/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Optimize Cumulative Layout Shift
            </a>
          </li>
          <li>
            <a
              href="https://web.dev/inp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Optimize Interaction to Next Paint
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
