/**
 * Category API Functions
 * Story 4.3: Article Categorization & Tagging
 */

import { Category } from '@/types/database';

/**
 * Fetch all active categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  return response.json();
}

/**
 * Fetch a single category by ID
 */
export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch category');
  }

  return response.json();
}

/**
 * Fetch a category by slug
 */
export async function getCategoryBySlug(
  slug: string,
  language: 'en' | 'th' = 'en'
): Promise<Category> {
  const response = await fetch(`/api/categories/slug/${slug}?language=${language}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch category');
  }

  return response.json();
}
