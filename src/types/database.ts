/**
 * Database Type Definitions
 *
 * TypeScript types for all Ariyadham database tables.
 * These types are used for type-safe database operations throughout the application.
 *
 * Generated from: migrations/001_create_base_tables.sql
 * Last Updated: 2025-11-08
 * Updated: Added AuthorApplication types (Story 2.3)
 */

/**
 * User Role Type
 * Represents the role hierarchy in the system
 */
export type UserRole = 'reader' | 'author' | 'admin';

/**
 * User type
 * Represents a registered user in the system
 */
export interface User {
  id: string; // UUID - from auth.users
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  language_preference: 'en' | 'th';
  theme_preference: 'light' | 'dark' | 'system';
  reading_font_size: number;
  accessibility_mode: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  last_login_at: string | null; // ISO 8601 timestamp
}

/**
 * Author type
 * Represents an author profile for users who write content
 */
export interface Author {
  id: string; // UUID
  user_id: string; // UUID - foreign key to users
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null; // ISO 8601 timestamp
  bio_expanded: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null; // JSON object
  article_count: number; // Denormalized - updated via triggers
  total_anjali_count: number; // Denormalized - updated via triggers
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp - soft delete
}

/**
 * Article type
 * Represents a published or draft article
 */
export interface Article {
  id: string; // UUID
  author_id: string; // UUID - foreign key to authors
  translated_from_id: string | null; // UUID - for translations
  title: string;
  slug: string; // URL-friendly identifier
  excerpt: string | null;
  content: string; // Markdown content
  language: 'en' | 'th';
  featured_image_url: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null; // ISO 8601 timestamp
  scheduled_for: string | null; // ISO 8601 timestamp
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  view_count: number; // Denormalized
  comment_count: number; // Denormalized - updated via triggers
  anjali_count: number; // Denormalized - updated via triggers
  bookmark_count: number; // Denormalized - updated via triggers
  reading_time_minutes: number | null; // Calculated field
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp - soft delete
}

/**
 * Category type
 * Represents a content category/taxonomy for dharma topics
 */
