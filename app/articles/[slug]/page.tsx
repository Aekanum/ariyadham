/**
 * Article Page
 * Story 3.1: Article Display & Reading Interface
 * Story 3.4: Article Metadata & SEO
 * Story 5.1: Anjali Button & Reactions
 * Story 5.2: Comments & Discussions
 * Story 5.4: User Reading History & Bookmarks
 *
 * Displays a single article with full content and rich metadata
 */

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import AnjaliButton from '@/components/article/AnjaliButton';
import BookmarkButton from '@/components/article/BookmarkButton';
import SocialShare from '@/components/article/SocialShare';
import ReadingHistoryTracker from '@/components/article/ReadingHistoryTracker';
import { CommentSection } from '@/components/comments';
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
      bookmark_count,
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

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get anjali status for current user (Story 5.1)
  let userHasAnjalied = false;
  if (user) {
    const { data: anjaliData } = await supabase.rpc('get_anjali_status', {
      p_article_id: article.id,
      p_user_id: user.id,
    });

    if (anjaliData && anjaliData.length > 0) {
      userHasAnjalied = anjaliData[0].user_has_anjalied;
    }
  }

  // Get bookmark status for current user (Story 5.4)
  let userHasBookmarked = false;
  if (user) {
    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('article_id', article.id)
      .eq('user_id', user.id)
      .single();

    userHasBookmarked = !!bookmarkData;
  }

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

      {/* Reading History Tracker (Story 5.4) */}
      <ReadingHistoryTracker articleId={articleWithAuthor.id} isAuthenticated={!!user} />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Article Header */}
        <ArticleHeader article={articleWithAuthor} />

        {/* Article Content */}
        <ArticleContent content={articleWithAuthor.content} />

        {/* Engagement Actions (Story 5.1, 5.3, 5.4) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* Anjali Button (Story 5.1) */}
          <AnjaliButton
            articleId={articleWithAuthor.id}
            initialCount={articleWithAuthor.anjali_count}
            initialHasAnjalied={userHasAnjalied}
            isAuthenticated={!!user}
            isOwnArticle={user?.id === articleWithAuthor.author_id}
          />

          {/* Bookmark Button (Story 5.4) */}
          <BookmarkButton
            articleId={articleWithAuthor.id}
            initialCount={articleWithAuthor.bookmark_count || 0}
            initialHasBookmarked={userHasBookmarked}
            isAuthenticated={!!user}
          />

          {/* Social Share (Story 5.3) */}
          <SocialShare
            articleId={articleWithAuthor.id}
            articleTitle={articleWithAuthor.title}
            articleUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://ariyadham.vercel.app'}/articles/${slug}`}
          />
        </div>

        {/* Comments Section (Story 5.2) */}
        <div className="mt-12">
          <CommentSection
            articleId={articleWithAuthor.id}
            initialCommentCount={articleWithAuthor.comment_count}
            currentUserId={user?.id}
          />
        </div>

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
