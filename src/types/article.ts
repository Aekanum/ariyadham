/**
 * Article type definitions
 * Story 3.1: Article Display & Reading Interface
 * Story 4.2: Article Publishing & Scheduling
 * Story 5.1: Anjali Button & Reactions
 * Story 5.4: User Reading History & Bookmarks
 * Story 8.2: Translate Dynamic Content (Articles)
 */

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ArticleLanguage = 'th' | 'en';

/**
 * Base article interface
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string;
  status: ArticleStatus;
  language: ArticleLanguage;
  translated_from_id: string | null;
  published_at: string | null;
  scheduled_publish_at: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  anjali_count: number;
  comment_count: number;
  bookmark_count: number;
  category: string | null;
  created_at: string;
  updated_at: string;
  user_has_anjalied?: boolean; // Only present when user is authenticated
}

/**
 * Article translation information
 * Story 8.2: Translate Dynamic Content (Articles)
 */
export interface ArticleTranslation {
  id: string;
  article_id: string;
  language: ArticleLanguage;
  slug: string;
  title: string;
  status: ArticleStatus;
}

/**
 * Article with author information
 */
export interface ArticleWithAuthor extends Article {
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  translations?: ArticleTranslation[];
}

/**
 * Article summary for lists/previews
 */
export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  published_at: string | null;
  reading_time_minutes: number | null;
  category: string | null;
  author: {
    full_name: string;
    avatar_url: string | null;
  };
}

/**
 * Article page props for Next.js dynamic routes
 */
export interface ArticlePageProps {
  params: {
    slug: string;
  };
}

/**
 * Create article request
 */
export interface CreateArticleRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  category?: string;
  status?: ArticleStatus;
  language?: ArticleLanguage;
  translated_from_id?: string | null;
  scheduled_publish_at?: string | null;
}

/**
 * Update article request
 */
export interface UpdateArticleRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category?: string;
  status?: ArticleStatus;
  language?: ArticleLanguage;
  translated_from_id?: string | null;
  published_at?: string | null;
  scheduled_publish_at?: string | null;
}
