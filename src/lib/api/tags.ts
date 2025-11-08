/**
 * Tag API Functions
 * Story 4.3: Article Categorization & Tagging
 */

import { Tag } from '@/types/database';

/**
 * Search for tags by name (autocomplete)
 */
export async function searchTags(query: string): Promise<Tag[]> {
  const response = await fetch(`/api/tags/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search tags');
  }

  return response.json();
}

/**
 * Get all approved tags
 */
export async function getTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tags');
  }

  return response.json();
}

/**
 * Get popular tags (by usage count)
 */
export async function getPopularTags(limit: number = 10): Promise<Tag[]> {
  const response = await fetch(`/api/tags/popular?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch popular tags');
  }

  return response.json();
}

/**
 * Create a new tag
 */
export async function createTag(name: string): Promise<Tag> {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create tag');
  }

  return response.json();
}

/**
 * Get a tag by ID
 */
export async function getTag(id: string): Promise<Tag> {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tag');
  }

  return response.json();
}

/**
 * Get a tag by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag> {
  const response = await fetch(`/api/tags/slug/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tag');
  }

  return response.json();
}
