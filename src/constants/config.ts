/**
 * Application Configuration Constants
 *
 * Centralized configuration values for the Ariyadham platform.
 * Environment-specific values are loaded from process.env.
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  NAME: 'Ariyadham',
  DESCRIPTION: 'A platform for sharing and discovering dharma content',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'https://ariyadham.com',
  VERSION: '1.0.0',
  LOCALE: {
    DEFAULT: 'th-TH',
    SUPPORTED: ['en-US', 'th-TH'],
  },
} as const;

/**
 * Supabase configuration
 */
export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  SESSION_COOKIE_NAME: 'ariyadham-session',
  REMEMBER_ME_DAYS: 30,
  SESSION_REFRESH_INTERVAL: 1000 * 60 * 5, // 5 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
} as const;

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  ARTICLE_PAGE_SIZE: 12,
  COMMENT_PAGE_SIZE: 20,
  SEARCH_PAGE_SIZE: 15,
} as const;

/**
 * Content limits
 */
export const CONTENT_LIMITS = {
  ARTICLE: {
    TITLE_MIN: 3,
    TITLE_MAX: 200,
    EXCERPT_MAX: 500,
    CONTENT_MIN: 100,
    CONTENT_MAX: 50000,
    SLUG_MAX: 100,
    TAGS_MAX: 10,
  },
  COMMENT: {
    MIN: 1,
    MAX: 1000,
    REPLY_DEPTH_MAX: 3,
  },
  USER: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    BIO_MAX: 500,
    FULL_NAME_MAX: 100,
  },
  AUTHOR: {
    BIO_EXPANDED_MAX: 2000,
  },
} as const;

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DIMENSIONS: {
      MAX_WIDTH: 1000,
      MAX_HEIGHT: 1000,
    },
  },
  ARTICLE_IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DIMENSIONS: {
      MAX_WIDTH: 2000,
      MAX_HEIGHT: 2000,
    },
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  API: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60,
  },
  SEARCH: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 20,
  },
} as const;

/**
 * Cache configuration (in seconds)
 */
export const CACHE_CONFIG = {
  ARTICLE: 60 * 5, // 5 minutes
  ARTICLE_LIST: 60 * 2, // 2 minutes
  CATEGORY: 60 * 30, // 30 minutes
  TAG: 60 * 30, // 30 minutes
  USER_PROFILE: 60 * 5, // 5 minutes
  SEARCH: 60, // 1 minute
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  ENABLE_COMMENTS: true,
  ENABLE_ANJALI: true,
  ENABLE_BOOKMARKS: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_SEARCH: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: false, // Coming soon
  ENABLE_MULTILANG: true,
  ENABLE_DARK_MODE: true,
} as const;

/**
 * SEO configuration
 */
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Ariyadham - Sharing Dharma',
  TITLE_TEMPLATE: '%s | Ariyadham',
  DEFAULT_DESCRIPTION:
    'A platform for sharing and discovering dharma content to cultivate mindfulness and wisdom',
  DEFAULT_IMAGE: '/images/og-default.jpg',
  TWITTER_HANDLE: '@ariyadham',
} as const;

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  ENABLE_TRACKING: process.env.NODE_ENV === 'production',
} as const;

/**
 * Error monitoring configuration
 */
export const ERROR_MONITORING_CONFIG = {
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
  SAMPLE_RATE: 1.0,
} as const;

/**
 * Environment checks
 */
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_BROWSER: typeof window !== 'undefined',
  IS_SERVER: typeof window === 'undefined',
} as const;

/**
 * Responsive breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light' as const,
  AVAILABLE_THEMES: ['light', 'dark', 'system'] as const,
  STORAGE_KEY: 'ariyadham-theme',
} as const;

/**
 * Time periods for analytics
 */
export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_90_DAYS: 'last90days',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
  CUSTOM: 'custom',
} as const;

/**
 * Notification settings
 */
export const NOTIFICATION_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  TOAST_POSITION: 'top-right' as const,
  MAX_NOTIFICATIONS: 3,
} as const;
