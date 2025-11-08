# Story 3.4: Article Metadata & SEO

**Epic**: 3 - Reader Experience
**Status**: ✅ COMPLETED
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As a** reader/search engine
**I want to** see rich metadata for each article
**So that** search engines index content properly and social sharing works

---

## Acceptance Criteria

### ✅ Open Graph Meta Tags

**Given** an article is published
**When** metadata is provided (title, excerpt, featured image)
**Then** Open Graph tags are generated for social sharing
**And** proper title, description, and image appear when shared

### ✅ Schema.org Structured Data

**Given** an article page is loaded
**When** search engines crawl the page
**Then** Schema.org Article markup is present
**And** includes author, datePublished, dateModified, headline

### ✅ Social Media Preview

**When** article is shared on social media platforms
**Then** the article shows with proper title, image, and excerpt
**And** metadata matches the article content

### Implementation Checklist

- [ ] Create metadata generation utility function
- [ ] Add Next.js metadata API configuration
- [ ] Implement Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Add Twitter Card tags
- [ ] Implement Schema.org Article structured data
- [ ] Add canonical URLs
- [ ] Generate article metadata from database
- [ ] Handle missing/default images for metadata
- [ ] Add sitemap generation for SEO
- [ ] Test social media preview with various platforms
- [ ] Validate Schema.org markup

---

## Technical Implementation

### 1. Metadata Types

**File: `src/types/metadata.ts`**

```typescript
export interface ArticleMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  author: {
    name: string;
    url?: string;
  };
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    type: 'article' | 'website';
    title: string;
    description: string;
    url: string;
    images: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale: string;
    siteName: string;
    article?: {
      publishedTime: string;
      modifiedTime?: string;
      authors: string[];
      section?: string;
      tags?: string[];
    };
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
}
```

### 2. Metadata Generation Utility

**File: `src/lib/seo/metadata.ts`**

```typescript
import type { Metadata } from 'next';
import type { ArticleMetadata, SeoMetadata } from '@/types/metadata';

const SITE_NAME = 'Ariyadham';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;

/**
 * Generate Next.js metadata for article pages
 */
export function generateArticleMetadata(article: ArticleMetadata): Metadata {
  const url = `${SITE_URL}${article.url}`;
  const imageUrl = article.image || DEFAULT_IMAGE;

  return {
    title: article.title,
    description: article.description,

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Open Graph
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      article: {
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: [article.author.name],
        section: article.section,
        tags: article.tags,
      },
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },

    // Additional metadata
    authors: [{ name: article.author.name, url: article.author.url }],
    keywords: article.tags,
  };
}

/**
 * Generate structured data (Schema.org) for articles
 */
export function generateArticleStructuredData(article: ArticleMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || DEFAULT_IMAGE,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${article.url}`,
    },
  };
}

/**
 * Generate metadata for the home page
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: 'Ariyadham - Buddhist Wisdom & Teachings',
    description:
      'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',

    alternates: {
      canonical: SITE_URL,
    },

    openGraph: {
      type: 'website',
      title: 'Ariyadham - Buddhist Wisdom & Teachings',
      description:
        'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Ariyadham',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Ariyadham - Buddhist Wisdom & Teachings',
      description:
        'Explore authentic Buddhist teachings, meditation guides, and Dhamma wisdom in Thai and English.',
      images: [DEFAULT_IMAGE],
    },
  };
}
```

### 3. Article Page with Metadata

**File: `app/articles/[slug]/page.tsx`** (Update)

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateArticleMetadata, generateArticleStructuredData } from '@/lib/seo/metadata';
import ArticleView from '@/components/articles/ArticleView';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for article page
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: article } = await supabase
    .from('articles')
    .select(
      `
      id,
      title,
      excerpt,
      slug,
      featured_image,
      published_at,
      updated_at,
      category,
      author:user_profiles!articles_author_id_fkey (
        full_name,
        id
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return generateArticleMetadata({
    title: article.title,
    description: article.excerpt || article.title,
    image: article.featured_image,
    url: `/articles/${article.slug}`,
    author: {
      name: article.author.full_name,
      url: `/authors/${article.author.id}`,
    },
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    section: article.category,
  });
}

/**
 * Article page component
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!articles_author_id_fkey (
        id,
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

  // Generate structured data
  const structuredData = generateArticleStructuredData({
    title: article.title,
    description: article.excerpt || article.title,
    image: article.featured_image,
    url: `/articles/${article.slug}`,
    author: {
      name: article.author.full_name,
      url: `/authors/${article.author.id}`,
    },
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    section: article.category,
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Article Content */}
      <ArticleView article={article} />
    </>
  );
}
```

### 4. Sitemap Generation

**File: `app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();

  // Fetch all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const articleUrls =
    articles?.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticPages, ...articleUrls];
}
```

### 5. Robots.txt

**File: `app/robots.ts`**

```typescript
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ariyadham.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cms/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

