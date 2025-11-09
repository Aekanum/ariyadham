/**
 * Language Switcher Component
 * Story 8.2: Translate Dynamic Content (Articles)
 *
 * Displays available language versions of an article
 */

'use client';

import Link from 'next/link';
import { Languages } from 'lucide-react';
import { ArticleTranslation, ArticleLanguage } from '@/types/article';
import { LOCALE_NAMES } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLanguage: ArticleLanguage;
  currentSlug?: string; // Currently not used but kept for future enhancement
  translations?: ArticleTranslation[];
}

export default function LanguageSwitcher({
  currentLanguage,
  translations = [],
}: LanguageSwitcherProps) {
  // Filter out current language and only show published translations
  const availableTranslations = translations.filter(
    (t) => t.language !== currentLanguage && t.status === 'published'
  );

  if (availableTranslations.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Languages className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-gray-600 dark:text-gray-400">Read in:</span>
      {availableTranslations.map((translation) => (
        <Link
          key={translation.id}
          href={`/${translation.language}/articles/${translation.slug}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {LOCALE_NAMES[translation.language]}
        </Link>
      ))}
    </div>
  );
}
