/**
 * Rate Limiting Middleware (Placeholder)
 *
 * This is a placeholder for rate limiting functionality.
 * In production, you should implement proper rate limiting using:
 * - Vercel Edge Middleware with KV storage
 * - Upstash Rate Limit (@upstash/ratelimit)
 * - Redis-based rate limiting
 *
 * For MVP, Vercel's built-in DDoS protection is sufficient.
 *
 * @see docs/API.md for implementation guidelines
 * @see https://vercel.com/docs/security/vercel-firewall for built-in protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorResponse, HttpStatus } from '@/types/api';
import { createErrorResponse } from '../validation';
import { logger } from '../logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom identifier function (defaults to IP address) */
  identifier?: (request: NextRequest) => string;
}

/**
 * Rate limit result
 */
export type RateLimitResult =
  | { success: true }
  | { success: false; error: ApiErrorResponse; status: HttpStatus };

/**
 * In-memory store for rate limiting (DEVELOPMENT ONLY)
 * DO NOT USE IN PRODUCTION - use Redis or KV store instead
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware (placeholder implementation)
 *
 * IMPORTANT: This is a basic in-memory implementation for development.
 * For production, use a proper rate limiting solution like:
 * - @upstash/ratelimit with Vercel KV
 * - Redis-based rate limiting
 * - Vercel Edge Middleware with global state
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   // Apply rate limiting: 10 requests per minute
 *   const rateLimitResult = await checkRateLimit(request, {
 *     maxRequests: 10,
 *     windowMs: 60 * 1000, // 1 minute
 *   });
 *
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(rateLimitResult.error, {
 *       status: rateLimitResult.status
 *     });
 *   }
 *
 *   // ... continue with request
 * }
 * ```
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { success: true };
  }

  // Get identifier (IP address by default)
  const identifier = config.identifier ? config.identifier(request) : getClientIdentifier(request);

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired records periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    cleanupExpiredRecords(now);
  }

  // Check if rate limit is exceeded
  if (record) {
    if (now < record.resetAt) {
      // Within the time window
      if (record.count >= config.maxRequests) {
        logger.warn('Rate limit exceeded', {
          identifier,
          count: record.count,
          maxRequests: config.maxRequests,
        });

        return {
          success: false,
          error: createErrorResponse(
            'RATE_LIMIT_EXCEEDED',
            'Too many requests. Please try again later.',
            {
              retryAfter: Math.ceil((record.resetAt - now) / 1000),
            }
          ),
          status: HttpStatus.TOO_MANY_REQUESTS,
        };
      }

      // Increment count
      record.count++;
    } else {
      // Time window expired, reset
      record.count = 1;
      record.resetAt = now + config.windowMs;
    }
  } else {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
  }

  return { success: true };
}

/**
 * Gets a unique identifier for the client (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from headers (Vercel provides these)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  return forwardedFor?.split(',')[0] || realIp || 'unknown';
}

/**
 * Cleans up expired rate limit records
 */
function cleanupExpiredRecords(now: number): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Middleware wrapper for automatic rate limiting
 *
 * @param handler - API route handler function
 * @param config - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // ... your handler logic
 *     return NextResponse.json({ data: 'example' });
 *   },
 *   {
 *     maxRequests: 10,
 *     windowMs: 60 * 1000, // 1 minute
 *   }
 * );
 * ```
 */
export function withRateLimit<T>(
  handler: (request: NextRequest, ...args: T[]) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, ...args: T[]): Promise<Response> => {
    const rateLimitResult = await checkRateLimit(request, config);

    if (!rateLimitResult.success) {
      return NextResponse.json(rateLimitResult.error, {
        status: rateLimitResult.status,
        headers: {
          'Retry-After': String(rateLimitResult.error.error.details?.retryAfter || 60),
        },
      });
    }

    return handler(request, ...args);
  };
}

/**
 * Common rate limit configurations
 */
export const rateLimitPresets = {
  /** Strict: 5 requests per minute */
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },

  /** Standard: 30 requests per minute */
  standard: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },

  /** Relaxed: 100 requests per minute */
  relaxed: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },

  /** Write operations: 10 requests per minute */
  write: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },

  /** Read operations: 60 requests per minute */
  read: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },

  /** Auth operations: 5 requests per 5 minutes */
  auth: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
  },
};

/**
 * TODO: Production Implementation
 *
 * For production, replace this implementation with:
 *
 * 1. Install Upstash Rate Limit:
 *    npm install @upstash/ratelimit @upstash/redis
 *
 * 2. Set up Vercel KV:
 *    - Go to Vercel Dashboard > Storage > KV
 *    - Create a new KV database
 *    - Copy environment variables to .env
 *
 * 3. Replace implementation:
 *
 * ```typescript
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 *
 * const redis = Redis.fromEnv();
 *
 * const ratelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(10, '1 m'),
 *   analytics: true,
 * });
 *
 * export async function checkRateLimit(request: NextRequest) {
 *   const identifier = getClientIdentifier(request);
 *   const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
 *
 *   if (!success) {
 *     return {
 *       success: false,
 *       error: createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests'),
 *       status: HttpStatus.TOO_MANY_REQUESTS,
 *     };
 *   }
 *
 *   return { success: true };
 * }
 * ```
 *
 * @see https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
 * @see https://vercel.com/docs/storage/vercel-kv
 */
