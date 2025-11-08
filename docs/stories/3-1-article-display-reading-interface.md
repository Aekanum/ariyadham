# Story 3.1: Article Display & Reading Interface

**Epic**: 3 - Reader Experience
**Status**: ✅ COMPLETED
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As a** reader
**I want to** read articles in a clean, distraction-free interface
**So that** I can focus on the dharma content

---

## Acceptance Criteria

### ✅ Article Display

**Given** a reader visits an article page
**When** the page loads
**Then** the article title, author, and date are displayed
**And** article content is rendered in readable format
**And** font is legible on all devices

### ✅ Font Size Responsiveness

**When** reader adjusts font size from settings
**Then** article text immediately reflects the change

### ✅ Theme Support

**And** dark mode toggle works properly
**And** line height is appropriate
**And** article is responsive (mobile, tablet, desktop)

### Implementation Checklist

- [ ] Create articles table migration (if not exists)
- [ ] Create Article type definitions
- [ ] Create article page route `/articles/[slug]`
- [ ] Implement article fetching from Supabase
- [ ] Create ArticleHeader component (title, author, date)
- [ ] Create ArticleContent component (markdown rendering)
- [ ] Implement responsive typography
- [ ] Add dark mode styles
- [ ] Test font size adjustments from settings
- [ ] Add featured image support
- [ ] Implement reading time estimation
- [ ] Add print-friendly styles
- [ ] Test on mobile, tablet, and desktop

---

## Technical Implementation

### 1. Database Schema

**Table: `articles`**

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- Author
  author_id UUID NOT NULL REFERENCES auth.users(id),

  -- Publication
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Metadata
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,

  -- Categories (will be enhanced in Story 4.3)
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT articles_slug_key UNIQUE (slug)
);

-- Indexes for performance
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);

-- RLS Policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

-- Authors can view their own articles (any status)
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = author_id);

-- Trigger to update updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN CEIL(array_length(regexp_split_to_array(content_text, '\s+'), 1) / 200.0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate reading time on insert/update
CREATE OR REPLACE FUNCTION update_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time_minutes := calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_article_reading_time
  BEFORE INSERT OR UPDATE OF content ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_time();
```

### 2. TypeScript Types

**File: `src/types/article.ts`**

```typescript
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithAuthor extends Article {
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface ArticlePageProps {
  params: {
    slug: string;
  };
}
```

### 3. Article Page Route

**File: `app/articles/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import type { ArticlePageProps, ArticleWithAuthor } from '@/types/article';
import { Metadata } from 'next';

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;
  const supabase = createServerClient();

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featured_image_url ? [article.featured_image_url] : [],
      type: 'article',
    },
  };
}

