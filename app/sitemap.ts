/**
 * Sitemap Generation
 * Story 3.4: Article Metadata & SEO
 *
 * Generates XML sitemap for search engines
 */

import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  // Fetch all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const articleUrls =
    articles?.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticPages, ...articleUrls];
}
