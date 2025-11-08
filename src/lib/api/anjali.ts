/**
 * Anjali API client functions
 * Story 5.1: Anjali Button & Reactions
 */

import type { AnjaliStatusResponse, ToggleAnjaliResponse } from '@/types/anjali';

/**
 * Toggle anjali reaction on an article
 * @param articleId - The ID of the article
 * @returns The new anjali state and count
 */
export async function toggleAnjali(articleId: string): Promise<ToggleAnjaliResponse> {
  const response = await fetch(`/api/articles/${articleId}/anjali`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle anjali');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get anjali status for an article
 * @param articleId - The ID of the article
 * @returns The anjali count and user's anjali status
 */
export async function getAnjaliStatus(articleId: string): Promise<AnjaliStatusResponse> {
  const response = await fetch(`/api/articles/${articleId}/anjali`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get anjali status');
  }

  const result = await response.json();
  return result.data;
}
