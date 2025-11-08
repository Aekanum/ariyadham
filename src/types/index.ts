/**
 * Type Definitions Index
 *
 * Central export for all TypeScript types used across the Ariyadham platform.
 * Import types from this file to ensure consistent usage.
 *
 * @example
 * import { User, Article, PaginatedResponse, AsyncState } from '@/types';
 */

// API types (includes ApiResponse, PaginationParams, PaginatedResponse)
export * from './api';

// Database types (excluding duplicates that are in api.ts)
export type {
  User,
  Author,
  Article,
  Category,
  ArticleCategory,
  ArticleTranslation,
  Comment,
  AnjaliReaction,
  Bookmark,
  ReadingHistory,
  AuditLog,
  ArticleWithAuthor,
  ArticleWithAuthorAndCategories,
  UserProfile,
  CommentWithUser,
  ArticleFilters,
  CreateArticleInput,
  UpdateArticleInput,
  CreateCommentInput,
  UpdateCommentInput,
  UpdateUserProfileInput,
} from './database';

export {
  isValidUserRole,
  isValidArticleStatus,
  isValidLanguage,
  isValidCommentStatus,
  isValidVerificationStatus,
} from './database';

// Common types
export * from './common';

// Comment types
export * from './comment';

// Anjali types
export * from './anjali';
