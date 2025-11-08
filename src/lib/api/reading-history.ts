/**
 * Reading History API client functions
 * Story 5.4: User Reading History & Bookmarks
 */

import type {
  ReadingHistory,
  ListReadingHistoryResponse,
  UpdateReadingHistoryRequest,
} from '@/types/bookmark';

/**
 * Track reading history for an article
 * @param articleId - The ID of the article
 * @param data - Reading progress data
 * @returns The updated reading history
 */
export async function trackReadingHistory(
  articleId: string,
  data: UpdateReadingHistoryRequest
): Promise<ReadingHistory> {
  const response = await fetch(`/api/articles/${articleId}/reading-history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track reading history');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get reading history for an article
 * @param articleId - The ID of the article
 * @returns The reading history or null if not found
 */
export async function getReadingHistory(articleId: string): Promise<ReadingHistory | null> {
  const response = await fetch(`/api/articles/${articleId}/reading-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get reading history');
  }

  const result = await response.json();
  return result.data;
}

/**
 * List user's reading history
 * @param options - Pagination and filter options
 * @returns List of reading history with article details
 */
export async function listReadingHistory(options?: {
  page?: number;
  limit?: number;
  completed?: boolean;
}): Promise<ListReadingHistoryResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', options.page.toString());
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.completed !== undefined) params.set('completed', options.completed.toString());

  const response = await fetch(`/api/reading-history?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list reading history');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a reading history entry
 * @param articleId - The ID of the article
 */
export async function deleteReadingHistory(articleId: string): Promise<void> {
  const response = await fetch('/api/reading-history', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article_id: articleId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete reading history');
  }
}
