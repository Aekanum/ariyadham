/**
 * Article type definitions
 * Story 3.1: Article Display & Reading Interface
 * Story 4.2: Article Publishing & Scheduling
 */

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

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
  published_at: string | null;
  scheduled_publish_at: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  category: string | null;
  created_at: string;
  updated_at: string;
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
  published_at?: string | null;
  scheduled_publish_at?: string | null;
}
