/**
 * Article Page
 * Story 3.1: Article Display & Reading Interface
 * Story 3.4: Article Metadata & SEO
 *
 * Displays a single article with full content and rich metadata
 */

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import type { ArticlePageProps, ArticleWithAuthor } from '@/types/article';
import { Metadata } from 'next';
import { generateArticleMetadata, generateArticleStructuredData } from '@/lib/seo/metadata';

/**
 * Generate metadata for SEO
 * Story 3.4: Enhanced with Open Graph, Twitter Cards, and canonical URLs
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;
  const supabase = createServerClient();

  const { data: article } = await supabase
    .from('articles')
    .select(
      `
      title,
      excerpt,
      featured_image_url,
      published_at,
      updated_at,
      category,
      author:user_profiles!author_id (
        user_id,
        full_name
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (
    !article ||
    !article.author ||
    (Array.isArray(article.author) && article.author.length === 0)
  ) {
    return {
      title: 'Article Not Found | Ariyadham',
    };
  }

  // Handle author being returned as array
  const authorData = Array.isArray(article.author) ? article.author[0] : article.author;

  return generateArticleMetadata({
    title: article.title,
    description: article.excerpt || article.title,
    image: article.featured_image_url || undefined,
    url: `/articles/${slug}`,
    author: {
      name: authorData.full_name,
      url: `/authors/${authorData.user_id}`,
    },
    publishedTime: article.published_at || new Date().toISOString(),
    modifiedTime: article.updated_at,
    section: article.category || undefined,
  });
}

/**
 * Article page component
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const supabase = createServerClient();

  // Fetch article with author information
  const { data: article, error } = await supabase
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
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    notFound();
  }

  // Type assertion for the joined data
  const articleWithAuthor = article as unknown as ArticleWithAuthor;

  // Increment view count (fire and forget - don't block rendering)
  void supabase
    .from('articles')
    .update({ view_count: (article.view_count || 0) + 1 })
    .eq('id', article.id);

  // Generate structured data for SEO (Story 3.4)
  const structuredData = generateArticleStructuredData({
    title: articleWithAuthor.title,
    description: articleWithAuthor.excerpt || articleWithAuthor.title,
    image: articleWithAuthor.featured_image_url || undefined,
    url: `/articles/${slug}`,
    author: {
      name: articleWithAuthor.author.full_name,
      url: `/authors/${articleWithAuthor.author.id}`,
    },
    publishedTime: articleWithAuthor.published_at || new Date().toISOString(),
    modifiedTime: articleWithAuthor.updated_at,
    section: articleWithAuthor.category || undefined,
  });

  return (
    <>
      {/* Structured Data (Schema.org) - Story 3.4 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Article Header */}
        <ArticleHeader article={articleWithAuthor} />

        {/* Article Content */}
        <ArticleContent content={articleWithAuthor.content} />

        {/* Article Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Published on {new Date(articleWithAuthor.published_at!).toLocaleDateString()}</p>
              {articleWithAuthor.updated_at !== articleWithAuthor.created_at && (
                <p className="mt-1">
                  Last updated on {new Date(articleWithAuthor.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="no-print rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Print Article
            </button>
          </div>
        </footer>
      </article>
    </>
  );
}
