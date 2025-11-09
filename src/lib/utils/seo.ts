/**
 * SEO Utilities
 * Story 8.2: Translate Dynamic Content (Articles)
 *
 * Utilities for generating SEO metadata including hreflang links
 */

import { ArticleTranslation, ArticleLanguage } from '@/types/article';

export interface HrefLangLink {
  hrefLang: string;
  href: string;
}

/**
 * Generate hreflang links for article translations
 * Used for SEO to indicate language versions of the same content
 */
export function generateHrefLangLinks(
  currentLanguage: ArticleLanguage,
  currentSlug: string,
  translations: ArticleTranslation[] = [],
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ariyadham.com'
): HrefLangLink[] {
  const links: HrefLangLink[] = [];

  // Add current page
  links.push({
    hrefLang: currentLanguage,
    href: `${baseUrl}/${currentLanguage}/articles/${currentSlug}`,
  });

  // Add x-default (usually the default language - Thai in this case)
  links.push({
    hrefLang: 'x-default',
    href: `${baseUrl}/th/articles/${currentSlug}`,
  });

  // Add translations
  translations.forEach((translation) => {
    if (translation.status === 'published') {
      links.push({
        hrefLang: translation.language,
        href: `${baseUrl}/${translation.language}/articles/${translation.slug}`,
      });
    }
  });

  return links;
}

/**
 * Generate Next.js metadata alternates for hreflang
 */
export function generateAlternatesMetadata(
  currentLanguage: ArticleLanguage,
  currentSlug: string,
  translations: ArticleTranslation[] = []
) {
  const hrefLangLinks = generateHrefLangLinks(currentLanguage, currentSlug, translations);

  const languages: Record<string, string> = {};

  hrefLangLinks.forEach((link) => {
    languages[link.hrefLang] = link.href;
  });

  return {
    languages,
  };
}
