import type { Metadata } from 'next';
import type { ArticleMetadata } from '@/types/metadata';

const SITE_NAME = 'Ariyadham';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;

/**
 * Generate Next.js metadata for article pages
 */
export function generateArticleMetadata(article: ArticleMetadata): Metadata {
  const url = `${SITE_URL}${article.url}`;
  const imageUrl = article.image || DEFAULT_IMAGE;

  return {
    title: article.title,
    description: article.description,

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Open Graph
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
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
      description: article.description,
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
  return {
    title: 'Ariyadham - Buddhist Wisdom & Teachings',
    description:
      'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',

    alternates: {
      canonical: SITE_URL,
    },

    openGraph: {
      type: 'website',
      title: 'Ariyadham - Buddhist Wisdom & Teachings',
      description:
        'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',
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
      description:
        'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',
      images: [DEFAULT_IMAGE],
    },
  };
}
