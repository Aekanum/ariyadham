/**
 * Simple i18n utility for Ariyadham
 * Story 8.1: Internationalization Setup
 *
 * Provides basic internationalization support for Thai and English
 */

export type Locale = 'th' | 'en';
export type Namespace = 'common' | 'auth' | 'reader' | 'author' | 'admin';

export const DEFAULT_LOCALE: Locale = 'th';
export const SUPPORTED_LOCALES: Locale[] = ['th', 'en'];

export const LOCALE_NAMES: Record<Locale, string> = {
  th: 'ไทย',
  en: 'English',
};

/**
 * Load translations for a specific locale and namespace
 */
export async function loadTranslations(
  locale: Locale,
  namespace: Namespace
): Promise<Record<string, any>> {
  try {
    const translations = await fetch(`/locales/${locale}/${namespace}.json`);
    if (!translations.ok) {
      throw new Error(`Failed to load translations for ${locale}/${namespace}`);
    }
    return await translations.json();
  } catch (error) {
    console.error(`Error loading translations for ${locale}/${namespace}:`, error);
    // Fallback to default locale if loading fails
    if (locale !== DEFAULT_LOCALE) {
      return loadTranslations(DEFAULT_LOCALE, namespace);
    }
    return {};
  }
}

/**
 * Get a nested value from an object using dot notation
 * Example: get(obj, 'app.name') returns obj.app.name
 */
export function get(obj: any, path: string, defaultValue: string = ''): string {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue || path;
    }
  }

  return typeof result === 'string' ? result : defaultValue || path;
}

/**
 * Replace placeholders in a string with values
 * Example: interpolate('Hello {name}', { name: 'World' }) returns 'Hello World'
 */
export function interpolate(str: string, values: Record<string, any>): string {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Get the current locale from localStorage or default
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem('locale');
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Set the current locale in localStorage
 */
export function setCurrentLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;

  if (SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem('locale', locale);
  }
}
