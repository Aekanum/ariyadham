/**
 * Homepage
 * Story 7.3: SEO Foundation & Structured Data
 * Story 7.4: Caching Strategy
 * Story 8.4: Mobile-First Responsive Design
 *
 * Enhanced with WebSite and Organization structured data
 * ISR enabled for better performance
 * Mobile-first responsive layout with optimized breakpoints
 */

import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import { ArticleWithAuthor } from '@/types/article';
import Link from 'next/link';
import {
  generateWebSiteStructuredData,
  generateOrganizationStructuredData,
} from '@/lib/seo/metadata';

/**
 * ISR Configuration (Story 7.4: Caching Strategy)
 * Revalidate homepage every 30 seconds for frequently updated content
 */
export const revalidate = 30;

export default async function HomePage() {
  const supabase = createServerClient();

  // Fetch featured articles (admin-curated from featured_articles table)
  const { data: featuredData } = await supabase
    .from('featured_articles')
    .select(
      `
      *,
      article:articles!article_id (
        *,
        author:user_profiles!author_id (
          id:user_id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .order('display_order', { ascending: true })
    .limit(3);

  // Transform featured data to match ArticleWithAuthor format
  const featuredArticles = featuredData
    ?.map((f) => ({
      ...f.article,
      author: f.article.author,
    }))
    .filter((a) => a && a.status === 'published');

  // Fetch recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  // Fetch popular articles
  const { data: popularArticles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(6);

  // Generate structured data for SEO (Story 7.3)
  const webSiteData = generateWebSiteStructuredData();
  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      {/* Structured Data (Schema.org) - Story 7.3 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Story 8.4: Mobile-first spacing - sm on mobile, grows with breakpoints */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8 lg:py-12">
          {/* Hero Section - Story 8.4: Responsive text sizing */}
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-4xl md:text-5xl">
              Ariyadham
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl">
              Discover profound dharma teachings and spiritual wisdom
            </p>
          </div>

          {/* Featured Articles - Story 8.4: Mobile-first responsive grid */}
          {featuredArticles && featuredArticles.length > 0 && (
            <section className="mb-12 sm:mb-14 md:mb-16">
              <div className="mb-4 flex items-center justify-between sm:mb-5 md:mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Featured Articles
                </h2>
              </div>
              {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                {featuredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article as unknown as ArticleWithAuthor}
                    isFeatured={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recent Articles - Story 8.4: Mobile-first responsive grid */}
          {recentArticles && recentArticles.length > 0 && (
            <section className="mb-12 sm:mb-14 md:mb-16">
              <div className="mb-4 flex items-center justify-between sm:mb-5 md:mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Recent Articles
                </h2>
                <Link
                  href="/articles"
                  className="min-h-touch-min inline-flex items-center text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:text-lg"
                >
                  View all →
                </Link>
              </div>
              {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                {recentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
                ))}
              </div>
            </section>
          )}

          {/* Popular Articles - Story 8.4: Mobile-first responsive grid */}
          {popularArticles && popularArticles.length > 0 && (
            <section className="mb-12 sm:mb-14 md:mb-16">
              <div className="mb-4 flex items-center justify-between sm:mb-5 md:mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Popular Articles
                </h2>
              </div>
              {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                {popularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
