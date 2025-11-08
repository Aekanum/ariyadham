/**
 * Content Constants
 *
 * Content-related constants including categories, default values, and content metadata
 * for the Ariyadham platform.
 */

/**
 * Article categories
 */
export const ARTICLE_CATEGORIES = [
  {
    id: 'gratitude',
    name: 'Gratitude',
    nameTh: 'กตัญญู',
    slug: 'gratitude',
    description: 'Articles about gratitude and appreciation',
    descriptionTh: 'บทความเกี่ยวกับความกตัญญูและความซาบซึ้งบุญคุณ',
  },
  {
    id: 'ethics',
    name: 'Ethics',
    nameTh: 'ศีลธรรม',
    slug: 'ethics',
    description: 'Articles about moral conduct and ethics',
    descriptionTh: 'บทความเกี่ยวกับศีลธรรมและจริยธรรม',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    nameTh: 'สมาธิ',
    slug: 'meditation',
    description: 'Articles about meditation practices',
    descriptionTh: 'บทความเกี่ยวกับการปฏิบัติสมาธิ',
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    nameTh: 'ปัญญา',
    slug: 'wisdom',
    description: 'Articles about wisdom and understanding',
    descriptionTh: 'บทความเกี่ยวกับปัญญาและความเข้าใจ',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    nameTh: 'สติ',
    slug: 'mindfulness',
    description: 'Articles about mindful living',
    descriptionTh: 'บทความเกี่ยวกับการใช้ชีวิตอย่างมีสติ',
  },
  {
    id: 'compassion',
    name: 'Compassion',
    nameTh: 'เมตตา',
    slug: 'compassion',
    description: 'Articles about loving-kindness and compassion',
    descriptionTh: 'บทความเกี่ยวกับเมตตาและความเห็นอกเห็นใจ',
  },
] as const;

/**
 * Article status options
 */
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  USER: 'user',
  AUTHOR: 'author',
  ADMIN: 'admin',
} as const;

/**
 * Author verification status
 */
export const AUTHOR_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

/**
 * Default values for content
 */
export const DEFAULT_VALUES = {
  ARTICLE: {
    EXCERPT_LENGTH: 200,
    READING_SPEED_WPM: 200,
    DEFAULT_FEATURED_IMAGE: '/images/default-article.jpg',
  },
  USER: {
    DEFAULT_AVATAR: '/images/default-avatar.png',
    DEFAULT_THEME: 'light',
    DEFAULT_LANGUAGE: 'th',
    DEFAULT_FONT_SIZE: 16,
  },
  PAGINATION: {
    PAGE: 1,
    PAGE_SIZE: 10,
  },
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  SLUG: /^[a-z0-9-]+$/,
  URL: /^https?:\/\/.+/,
  PHONE_TH: /^0[0-9]{9}$/,
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_URL: 'Please enter a valid URL starting with http:// or https://',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  GENERIC_ERROR: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  ARTICLE_CREATED: 'Article created successfully',
  ARTICLE_UPDATED: 'Article updated successfully',
  ARTICLE_DELETED: 'Article deleted successfully',
  ARTICLE_PUBLISHED: 'Article published successfully',
  COMMENT_ADDED: 'Comment added successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
  ANJALI_ADDED: 'Anjali recorded successfully',
  BOOKMARK_ADDED: 'Article bookmarked successfully',
  BOOKMARK_REMOVED: 'Bookmark removed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  COPY_SUCCESS: 'Copied to clipboard',
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

/**
 * Loading messages
 */
export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  PUBLISHING: 'Publishing...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  DELETING: 'Deleting...',
} as const;

/**
 * Empty state messages
 */
export const EMPTY_STATE_MESSAGES = {
  NO_ARTICLES: 'No articles found',
  NO_COMMENTS: 'No comments yet. Be the first to comment!',
  NO_BOOKMARKS: 'You have no bookmarked articles',
  NO_READING_HISTORY: 'Your reading history is empty',
  NO_SEARCH_RESULTS: 'No results found for your search',
  NO_NOTIFICATIONS: 'You have no notifications',
} as const;

/**
 * Confirmation messages
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_ARTICLE: 'Are you sure you want to delete this article? This action cannot be undone.',
  DELETE_COMMENT: 'Are you sure you want to delete this comment?',
  LOGOUT: 'Are you sure you want to log out?',
  DISCARD_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  UNPUBLISH_ARTICLE: 'Are you sure you want to unpublish this article?',
} as const;

/**
 * Social media platforms
 */
export const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
  { id: 'line', name: 'LINE', icon: 'line', color: '#00B900' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { id: 'website', name: 'Website', icon: 'globe', color: '#6366F1' },
] as const;

/**
 * Reading time estimations
 */
export const READING_TIME = {
  WORDS_PER_MINUTE: 200,
  LABELS: {
    EN: (minutes: number) => `${minutes} min read`,
    TH: (minutes: number) => `อ่าน ${minutes} นาที`,
  },
} as const;

/**
 * Date format presets
 */
export const DATE_FORMATS = {
  SHORT: 'short' as const,
  MEDIUM: 'medium' as const,
  LONG: 'long' as const,
  FULL: 'full' as const,
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  ARTICLE_IMAGE: 10 * 1024 * 1024, // 10MB
  ATTACHMENT: 25 * 1024 * 1024, // 25MB
} as const;

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENT: ['application/pdf', 'application/msword'],
} as const;
