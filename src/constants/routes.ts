/**
 * Route Constants
 *
 * Centralized route definitions for the Ariyadham platform.
 * Use these constants instead of hardcoded strings to prevent typos and enable refactoring.
 */

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Article routes
  ARTICLES: '/articles',
  ARTICLE: (slug: string) => `/articles/${slug}`,
  CATEGORY: (slug: string) => `/categories/${slug}`,
  TAG: (slug: string) => `/tags/${slug}`,
  AUTHOR: (username: string) => `/authors/${username}`,

  // Content pages
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

/**
 * Authenticated user routes
 */
export const USER_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BOOKMARKS: '/bookmarks',
  READING_HISTORY: '/history',
} as const;

/**
 * Author routes
 */
export const AUTHOR_ROUTES = {
  DASHBOARD: '/author/dashboard',
  ARTICLES: '/author/articles',
  CREATE_ARTICLE: '/author/articles/new',
  EDIT_ARTICLE: (id: string) => `/author/articles/${id}/edit`,
  ANALYTICS: '/author/analytics',
} as const;

/**
 * Admin routes
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ARTICLES: '/admin/articles',
  ARTICLE_DETAIL: (id: string) => `/admin/articles/${id}`,
  MODERATION: '/admin/moderation',
  FEATURED_CONTENT: '/admin/featured',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  SIGNUP: '/api/auth/signup',
  REFRESH: '/api/auth/refresh',

  // Users
  USERS: '/api/users',
  USER: (id: string) => `/api/users/${id}`,
  USER_PROFILE: '/api/users/profile',

  // Articles
  ARTICLES: '/api/articles',
  ARTICLE: (id: string) => `/api/articles/${id}`,
  ARTICLE_BY_SLUG: (slug: string) => `/api/articles/slug/${slug}`,
  ARTICLES_BY_CATEGORY: (categoryId: string) =>
    `/api/articles/category/${categoryId}`,
  ARTICLES_BY_TAG: (tagId: string) => `/api/articles/tag/${tagId}`,
  ARTICLES_BY_AUTHOR: (authorId: string) => `/api/articles/author/${authorId}`,

  // Comments
  COMMENTS: (articleId: string) => `/api/articles/${articleId}/comments`,
  COMMENT: (articleId: string, commentId: string) =>
    `/api/articles/${articleId}/comments/${commentId}`,

  // Anjali reactions
  ANJALI: (articleId: string) => `/api/articles/${articleId}/anjali`,

  // Bookmarks
  BOOKMARKS: '/api/bookmarks',
  BOOKMARK: (articleId: string) => `/api/bookmarks/${articleId}`,

  // Search
  SEARCH: '/api/search',

  // Categories & Tags
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_ARTICLES: '/api/admin/articles',
  ADMIN_ANALYTICS: '/api/admin/analytics',
} as const;

/**
 * External routes
 */
export const EXTERNAL_ROUTES = {
  GITHUB: 'https://github.com/ariyadham',
  TWITTER: 'https://twitter.com/ariyadham',
  FACEBOOK: 'https://facebook.com/ariyadham',
} as const;

/**
 * All routes combined
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  USER: USER_ROUTES,
  AUTHOR: AUTHOR_ROUTES,
  ADMIN: ADMIN_ROUTES,
  API: API_ROUTES,
  EXTERNAL: EXTERNAL_ROUTES,
} as const;
