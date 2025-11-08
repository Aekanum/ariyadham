/**
 * Bookmarks API client functions
 * Story 5.4: User Reading History & Bookmarks
 */

import type {
  ToggleBookmarkResponse,
  BookmarkStatusResponse,
  ListBookmarksResponse,
} from '@/types/bookmark';

/**
 * Toggle bookmark on an article
 * @param articleId - The ID of the article
 * @param folderName - Optional folder name for organizing bookmarks
 * @returns The new bookmark state and count
 */
export async function toggleBookmark(
  articleId: string,
  folderName?: string | null
): Promise<ToggleBookmarkResponse> {
  const response = await fetch(`/api/articles/${articleId}/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folder_name: folderName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle bookmark');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get bookmark status for an article
 * @param articleId - The ID of the article
 * @returns The bookmark count and user's bookmark status
 */
export async function getBookmarkStatus(articleId: string): Promise<BookmarkStatusResponse> {
  const response = await fetch(`/api/articles/${articleId}/bookmarks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get bookmark status');
  }

  const result = await response.json();
  return result.data;
}

/**
 * List user's bookmarks
 * @param options - Pagination and filter options
 * @returns List of bookmarks with article details
 */
export async function listBookmarks(options?: {
  page?: number;
  limit?: number;
  folder?: string;
}): Promise<ListBookmarksResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', options.page.toString());
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.folder) params.set('folder', options.folder);

  const response = await fetch(`/api/bookmarks?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list bookmarks');
  }

  const result = await response.json();
  return result.data;
}
