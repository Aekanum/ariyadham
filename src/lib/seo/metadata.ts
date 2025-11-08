/**
 * SEO Metadata Generation Utilities
 * Story 3.4: Article Metadata & SEO
 * Story 7.3: SEO Foundation & Structured Data
 *
 * Generates metadata, Open Graph tags, Twitter Cards, and Schema.org structured data
 */

import type { Metadata } from 'next';
import type { ArticleMetadata } from '@/types/metadata';

const SITE_NAME = 'Ariyadham';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;

/**
 * Truncate text to a maximum length, ensuring it doesn't exceed SEO limits
 * Google typically displays 155-160 characters for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Generate Next.js metadata for article pages
 */
export function generateArticleMetadata(article: ArticleMetadata): Metadata {
  const url = `${SITE_URL}${article.url}`;
  const imageUrl = article.image || DEFAULT_IMAGE;
  const description = truncateDescription(article.description);

  return {
    title: article.title,
    description,

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Open Graph
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: [article.author.name],
      section: article.section,
      tags: article.tags,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [imageUrl],
    },

    // Additional metadata
    authors: [{ name: article.author.name, url: article.author.url }],
    keywords: article.tags,
  };
}

/**
 * Generate structured data (Schema.org) for articles
 */
export function generateArticleStructuredData(article: ArticleMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || DEFAULT_IMAGE,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${article.url}`,
    },
  };
}

/**
 * Generate metadata for the home page
 */
export function generateHomeMetadata(): Metadata {
  const description =
    'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.';

  return {
    title: 'Ariyadham - Buddhist Wisdom & Teachings',
    description,

    alternates: {
      canonical: SITE_URL,
    },

    openGraph: {
      type: 'website',
      title: 'Ariyadham - Buddhist Wisdom & Teachings',
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Ariyadham',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Ariyadham - Buddhist Wisdom & Teachings',
      description,
      images: [DEFAULT_IMAGE],
    },
  };
}

/**
 * Generate WebSite structured data with SearchAction
 * Story 7.3: Enables Google Search box in search results
 */
export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'A modern platform for sharing and accessing Buddhist teachings (dharma) with accessibility and inclusivity at the core.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
  };
}

/**
 * Generate Organization structured data
 * Story 7.3: Provides information about the organization
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo.png`,
    },
    description:
      'A modern platform for sharing and accessing Buddhist teachings (dharma) with accessibility and inclusivity at the core.',
    sameAs: [
      // Add social media profiles when available
      // 'https://facebook.com/ariyadham',
      // 'https://twitter.com/ariyadham',
    ],
  };
}

/**
 * Generate BreadcrumbList structured data
 * Story 7.3: Helps Google understand site hierarchy
 *
 * @param breadcrumbs - Array of breadcrumb items with name and url
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.url}`,
    })),
  };
}

/**
 * Generate enhanced BlogPosting structured data (alternative to Article)
 * Story 7.3: More specific schema for blog-style articles
 */
export function generateBlogPostingStructuredData(article: ArticleMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: truncateDescription(article.description),
    image: article.image || DEFAULT_IMAGE,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `${SITE_URL}${article.author.url}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${article.url}`,
    },
    keywords: article.tags?.join(', '),
    articleSection: article.section,
  };
}
