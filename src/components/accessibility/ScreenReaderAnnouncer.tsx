/**
 * ScreenReaderAnnouncer Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Provides ARIA live region for announcing dynamic content changes to screen readers
 * Used for notifications, status updates, and other dynamic content
 */

'use client';

export default function ScreenReaderAnnouncer() {
  return (
    <>
      {/* Polite announcements - announced when screen reader is idle */}
      <div
        id="a11y-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />

      {/* Assertive announcements - announced immediately */}
      <div
        id="a11y-announcer-assertive"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />
    </>
  );
}
