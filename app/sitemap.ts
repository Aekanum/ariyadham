/**
 * Sitemap Generation
 * Story 3.4: Article Metadata & SEO
 * Story 7.3: SEO Foundation & Structured Data
 *
 * Generates comprehensive XML sitemap for search engines
 * Includes articles, categories, and static pages
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

  // Fetch all unique categories from published articles
  const { data: categoriesData } = await supabase
    .from('articles')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  const uniqueCategories = [
    ...new Set(categoriesData?.map((item) => item.category).filter(Boolean)),
  ];

  const categoryUrls = uniqueCategories.map((category) => ({
    url: `${SITE_URL}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

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
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticPages, ...categoryUrls, ...articleUrls];
}
