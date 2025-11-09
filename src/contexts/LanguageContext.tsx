/**
 * Language Context
 * Story 8.1: Internationalization Setup
 *
 * Provides language switching and translation functionality
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Locale, Namespace } from '@/lib/i18n';
import {
  DEFAULT_LOCALE,
  getCurrentLocale,
  setCurrentLocale,
  loadTranslations,
  get,
  interpolate,
} from '@/lib/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, any>, namespace?: Namespace) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Record<Namespace, Record<string, any>>>({
    common: {},
    auth: {},
    reader: {},
    author: {},
    admin: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for current locale
  useEffect(() => {
    const loadAllTranslations = async () => {
      setIsLoading(true);
      try {
        const [common, auth, reader, author, admin] = await Promise.all([
          loadTranslations(locale, 'common'),
          loadTranslations(locale, 'auth'),
          loadTranslations(locale, 'reader'),
          loadTranslations(locale, 'author'),
          loadTranslations(locale, 'admin'),
        ]);

        setTranslations({
          common,
          auth,
          reader,
          author,
          admin,
        });
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTranslations();
  }, [locale]);

  // Initialize locale from localStorage on mount
  useEffect(() => {
    const storedLocale = getCurrentLocale();
    if (storedLocale !== locale) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setCurrentLocale(newLocale);
    // No page reload needed - context and components will re-render automatically
  }, []);

  const t = useCallback(
    (key: string, values?: Record<string, any>, namespace: Namespace = 'common'): string => {
      const translation = get(translations[namespace], key, key);
      return values ? interpolate(translation, values) : translation;
    },
    [translations]
  );

  const value: LanguageContextValue = {
    locale,
    setLocale,
    t,
    isLoading,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook to use language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook for translations (shorthand)
 */
export function useTranslation(namespace: Namespace = 'common') {
  const { t: baseT, locale, isLoading } = useLanguage();

  const t = useCallback(
    (key: string, values?: Record<string, any>) => {
      return baseT(key, values, namespace);
    },
    [baseT, namespace]
  );

  return { t, locale, isLoading };
}
