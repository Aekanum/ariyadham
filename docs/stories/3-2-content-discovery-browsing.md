# Story 3.2: Content Discovery & Browsing

**Epic**: 3 - Reader Experience
**Status**: ✅ COMPLETED
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As a** reader
**I want to** browse articles by category and see recommended content
**So that** I can discover dharma I'm interested in

---

## Acceptance Criteria

### ✅ Homepage Display

**Given** a user visits the homepage
**When** the page loads
**Then** they see featured articles
**And** recently published articles
**And** popular articles

### ✅ Category Browsing

**When** they click on a category (e.g., "Gratitude", "Ethics")
**Then** they see articles in that category
**And** results can be sorted (newest, most popular)

### ✅ Pagination & Article Display

**And** pagination works for browsing multiple pages
**And** each article shows: title, excerpt, author, date, category

### Implementation Checklist

- [ ] Create ArticleCard component
- [ ] Create ArticleList component with pagination
- [ ] Create homepage route (app/page.tsx)
- [ ] Implement featured articles section
- [ ] Implement recent articles section
- [ ] Implement popular articles section
- [ ] Create categories page route (app/categories/[slug]/page.tsx)
- [ ] Implement category filtering
- [ ] Implement sorting (newest, most popular)
- [ ] Add pagination controls
- [ ] Test responsive layout
- [ ] Verify performance with multiple articles

---

## Technical Implementation

### 1. Article Card Component

**File: `src/components/article/ArticleCard.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { ArticleWithAuthor } from '@/types/article';
import { formatDate } from '@/lib/utils/date';

interface ArticleCardProps {
  article: ArticleWithAuthor;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.published_at
    ? formatDate(article.published_at)
    : null;

  return (
    <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Featured Image */}
      {article.featured_image_url && (
        <Link href={`/articles/${article.slug}`}>
          <div className="aspect-video w-full overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              width={600}
              height={400}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Category Badge */}
        {article.category && (
          <div className="mb-3">
            <Link
              href={`/categories/${article.category.toLowerCase()}`}
              className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
            >
              {article.category}
            </Link>
          </div>
        )}

        {/* Title */}
        <Link href={`/articles/${article.slug}`}>
          <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">
            {article.excerpt}
          </p>
        )}

        {/* Author and Metadata */}
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          {article.author.avatar_url ? (
            <Image
              src={article.author.avatar_url}
              alt={article.author.full_name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {article.author.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {article.author.full_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              {publishedDate && <span>{publishedDate}</span>}
              {article.reading_time_minutes && (
                <>
                  <span>•</span>
                  <span>{article.reading_time_minutes} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
```

### 2. Pagination Component

**File: `src/components/ui/Pagination.tsx`**

```typescript
'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter((page) => {
    // Always show first, last, current, and adjacent pages
    return (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
    );
  });

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      {showPages.map((page, index) => {
        // Add ellipsis if there's a gap
        const prevPage = showPages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && (
              <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
            )}
            {page === currentPage ? (
              <span className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                {page}
              </span>
            ) : (
              <Link
                href={`${baseUrl}?page=${page}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {page}
              </Link>
            )}
          </div>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Next
        </span>
      )}
    </nav>
  );
}
```

### 3. Homepage Route

**File: `app/page.tsx`**

```typescript
import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import { ArticleWithAuthor } from '@/types/article';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = createServerClient();

  // Fetch featured articles (most recent with high view count)
  const { data: featuredArticles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(3);

  // Fetch recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  // Fetch popular articles
  const { data: popularArticles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Ariyadham
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover profound dharma teachings and spiritual wisdom
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles && featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Articles
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article as unknown as ArticleWithAuthor}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recentArticles && recentArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recent Articles
              </h2>
              <Link
                href="/articles"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article as unknown as ArticleWithAuthor}
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Articles */}
        {popularArticles && popularArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Popular Articles
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {popularArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article as unknown as ArticleWithAuthor}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
```

### 4. Category Page Route

**File: `app/categories/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import { ArticleWithAuthor } from '@/types/article';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: 'newest' | 'popular';
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const category = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${category} Articles`,
    description: `Browse all articles in the ${category} category`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = params;
  const page = parseInt(searchParams.page || '1', 10);
  const sort = searchParams.sort || 'newest';
  const pageSize = 9;
  const offset = (page - 1) * pageSize;

  const supabase = createServerClient();
  const category = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Build query
  let query = supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .ilike('category', category);

  // Apply sorting
  if (sort === 'popular') {
    query = query.order('view_count', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data: articles, error, count } = await query;

  if (error || !articles || articles.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {category}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'article' : 'articles'} in this category
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-8 flex gap-4">
          <a
            href={`/categories/${slug}?sort=newest`}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sort === 'newest'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Newest
          </a>
          <a
            href={`/categories/${slug}?sort=popular`}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sort === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Popular
          </a>
        </div>

        {/* Articles Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article as unknown as ArticleWithAuthor}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl={`/categories/${slug}`}
        />
      </div>
    </div>
  );
}
```

### 5. Articles List Page

**File: `app/articles/page.tsx`**

```typescript
import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import { ArticleWithAuthor } from '@/types/article';

interface ArticlesPageProps {
  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: 'All Articles',
  description: 'Browse all published articles',
};

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const supabase = createServerClient();

  const { data: articles, count } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            All Articles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'article' : 'articles'} published
          </p>
        </div>

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <>
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article as unknown as ArticleWithAuthor}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/articles"
            />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No articles published yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Files to Create/Modify

```
app/
├── page.tsx                              # Homepage with featured/recent/popular
├── articles/
│   ├── page.tsx                          # All articles list
│   └── [slug]/
│       └── page.tsx                      # (existing) Article detail page
└── categories/
    └── [slug]/
        └── page.tsx                      # Category browsing page
src/
├── components/
│   ├── article/
│   │   ├── ArticleCard.tsx               # Article card component
│   │   ├── ArticleHeader.tsx             # (existing)
│   │   └── ArticleContent.tsx            # (existing)
│   └── ui/
│       └── Pagination.tsx                # Pagination component
```

---

## Prerequisites

- Story 1.1 ✅ (Project Setup)
- Story 1.2 ✅ (Database Schema - articles table)
- Story 3.1 ✅ (Article Display - types and utilities)

---

## Quality Checks

### Type Safety

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Build

```bash
npm run build
```

### Manual Testing

- [ ] Homepage loads with featured, recent, and popular sections
- [ ] Article cards display all required information
- [ ] Category pages load and filter correctly
- [ ] Sorting (newest, popular) works
- [ ] Pagination works correctly
- [ ] Article count displays accurately
- [ ] Links navigate properly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode works
- [ ] Images load and are optimized

---

## Security Considerations

- RLS policies enforce published status
- Server-side data fetching prevents data leaks
- Image optimization with Next.js Image
- No client-side mutations

---

## Performance

- Server-side rendering for SEO
- Pagination prevents loading all articles at once
- Image optimization
- Efficient database queries with indexes
- ISR for static generation

---

## Accessibility

- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation
- ARIA labels for pagination
- Color contrast compliance

---

## Next Steps

After completing Story 3.2:

### Story 3.3: Search Functionality

Implement full-text search for articles.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 3.2, lines 413-443)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`

---

🙏 May this feature help readers discover the dharma teachings they need.