export interface Category {
  id: string; // UUID
  name_en: string;
  name_th: string;
  slug_en: string;
  slug_th: string;
  description_en: string | null;
  description_th: string | null;
  icon_url: string | null; // URL to SVG or image
  color_hex: string | null; // e.g. "#3B82F6"
  seo_description_en: string | null;
  seo_description_th: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * ArticleCategory type
 * Junction table linking articles to categories
 */
export interface ArticleCategory {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  category_id: string; // UUID - foreign key to categories
  sort_order: number;
  created_at: string; // ISO 8601 timestamp
}

/**
 * Tag type
 * Represents user-created tags for flexible article labeling (Story 4.3)
 */
export interface Tag {
  id: string; // UUID
  name: string; // Tag name
  slug: string; // URL-friendly identifier
  description: string | null; // Optional description
  status: 'pending' | 'approved' | 'rejected'; // Moderation status
  created_by: string | null; // UUID - foreign key to users
  usage_count: number; // Denormalized count of how many articles use this tag
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * ArticleTag type
 * Junction table linking articles to tags (Story 4.3)
 */
export interface ArticleTag {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  tag_id: string; // UUID - foreign key to tags
  created_at: string; // ISO 8601 timestamp
}

/**
 * ArticleTranslation type
 * Tracks translations of articles to other languages
 */
export interface ArticleTranslation {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles (translated version)
  original_article_id: string; // UUID - foreign key to articles (original)
  language: string; // e.g. "th", "en"
  status: 'pending' | 'approved' | 'rejected';
  translator_id: string | null; // UUID - foreign key to users
  approved_by_id: string | null; // UUID - foreign key to users
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  approved_at: string | null; // ISO 8601 timestamp
}

/**
 * Comment type
 * Represents a comment on an article
 */
export interface Comment {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  user_id: string; // UUID - foreign key to users
  parent_comment_id: string | null; // UUID - for threaded replies
  content: string;
  status: 'published' | 'pending' | 'approved' | 'rejected' | 'spam';
  flagged_as_spam: boolean;
  reply_count: number; // Denormalized
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp - soft delete
}

/**
 * AnjaliReaction type
 * Represents an "Anjali" (🙏) reaction to an article
 * Dharma-specific interaction replacing generic "likes"
 */
export interface AnjaliReaction {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  user_id: string; // UUID - foreign key to users
  created_at: string; // ISO 8601 timestamp
  // Unique constraint: one reaction per user per article
}

/**
 * Bookmark type
 * Represents a saved article for later reading
 */
export interface Bookmark {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  user_id: string; // UUID - foreign key to users
  folder_name: string | null; // Optional custom folder
  created_at: string; // ISO 8601 timestamp
  // Unique constraint: one bookmark per user per article
}

/**
 * ReadingHistory type
 * Tracks user reading progress and engagement with articles
 */
export interface ReadingHistory {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  user_id: string; // UUID - foreign key to users
  scroll_percentage: number; // 0-100
  time_spent_seconds: number;
  completed: boolean;
  completion_percentage: number; // 0-100
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  // Unique constraint: one active read per user per article
}

/**
 * ArticleView type
 * Tracks individual article views for analytics (Story 4.4)
 */
export interface ArticleView {
  id: string; // UUID
  article_id: string; // UUID - foreign key to articles
  user_id: string | null; // UUID - foreign key to users (null for anonymous)
  ip_address: string | null; // INET - for deduplication
  user_agent: string | null; // Browser/device info
  referrer: string | null; // Where the view came from
  viewed_at: string; // ISO 8601 timestamp
}

/**
 * AuthorDashboardStats type
 * Materialized view for author dashboard statistics (Story 4.4)
 */
export interface AuthorDashboardStats {
  author_id: string; // UUID
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  scheduled_articles: number;
  total_views: number;
  total_anjali: number;
  total_comments: number;
  last_published_at: string | null; // ISO 8601 timestamp
}

/**
 * ArticleDailyStats type
 * View for daily article view statistics (Story 4.4)
 */
export interface ArticleDailyStats {
  article_id: string; // UUID
  view_date: string; // Date
  views_count: number;
  unique_viewers: number;
}

/**
 * ArticleSummaryStats type
 * Complete article statistics with time-based metrics (Story 4.4)
 */
export interface ArticleSummaryStats {
  article_id: string; // UUID
  title: string;
  slug: string;
  status: Article['status'];
  published_at: string | null;
  total_views: number;
  total_anjali: number;
  total_comments: number;
  views_last_7_days: number;
  views_last_30_days: number;
  views_last_90_days: number;
}

/**
 * AuditLog type
 * System audit trail for compliance and debugging
 */
export interface AuditLog {
  id: string; // UUID
  action: string; // e.g., 'article_published', 'user_created'
  entity_type: string; // e.g., 'article', 'user', 'comment'
  entity_id: string;
  actor_id: string | null; // UUID - foreign key to users
  actor_role: string | null; // e.g., 'admin', 'user'
  changes: Record<string, any> | null; // JSON object with field changes
  details: Record<string, any> | null; // Additional context
  success: boolean;
  error_message: string | null;
  created_at: string; // ISO 8601 timestamp
}

/**
 * RoleChangeLog type
 * Audit trail for user role changes (Story 2.2)
 */
export interface RoleChangeLog {
  id: string; // UUID
  user_id: string; // UUID - user whose role was changed
  old_role: UserRole | null; // Previous role (null for initial assignment)
  new_role: UserRole; // New role assigned
  changed_by: string; // UUID - admin who made the change
  reason: string | null; // Optional reason for the change
  created_at: string; // ISO 8601 timestamp
}

/**
 * ApplicationStatus type
 * Represents the status of an author application (Story 2.3)
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/**
 * AuthorApplication type
 * Represents an application to become an author (Story 2.3)
 */
export interface AuthorApplication {
  id: string; // UUID
  user_id: string; // UUID - applicant user
  bio: string; // Applicant bio (100-1000 chars)
  credentials: string; // Credentials and experience (50-2000 chars)
  writing_samples: string | null; // Optional writing samples or links
  motivation: string | null; // Why they want to become author (100-1000 chars)
  status: ApplicationStatus; // Application status
  reviewed_by: string | null; // UUID - admin who reviewed
  reviewed_at: string | null; // ISO 8601 timestamp
  rejection_reason: string | null; // Optional reason for rejection
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * AuthorApplicationWithUser type
 * Author application joined with user information
 */
export interface AuthorApplicationWithUser extends AuthorApplication {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * ============================================================================
 * COMPOSITE TYPES - For queries that join multiple tables
 * ============================================================================
 */

/**
 * ArticleWithAuthor type
 * Article joined with author information
 */
export interface ArticleWithAuthor extends Article {
  author?: Author;
}

/**
 * ArticleWithAuthorAndCategories type
 * Article joined with author and categories
 */
export interface ArticleWithAuthorAndCategories extends ArticleWithAuthor {
  categories?: Category[];
}

/**
 * ArticleWithTaxonomy type
 * Article joined with author, categories, and tags (Story 4.3)
 */
export interface ArticleWithTaxonomy extends ArticleWithAuthor {
  categories?: Category[];
  tags?: Tag[];
}

/**
 * UserProfile type
 * User information with author details if applicable
 */
export interface UserProfile extends User {
  author?: Author;
}

/**
 * CommentWithUser type
 * Comment joined with user information
 */
export interface CommentWithUser extends Comment {
  user?: User;
  replies?: CommentWithUser[]; // For nested replies
}

/**
 * ============================================================================
 * REQUEST/RESPONSE TYPES - For API operations
 * ============================================================================
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string; // Machine-readable error code
    message: string; // User-friendly message
    details?: Record<string, any>;
  };
}

/**
 * Pagination type
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated Response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Article Filter type
 * For flexible article querying
 */
export interface ArticleFilters {
  status?: Article['status'];
  language?: Article['language'];
  author_id?: string;
  category_id?: string;
  search?: string;
  sortBy?: 'published_at' | 'created_at' | 'view_count' | 'anjali_count';
  sortOrder?: 'asc' | 'desc';
}

/**
 * ============================================================================
 * INPUT TYPES - For create/update operations
 * ============================================================================
 */

/**
 * CreateArticleInput type
 * Required and optional fields for creating a new article
 */
export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  language: 'en' | 'th';
  featured_image_url?: string;
  status?: Article['status'];
  scheduled_for?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  reading_time_minutes?: number;
  category_ids?: string[]; // Category IDs to assign (Story 4.3)
  tag_ids?: string[]; // Tag IDs to assign (Story 4.3)
  new_tags?: string[]; // New tag names to create and assign (Story 4.3)
}

/**
 * UpdateArticleInput type
 * Partial update for articles
 */
export type UpdateArticleInput = Partial<CreateArticleInput>;

/**
 * CreateCommentInput type
 */
export interface CreateCommentInput {
  content: string;
  parent_comment_id?: string;
}

/**
 * UpdateCommentInput type
 */
export interface UpdateCommentInput {
  content?: string;
  status?: Comment['status'];
  flagged_as_spam?: boolean;
}

/**
 * UpdateUserProfileInput type
 */
export interface UpdateUserProfileInput {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  language_preference?: User['language_preference'];
  theme_preference?: User['theme_preference'];
  reading_font_size?: number;
  accessibility_mode?: boolean;
}

/**
 * CreateAuthorApplicationInput type
 * Required fields for submitting an author application (Story 2.3)
 */
export interface CreateAuthorApplicationInput {
  bio: string; // 100-1000 chars
  credentials: string; // 50-2000 chars
  writing_samples?: string;
  motivation: string; // 100-1000 chars
}

/**
 * ReviewApplicationRequest type
 * Request body for admin to approve/reject application (Story 2.3)
 */
export interface ReviewApplicationRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}

/**
 * ============================================================================
 * HELPER FUNCTIONS FOR TYPE GUARDS
 * ============================================================================
 */

/**
 * Type guard to check if value is a valid user role
 */
export function isValidUserRole(value: any): value is User['role'] {
  return ['user', 'author', 'admin'].includes(value);
}

/**
 * Type guard to check if value is a valid article status
 */
export function isValidArticleStatus(value: any): value is Article['status'] {
  return ['draft', 'scheduled', 'published', 'archived'].includes(value);
}

/**
 * Type guard to check if value is a valid article language
 */
export function isValidLanguage(value: any): value is 'en' | 'th' {
  return ['en', 'th'].includes(value);
}

/**
 * Type guard to check if value is a valid comment status
 */
export function isValidCommentStatus(value: any): value is Comment['status'] {
  return ['published', 'pending', 'approved', 'rejected', 'spam'].includes(value);
}

/**
 * Type guard to check if value is a valid author verification status
 */
export function isValidVerificationStatus(value: any): value is Author['verification_status'] {
  return ['pending', 'verified', 'rejected'].includes(value);
}

/**
 * Type guard to check if value is a valid application status
 */
export function isValidApplicationStatus(value: any): value is ApplicationStatus {
  return ['pending', 'approved', 'rejected', 'withdrawn'].includes(value);
}
