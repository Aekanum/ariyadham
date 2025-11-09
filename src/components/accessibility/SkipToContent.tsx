/**
 * SkipToContent Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Provides a skip link for keyboard users to bypass navigation and jump to main content
 * This is a WCAG 2.1 Level A requirement
 */

'use client';

import Link from 'next/link';

export default function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="skip-to-content sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      Skip to main content
    </Link>
  );
}
