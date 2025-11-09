/**
 * Language Loading Indicator
 * Story 8.1: Internationalization Setup
 *
 * Shows visual feedback when translations are being loaded
 * Provides a smooth UX during language switching
 */

'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageLoadingIndicator() {
  const { isLoading } = useLanguage();

  if (!isLoading) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg"
      role="status"
      aria-live="polite"
      aria-label="Loading translations"
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span className="text-sm font-medium">Loading...</span>
    </div>
  );
}

export default LanguageLoadingIndicator;
