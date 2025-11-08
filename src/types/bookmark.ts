/**
 * Bookmark and Reading History type definitions
 * Story 5.4: User Reading History & Bookmarks
 */

/**
 * Bookmark interface
 */
export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  folder_name: string | null;
  created_at: string;
}

/**
 * Bookmark with article details
 */
export interface BookmarkWithArticle extends Bookmark {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    reading_time_minutes: number | null;
    author: {
      id: string;
      user_id: string;
      user: {
        full_name: string | null;
        username: string;
        avatar_url: string | null;
      };
    };
  };
}

/**
 * Toggle bookmark response
 */
export interface ToggleBookmarkResponse {
  has_bookmarked: boolean;
  bookmark_count: number;
}

/**
 * Bookmark status response
 */
export interface BookmarkStatusResponse {
  bookmark_count: number;
  user_has_bookmarked: boolean;
}

/**
 * List bookmarks response
 */
export interface ListBookmarksResponse {
  bookmarks: BookmarkWithArticle[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Reading history interface
 */
export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  scroll_percentage: number;
  time_spent_seconds: number;
  completed: boolean;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

/**
 * Reading history with article details
 */
export interface ReadingHistoryWithArticle extends ReadingHistory {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    reading_time_minutes: number | null;
    author: {
      id: string;
      user_id: string;
      user: {
        full_name: string | null;
        username: string;
        avatar_url: string | null;
      };
    };
  };
}

/**
 * List reading history response
 */
export interface ListReadingHistoryResponse {
  history: ReadingHistoryWithArticle[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Update reading history request
 */
export interface UpdateReadingHistoryRequest {
  scroll_percentage?: number;
  time_spent_seconds?: number;
  completed?: boolean;
  completion_percentage?: number;
}

/**
 * API response for bookmark endpoints
 */
export interface BookmarkApiResponse {
  success: boolean;
  data: ToggleBookmarkResponse | BookmarkStatusResponse | ListBookmarksResponse;
  error?: string;
}

/**
 * API response for reading history endpoints
 */
export interface ReadingHistoryApiResponse {
  success: boolean;
  data: ReadingHistory | ListReadingHistoryResponse;
  error?: string;
}
