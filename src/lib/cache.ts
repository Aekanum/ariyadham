/**
 * Cache Utilities (Story 7.4: Caching Strategy)
 *
 * Provides helper functions for setting cache headers on API responses
 * following the caching strategy defined in architecture.md
 */

import { NextResponse } from 'next/server';

/**
 * Cache configuration presets
 */
export const CacheConfig = {
  /**
   * No caching - for authenticated/personalized data
   * Cache-Control: private, no-cache, no-store, must-revalidate
   */
  NONE: 'private, no-cache, no-store, must-revalidate',

  /**
   * Short cache (30 seconds) for frequently changing public data
   * Cache-Control: public, max-age=30, stale-while-revalidate=60
   */
  SHORT: 'public, max-age=30, stale-while-revalidate=60',

  /**
   * Medium cache (60 seconds) for semi-static public data
   * Cache-Control: public, max-age=60, stale-while-revalidate=300
   */
  MEDIUM: 'public, max-age=60, stale-while-revalidate=300',

  /**
   * Long cache (5 minutes) for mostly static public data
   * Cache-Control: public, max-age=300, stale-while-revalidate=600
   */
  LONG: 'public, max-age=300, stale-while-revalidate=600',

  /**
   * Very long cache (1 hour) for rarely changing public data
   * Cache-Control: public, max-age=3600, stale-while-revalidate=7200
   */
  VERY_LONG: 'public, max-age=3600, stale-while-revalidate=7200',

  /**
   * Immutable cache (1 year) for content that never changes
   * Cache-Control: public, max-age=31536000, immutable
   */
  IMMUTABLE: 'public, max-age=31536000, immutable',
} as const;

/**
 * Add cache headers to a NextResponse
 *
 * @param response - The NextResponse object
 * @param cacheControl - Cache-Control header value (use CacheConfig presets)
 * @returns The response with cache headers added
 *
 * @example
 * ```ts
 * const response = NextResponse.json({ data: articles });
 * return withCache(response, CacheConfig.SHORT);
 * ```
 */
export function withCache(
  response: NextResponse,
  cacheControl: string = CacheConfig.MEDIUM
): NextResponse {
  response.headers.set('Cache-Control', cacheControl);
  return response;
}

/**
 * Create a cached JSON response
 *
 * @param data - The data to return as JSON
 * @param options - Response options
 * @param cacheControl - Cache-Control header value
 * @returns NextResponse with cache headers
 *
 * @example
 * ```ts
 * return cachedJson({ success: true, data: articles }, CacheConfig.MEDIUM);
 * ```
 */
export function cachedJson<T>(
  data: T,
  cacheControl: string = CacheConfig.MEDIUM,
  options?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, options);
  return withCache(response, cacheControl);
}

/**
 * Determine appropriate cache strategy based on data characteristics
 *
 * @param options - Configuration options
 * @returns Cache-Control header value
 *
 * @example
 * ```ts
 * const cacheStrategy = getCacheStrategy({
 *   isAuthenticated: true,
 *   isPublic: false,
 * });
 * // Returns: CacheConfig.NONE
 * ```
 */
export function getCacheStrategy(options: {
  /** Whether the request is authenticated */
  isAuthenticated?: boolean;
  /** Whether the data is public */
  isPublic?: boolean;
  /** How often the data changes (in seconds) */
  updateFrequency?: 'realtime' | 'frequent' | 'moderate' | 'rare' | 'static';
}): string {
  const { isAuthenticated = false, isPublic = true, updateFrequency = 'moderate' } = options;

  // No caching for authenticated or private data
  if (isAuthenticated || !isPublic) {
    return CacheConfig.NONE;
  }

  // Choose cache duration based on update frequency
  switch (updateFrequency) {
    case 'realtime':
      return CacheConfig.NONE;
    case 'frequent':
      return CacheConfig.SHORT;
    case 'moderate':
      return CacheConfig.MEDIUM;
    case 'rare':
      return CacheConfig.LONG;
    case 'static':
      return CacheConfig.VERY_LONG;
    default:
      return CacheConfig.MEDIUM;
  }
}

/**
 * Add Vary header to response for content negotiation
 * This helps with caching responses that vary by request headers
 *
 * @param response - The NextResponse object
 * @param headers - Headers to vary by (e.g., ['Accept-Language', 'Authorization'])
 * @returns The response with Vary header added
 */
export function withVary(response: NextResponse, headers: string[]): NextResponse {
  response.headers.set('Vary', headers.join(', '));
  return response;
}

/**
 * Add ETag header for conditional requests
 * Clients can use If-None-Match to avoid re-downloading unchanged content
 *
 * @param response - The NextResponse object
 * @param etag - The ETag value (should be a hash of the content)
 * @returns The response with ETag header added
 */
export function withETag(response: NextResponse, etag: string): NextResponse {
  response.headers.set('ETag', `"${etag}"`);
  return response;
}

/**
 * Generate a simple hash for ETag generation
 * For production, consider using a proper hashing algorithm
 *
 * @param content - The content to hash
 * @returns A hash string
 */
export function generateETag(content: string): string {
  // Simple hash function (FNV-1a)
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
}
