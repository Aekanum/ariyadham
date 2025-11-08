/**
 * Robots.txt Generation
 * Story 3.4: Article Metadata & SEO
 *
 * Controls search engine crawling behavior
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cms/', '/unauthorized'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
