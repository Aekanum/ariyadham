/**
 * Admin Performance Page
 * Story 7.2: Core Web Vitals & Performance
 *
 * Admin page for monitoring site performance and Web Vitals.
 */

import WebVitalsDashboard from '@/components/admin/WebVitalsDashboard';

export const metadata = {
  title: 'Performance Monitoring - Ariyadham Admin',
  description: 'Monitor Core Web Vitals and site performance metrics',
};

export default function AdminPerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WebVitalsDashboard />
    </div>
  );
}
