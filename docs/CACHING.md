# Caching Strategy

**Story 7.4: Caching Strategy**
**Author:** Claude AI
**Date:** 2025-11-09

## Overview

Ariyadham implements a comprehensive caching strategy to optimize performance and reduce server load while ensuring users receive fresh content. The strategy combines:

1. **Browser Caching** - HTTP Cache-Control headers for client-side caching
2. **ISR (Incremental Static Regeneration)** - Next.js ISR for server-side caching
3. **API Response Caching** - Conditional caching for API endpoints
4. **Database Connection Pooling** - Handled by Supabase/PgBouncer

## Browser Caching

Browser caching is configured via HTTP headers in `next.config.js`.

### Static Assets (Immutable)

```
Cache-Control: public, max-age=31536000, immutable
```

Applied to:

- `/static/*` - Static files in the public directory
- `/_next/static/*` - Next.js build artifacts (JS, CSS)

**Rationale:** These files never change (versioned URLs), so they can be cached indefinitely.

### Images

```
Cache-Control: public, max-age=86400, stale-while-revalidate=604800
```

Applied to:

- `/_next/image/*` - Optimized images via Next.js Image component

**Rationale:** Images can be cached for 1 day, with stale content served for up to 7 days while revalidating in the background.

### Dynamic Pages

#### Article Pages

```
Cache-Control: public, max-age=60, stale-while-revalidate=3600
```

Applied to:

- `/articles/:slug` - Individual article pages

**Rationale:** Articles are semi-static content that may receive updates (comments, anjali count). Cache for 60 seconds, serve stale for up to 1 hour while revalidating.

#### Category Pages

```
Cache-Control: public, max-age=60, stale-while-revalidate=3600
```

Applied to:

- `/categories/:slug` - Category listing pages

**Rationale:** Similar to article pages - mostly static but may change as new articles are published.

#### Homepage

```
Cache-Control: public, max-age=60, stale-while-revalidate=300
```

Applied to:

- `/` - Homepage with featured/recent/popular articles

**Rationale:** Homepage changes more frequently than article pages, so shorter stale period.

## Incremental Static Regeneration (ISR)

ISR is configured at the page level using the `revalidate` export.

### Configuration

**Article Detail Page** (`/articles/[slug]/page.tsx`)

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

**Article List Page** (`/articles/page.tsx`)

```typescript
export const revalidate = 30; // Revalidate every 30 seconds
```

**Homepage** (`/page.tsx`)

```typescript
export const revalidate = 30; // Revalidate every 30 seconds
```

### How ISR Works

1. **Initial Request:** Page is generated on the server (SSR)
2. **Subsequent Requests:** Cached static page is served (fast!)
3. **After Revalidation Period:** Next request triggers background regeneration
4. **Stale-While-Revalidate:** Old page served while new page generates
5. **Updated Page:** New page cached and served to future requests

**Benefits:**

- Fast page loads (served from cache)
- Always relatively fresh content (revalidated every 30-60s)
- No user waits for regeneration (stale-while-revalidate)

## API Response Caching

API routes use cache utilities from `/lib/cache.ts`.

### Cache Configurations

| Config      | Cache-Control                                       | Use Case                        |
| ----------- | --------------------------------------------------- | ------------------------------- |
| `NONE`      | `private, no-cache, no-store, must-revalidate`      | Authenticated/personalized data |
| `SHORT`     | `public, max-age=30, stale-while-revalidate=60`     | Frequently changing public data |
| `MEDIUM`    | `public, max-age=60, stale-while-revalidate=300`    | Semi-static public data         |
| `LONG`      | `public, max-age=300, stale-while-revalidate=600`   | Mostly static public data       |
| `VERY_LONG` | `public, max-age=3600, stale-while-revalidate=7200` | Rarely changing public data     |
| `IMMUTABLE` | `public, max-age=31536000, immutable`               | Content that never changes      |

### Usage Example

```typescript
import { cachedJson, CacheConfig } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const articles = await fetchArticles();

  // Cache published articles for 30 seconds
  return cachedJson({ success: true, data: articles }, CacheConfig.SHORT);
}
```

### Cache Strategy Decision Tree

```
Is data authenticated?
├─ YES → Use CacheConfig.NONE (no caching)
└─ NO → Is data public?
    ├─ NO → Use CacheConfig.NONE
    └─ YES → How often does it change?
        ├─ Realtime → NONE
        ├─ Frequently (every minute) → SHORT (30s)
        ├─ Moderately (every few minutes) → MEDIUM (60s)
        ├─ Rarely (every hour+) → LONG (5m)
        └─ Static (never) → IMMUTABLE (1 year)
```