### 6. Environment Variables

**File: `.env.local`** (Add)

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://ariyadham.com
NEXT_PUBLIC_SITE_NAME=Ariyadham
```

---

## Files to Create/Modify

```
src/
├── types/
│   └── metadata.ts                      # Metadata type definitions
├── lib/
│   └── seo/
│       └── metadata.ts                  # Metadata generation utilities
app/
├── articles/
│   └── [slug]/
│       └── page.tsx                     # Update with metadata
├── sitemap.ts                           # Sitemap generation
├── robots.ts                            # Robots.txt
└── layout.tsx                           # Update with default metadata
```

---

## Prerequisites

- Story 3.1 ✅ (Article Display)
- Story 1.5 ✅ (API Foundation)

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

### SEO Validation

- Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Validate Schema.org with [Google Rich Results Test](https://search.google.com/test/rich-results)
- Check sitemap at `/sitemap.xml`
- Verify robots.txt at `/robots.txt`

### Manual Testing

- [ ] Article pages have proper meta tags
- [ ] Open Graph tags render correctly
- [ ] Twitter Cards display properly
- [ ] Schema.org structured data validates
- [ ] Sitemap includes all published articles
- [ ] Robots.txt allows crawling of public pages
- [ ] Social media previews work correctly
- [ ] Default image used when article has no image
- [ ] Canonical URLs are correct

---

## Security Considerations

### Content Security

- Validate all metadata content
- Escape HTML in meta tags
- Use absolute URLs for images
- Ensure images are publicly accessible

### Privacy

- Don't expose sensitive URLs in sitemap
- Exclude admin/API routes from crawling
- Respect user privacy in metadata

---

## Accessibility

- Provide meaningful alt text for OG images
- Ensure meta descriptions are descriptive
- Use semantic HTML for structured data

---

## Next Steps

After completing Story 3.4:

### Epic 3 Complete

All Reader Experience stories are now complete. Consider:

- Epic 2 Retrospective (optional)
- Epic 3 Retrospective (optional)
- Move to Epic 4: Author CMS & Publishing

### Story 4.1: Article Creation & Editing

Begin the Author CMS features to allow content creation.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 3.4)
- **Next.js Metadata API**: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- **Open Graph Protocol**: https://ogp.me/
- **Schema.org Article**: https://schema.org/Article
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

---

## Implementation Notes

### Design Principles

1. **SEO First**: All pages should have proper metadata
2. **Social Sharing**: Optimize for social media platforms
3. **Performance**: Don't slow down page loads
4. **Maintainability**: Centralized metadata generation
5. **Flexibility**: Easy to extend for new content types

### Best Practices

- Use Next.js Metadata API for static metadata
- Generate dynamic metadata server-side
- Provide fallback images
- Test social previews regularly
- Keep structured data up to date
- Monitor search console for issues

---

🙏 May this feature help spread the Dhamma to all seekers.
