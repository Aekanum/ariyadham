/**
 * Language Switcher Component
 * Story 8.1: Internationalization Setup
 *
 * Allows users to switch between Thai and English
 */

'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as Locale;
    setLocale(newLocale);
  };

  return (
    <div className="language-switcher">
      <select
        value={locale}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Select language"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Simple button-based language switcher
 */
export function LanguageSwitcherButtons() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex gap-2">
      {SUPPORTED_LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          aria-label={`Switch to ${LOCALE_NAMES[loc]}`}
          aria-pressed={locale === loc}
        >
          {LOCALE_NAMES[loc]}
        </button>
      ))}
    </div>
  );
}
