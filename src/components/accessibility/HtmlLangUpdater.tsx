/**
 * HtmlLangUpdater Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Updates the html lang attribute dynamically based on user's language preference
 * This is essential for screen readers to pronounce content correctly
 */

'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HtmlLangUpdater() {
  const { locale } = useLanguage();

  useEffect(() => {
    // Update the html lang attribute when locale changes
    document.documentElement.lang = locale;
  }, [locale]);

  return null; // This component doesn't render anything
}
