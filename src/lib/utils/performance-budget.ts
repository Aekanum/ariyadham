/**
 * Performance Budget Utilities
 * Story 7.2: Core Web Vitals & Performance
 *
 * Define and monitor performance budgets for the application.
 * Helps prevent performance regressions during development.
 */

/**
 * Performance budget thresholds
 *
 * Based on Google's recommendations and Core Web Vitals
 */
export const PERFORMANCE_BUDGET = {
  // Page weight budgets (in KB)
  pageWeight: {
    total: 1500, // Total page weight should be under 1.5MB
    javascript: 300, // JS bundle under 300KB
    css: 100, // CSS under 100KB
    images: 800, // Images under 800KB
    fonts: 150, // Fonts under 150KB
  },

  // Timing budgets (in milliseconds)
  timing: {
    ttfb: 800, // Time to First Byte under 800ms
    fcp: 1800, // First Contentful Paint under 1.8s
    lcp: 2500, // Largest Contentful Paint under 2.5s
    tti: 3500, // Time to Interactive under 3.5s
    tbt: 300, // Total Blocking Time under 300ms
  },

  // Core Web Vitals budgets
  coreWebVitals: {
    cls: 0.1, // Cumulative Layout Shift under 0.1
    fid: 100, // First Input Delay under 100ms (deprecated, use INP)
    inp: 200, // Interaction to Next Paint under 200ms
  },

  // Request budgets
  requests: {
    total: 50, // Total HTTP requests under 50
    critical: 10, // Critical path requests under 10
  },
} as const;

/**
 * Check if a metric exceeds the performance budget
 *
 * @param category - Budget category
 * @param metric - Metric name
 * @param value - Metric value
 * @returns True if budget is exceeded
 */
export function exceedsBudget(
  category: keyof typeof PERFORMANCE_BUDGET,
  metric: string,
  value: number
): boolean {
  const budget = PERFORMANCE_BUDGET[category] as Record<string, number>;
  const threshold = budget[metric];

  if (threshold === undefined) {
    console.warn(`No budget defined for ${category}.${metric}`);
    return false;
  }

  return value > threshold;
}

/**
 * Get budget utilization percentage
 *
 * @param category - Budget category
 * @param metric - Metric name
 * @param value - Metric value
 * @returns Utilization percentage (0-100+)
 */
export function getBudgetUtilization(
  category: keyof typeof PERFORMANCE_BUDGET,
  metric: string,
  value: number
): number {
  const budget = PERFORMANCE_BUDGET[category] as Record<string, number>;
  const threshold = budget[metric];

  if (threshold === undefined) {
    return 0;
  }

  return (value / threshold) * 100;
}

/**
 * Get budget status color
 *
 * @param utilization - Budget utilization percentage
 * @returns Status color class
 */
export function getBudgetStatusColor(utilization: number): string {
  if (utilization <= 80) {
    return 'text-green-600 dark:text-green-400';
  } else if (utilization <= 100) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Log performance budget violations
 *
 * Useful for development to catch performance regressions early.
 */
export function logBudgetViolations(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Check for Performance API support
  if (!('performance' in window)) {
    return;
  }

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return;
    }

    const violations: string[] = [];

    // Check TTFB
    const ttfb = navigation.responseStart - navigation.requestStart;
    if (exceedsBudget('timing', 'ttfb', ttfb)) {
      violations.push(`TTFB: ${ttfb.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.timing.ttfb}ms)`);
    }

    // Check resource count
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (exceedsBudget('requests', 'total', resources.length)) {
      violations.push(
        `Total requests: ${resources.length} (budget: ${PERFORMANCE_BUDGET.requests.total})`
      );
    }

    // Check resource sizes
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let fontSize = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || resource.encodedBodySize;
      totalSize += size;

      if (resource.name.match(/\.js$/i)) {
        jsSize += size;
      } else if (resource.name.match(/\.css$/i)) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
        imageSize += size;
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
        fontSize += size;
      }
    });

    // Convert to KB
    totalSize = totalSize / 1024;
    jsSize = jsSize / 1024;
    cssSize = cssSize / 1024;
    imageSize = imageSize / 1024;
    fontSize = fontSize / 1024;

    if (exceedsBudget('pageWeight', 'total', totalSize)) {
      violations.push(
        `Total page weight: ${totalSize.toFixed(0)}KB (budget: ${PERFORMANCE_BUDGET.pageWeight.total}KB)`
      );
    }

    if (exceedsBudget('pageWeight', 'javascript', jsSize)) {
      violations.push(
        `JavaScript size: ${jsSize.toFixed(0)}KB (budget: ${PERFORMANCE_BUDGET.pageWeight.javascript}KB)`
      );
    }

    if (exceedsBudget('pageWeight', 'css', cssSize)) {
      violations.push(
        `CSS size: ${cssSize.toFixed(0)}KB (budget: ${PERFORMANCE_BUDGET.pageWeight.css}KB)`
      );
    }

    if (exceedsBudget('pageWeight', 'images', imageSize)) {
      violations.push(
        `Images size: ${imageSize.toFixed(0)}KB (budget: ${PERFORMANCE_BUDGET.pageWeight.images}KB)`
      );
    }

    if (exceedsBudget('pageWeight', 'fonts', fontSize)) {
      violations.push(
        `Fonts size: ${fontSize.toFixed(0)}KB (budget: ${PERFORMANCE_BUDGET.pageWeight.fonts}KB)`
      );
    }

    // Log violations
    if (violations.length > 0) {
      console.group('⚠️ Performance Budget Violations');
      violations.forEach((violation) => console.warn(violation));
      console.groupEnd();
    } else {
      console.log('✅ All performance budgets met');
    }
  } catch (error) {
    console.error('Failed to check performance budgets:', error);
  }
}

/**
 * Initialize performance budget monitoring
 *
 * Automatically logs budget violations after page load (development only).
 */
export function initPerformanceBudgetMonitoring(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Wait for page load to complete
  if (document.readyState === 'complete') {
    setTimeout(logBudgetViolations, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(logBudgetViolations, 1000);
    });
  }
}