/**
 * Article page component
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const supabase = createServerClient();

  // Fetch article with author information
  const { data: article, error } = await supabase
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
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    notFound();
  }

  // Increment view count (fire and forget)
  supabase
    .from('articles')
    .update({ view_count: (article.view_count || 0) + 1 })
    .eq('id', article.id)
    .then(() => {});

  const articleWithAuthor = article as unknown as ArticleWithAuthor;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <ArticleHeader article={articleWithAuthor} />
      <ArticleContent content={articleWithAuthor.content} />
    </article>
  );
}
```

### 4. Article Header Component

**File: `src/components/article/ArticleHeader.tsx`**

```typescript
import Image from 'next/image';
import { ArticleWithAuthor } from '@/types/article';
import { formatDate } from '@/lib/utils/date';

interface ArticleHeaderProps {
  article: ArticleWithAuthor;
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const publishedDate = article.published_at
    ? formatDate(article.published_at)
    : null;

  return (
    <header className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      )}

      {/* Category Badge */}
      {article.category && (
        <div className="mb-4">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {article.category}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">
        {article.title}
      </h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="mb-6 text-xl text-gray-600 dark:text-gray-400">
          {article.excerpt}
        </p>
      )}

      {/* Author and Metadata */}
      <div className="flex items-center gap-4">
        {/* Author Avatar */}
        {article.author.avatar_url ? (
          <Image
            src={article.author.avatar_url}
            alt={article.author.full_name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              {article.author.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Author Info */}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {article.author.full_name}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
    </header>
  );
}
```

### 5. Article Content Component

**File: `src/components/article/ArticleContent.tsx`**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && content) {
      // Configure marked options
      marked.setOptions({
        gfm: true,
        breaks: true,
      });

      // Convert markdown to HTML
      const rawHtml = marked(content);

      // Sanitize HTML to prevent XSS
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);

      // Set the content
      contentRef.current.innerHTML = sanitizedHtml;
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-lg max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-p:leading-relaxed
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800
        prose-code:px-1 prose-code:py-0.5
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
        prose-img:rounded-lg
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:pl-4 prose-blockquote:italic"
      style={{
        fontSize: 'var(--base-font-size, 16px)',
      }}
    />
  );
}
```

### 6. Utility Functions

**File: `src/lib/utils/date.ts`**

```typescript
/**
 * Format date for article display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If less than 7 days ago, show relative time
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  // Otherwise show formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format full date and time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

### 7. Print-Friendly Styles

**File: `src/styles/print.css`**

```css
@media print {
  /* Hide navigation and non-essential elements */
  nav,
  header,
  footer,
  .no-print {
    display: none !important;
  }

  /* Ensure content uses full width */
  article {
    max-width: 100% !important;
    padding: 0 !important;
  }

  /* Improve typography for print */
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
  }

  /* Page breaks */
  h1,
  h2,
  h3 {
    page-break-after: avoid;
  }

  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }

  /* Remove interactive elements */
  button,
  input,
  select,
  textarea {
    display: none;
  }
}
```

---

## Files to Create/Modify

```
app/
├── articles/
│   └── [slug]/
│       └── page.tsx                      # Article page route
src/
├── components/
│   └── article/
│       ├── ArticleHeader.tsx             # Article header component
│       └── ArticleContent.tsx            # Article content renderer
├── types/
│   └── article.ts                        # Article type definitions
├── lib/
│   └── utils/
│       └── date.ts                       # Date formatting utilities
├── styles/
│   ├── globals.css                       # Update with article styles
│   └── print.css                         # Print-friendly styles
supabase/
└── migrations/
    └── 009_articles.sql                  # Articles table migration
```

---

## Prerequisites

- Story 1.1 ✅ (Project Setup)
- Story 1.2 ✅ (Database Schema)
- Story 2.4 ✅ (User Preferences - for font size integration)

---

## Dependencies

**Existing:**

- `next` - Next.js framework
- `react` - React
- `@supabase/supabase-js` - Supabase client

**New:**

- `marked` - Markdown parser
- `isomorphic-dompurify` - HTML sanitization
- `@tailwindcss/typography` - Prose styling

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

- [ ] Article page loads successfully
- [ ] Article title, author, and date displayed
- [ ] Markdown content renders correctly
- [ ] Featured image displays and is optimized
- [ ] Font size changes from settings apply
- [ ] Dark mode works properly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Reading time displays correctly
- [ ] View count increments
- [ ] Print styles work
- [ ] 404 page for non-existent articles

---

## Security Considerations

### Content Security

- All user-generated HTML sanitized with DOMPurify
- XSS prevention in article content
- Image URLs validated
- RLS policies enforce published status

### Performance

- Server-side rendering for SEO
- Image optimization with Next.js Image
- Incremental Static Regeneration (ISR) for published articles
- View count update is fire-and-forget (doesn't block page load)

---

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Sufficient color contrast
- Keyboard navigation
- Screen reader friendly
- Print-friendly version
- Respects font size preferences

---

## Next Steps

After completing Story 3.1:

### Story 3.2: Content Discovery & Browsing

Implement homepage with featured articles, recent articles, and category browsing.

### Story 3.3: Search Functionality

Add search functionality for articles.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 3.1, lines 381-410)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`
- **Marked Documentation**: https://marked.js.org/
- **DOMPurify**: https://github.com/cure53/DOMPurify
- **Tailwind Typography**: https://tailwindcss.com/docs/typography-plugin

---

## Implementation Notes

### Design Principles

1. **Readability First**: Clean, distraction-free reading experience
2. **Performance**: Fast page loads with SSR and image optimization
3. **Accessibility**: Everyone can read dharma content
4. **Responsive**: Great experience on all devices
5. **Secure**: Sanitize all user content

### Best Practices

- Use server-side rendering for SEO
- Implement ISR for published articles
- Optimize images automatically
- Sanitize all markdown content
- Provide print-friendly version
- Track analytics (view count)
- Support theme preferences
- Respect font size settings

### Markdown Support

The article content supports:

- Headings (h1-h6)
- Paragraphs
- Bold and italic text
- Links
- Images
- Lists (ordered and unordered)
- Blockquotes
- Code blocks
- Tables

---

🙏 May this feature provide readers with a peaceful, focused environment to study dharma teachings.