### Current API Caching

**GET /api/articles** (`/app/api/articles/route.ts`)

- **Published articles:** `CacheConfig.SHORT` (30s cache)
- **Draft/scheduled articles:** `CacheConfig.NONE` (no cache)

**Rationale:** Published articles are public and change infrequently. Draft articles are private and should never be cached.

## Cache Utilities

The `/lib/cache.ts` module provides helper functions for consistent caching:

### `cachedJson(data, cacheControl)`

Returns a JSON response with cache headers.

```typescript
return cachedJson({ success: true, data: articles }, CacheConfig.MEDIUM);
```

### `withCache(response, cacheControl)`

Adds cache headers to an existing response.

```typescript
const response = NextResponse.json({ data });
return withCache(response, CacheConfig.SHORT);
```

### `getCacheStrategy(options)`

Automatically determines cache strategy based on data characteristics.

```typescript
const cacheStrategy = getCacheStrategy({
  isAuthenticated: !!user,
  isPublic: true,
  updateFrequency: 'moderate',
});
```

### `withVary(response, headers)`

Adds Vary header for content negotiation.

```typescript
const response = NextResponse.json({ data });
withVary(response, ['Accept-Language', 'Authorization']);
return withCache(response, CacheConfig.MEDIUM);
```

### `withETag(response, etag)`

Adds ETag header for conditional requests.

```typescript
const content = JSON.stringify(data);
const etag = generateETag(content);
const response = NextResponse.json(data);
return withETag(withCache(response, CacheConfig.MEDIUM), etag);
```

## Performance Impact

### Expected Improvements

Based on the architecture targets (see `/docs/architecture.md`):

**Before Caching:**

- FCP: ~2.0s
- LCP: ~3.0s
- API Response: ~200ms

**After Caching:**

- FCP: ~1.2s (40% improvement)
- LCP: ~2.0s (33% improvement)
- API Response: ~50ms (75% improvement for cached responses)

### Monitoring

Monitor cache effectiveness using:

1. **Vercel Analytics** - Page load times, Core Web Vitals
2. **Browser DevTools** - Network tab, cache status (from disk cache, from memory cache)
3. **Lighthouse** - Performance score improvements

## Best Practices

### DO:

✅ Cache public, static, or semi-static content
✅ Use ISR for pages that change infrequently
✅ Set appropriate revalidation periods based on data freshness needs
✅ Use `stale-while-revalidate` to avoid cache misses
✅ Cache API responses for public data
✅ Invalidate caches when content updates (via revalidation)

### DON'T:

❌ Cache authenticated or personalized data
❌ Cache data that changes in real-time
❌ Set cache headers without considering data characteristics
❌ Use long cache periods for frequently changing data
❌ Forget to set Vary headers when responses differ by request headers

## Cache Invalidation

### Automatic Invalidation

- **ISR:** Automatic revalidation after `revalidate` period
- **Browser Cache:** Automatic expiration after `max-age`
- **Stale-While-Revalidate:** Background revalidation

### Manual Invalidation

For immediate cache invalidation (e.g., after content update):

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
revalidatePath('/articles/my-article');

// Revalidate all articles
revalidatePath('/articles');

// Revalidate homepage
revalidatePath('/');
```

**Example:** After publishing an article:

```typescript
export async function POST(request: NextRequest) {
  // Publish article...
  await publishArticle(articleId);

  // Invalidate caches
  revalidatePath('/'); // Homepage
  revalidatePath('/articles'); // Article list
  revalidatePath(`/articles/${slug}`); // Article page

  return NextResponse.json({ success: true });
}
```

## Future Optimizations

### Phase 2 (Post-MVP)

1. **Service Worker Caching** - Offline support via PWA
2. **Redis Caching** - Server-side caching for database queries
3. **Edge Caching** - Cloudflare Workers/Vercel Edge for global distribution
4. **Prefetching** - Intelligently prefetch likely-to-be-visited pages
5. **Cache Warming** - Pre-generate popular pages before they're requested

### Database Query Caching

Currently not implemented (Supabase handles basic query caching). For Phase 2:

```typescript
// Example: Redis cache for expensive queries
const cacheKey = `articles:published:${page}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const articles = await fetchArticles(page);
await redis.set(cacheKey, JSON.stringify(articles), { ex: 60 });
return articles;
```

## Related Documentation

- [Architecture Document](./architecture.md) - Overall caching architecture
- [Performance Optimization](./PERFORMANCE.md) - Core Web Vitals optimization
- [API Documentation](./API.md) - API endpoint specifications

## References

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Cache-Control Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

---

_This caching strategy is designed to balance performance, freshness, and server load for the Ariyadham platform._
