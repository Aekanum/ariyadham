# Ariyadham - Architecture Decision Document

**Author:** Aekanum
**Date:** 2025-11-07
**Project Level:** Greenfield Web Application
**Target Scale:** 1,000+ users/month (MVP), scaling to 10k+

---

## Executive Summary

Ariyadham is a greenfield web application designed to democratize access to Buddhist dharma through a modern, accessible platform. The architecture employs a **Next.js-based full-stack approach** with **Supabase** as the backend-as-a-service provider, enabling rapid MVP development while maintaining production-grade scalability.

The architecture prioritizes:

- **Accessibility First** - WCAG 2.1 AA compliance from foundation
- **Developer Experience** - Modern tooling and clear patterns for autonomous agent implementation
- **Performance** - Core Web Vitals targets (FCP < 1.5s, LCP < 2.5s)
- **Internationalization** - Thai/English support built-in
- **Security** - Supabase RLS, JWT auth, data protection

---

## Project Initialization

### Starter Template Selected: Create Next.js App

**Initialization Command:**

```bash
npx create-next-app@latest ariyadham \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias '@/*' \
  --no-git \
  --use-npm
```

**Rationale:**

- Next.js 14+ provides best-in-class React framework with server-side rendering, static optimization, and API routes
- Vercel deployment integration for seamless CI/CD
- Built-in Image Optimization and Font Optimization for Core Web Vitals
- App Router with native TypeScript support
- Tailwind CSS for rapid, responsive UI development
- Native ESLint configuration

**Starter-Provided Architectural Decisions:**

- ✅ TypeScript for type safety
- ✅ ESLint/Prettier for code quality
- ✅ Tailwind CSS for styling
- ✅ Next.js App Router with file-based routing
- ✅ Build system and development server

---

## Decision Summary

| Category                 | Decision                                      | Version   | Affects Epics     | Rationale                                                      |
| ------------------------ | --------------------------------------------- | --------- | ----------------- | -------------------------------------------------------------- |
| **Frontend Framework**   | Next.js                                       | 14.0+ LTS | All               | Best React meta-framework; SSR for SEO; built-in optimization  |
| **UI Library**           | React                                         | 18.2+     | All               | Industry standard; rich ecosystem; excellent tooling           |
| **Styling**              | Tailwind CSS                                  | 3.3+      | All, esp. 3, 8    | Rapid development; responsive design; accessibility tokens     |
| **Hosting/Deployment**   | Vercel                                        | -         | All               | Native Next.js support; auto-scaling; environment management   |
| **Backend/Database**     | Supabase (PostgreSQL)                         | Latest    | All, esp. 1, 2, 4 | Managed PostgreSQL; real-time; RLS; auth; storage              |
| **Authentication**       | Supabase Auth + JWT                           | -         | 2, 3, 4, 6        | Secure; scalable; supports OAuth (Google, Facebook)            |
| **State Management**     | React Context + Zustand                       | -         | All               | Context for global UI state; Zustand for complex app state     |
| **API Routes**           | Next.js API Routes                            | -         | All, esp. 4, 6    | Serverless functions; no separate backend needed               |
| **Real-time Features**   | Supabase Realtime                             | -         | 4, 5              | WebSocket-based; minimal latency; built into Supabase          |
| **Image Optimization**   | Next.js Image + Cloudflare CDN                | -         | 3, 4, 7           | Automatic responsive images; WebP; CDN delivery                |
| **SEO**                  | Next.js Meta + Schema                         | -         | 3, 4, 7           | Server-side rendering; meta tags; structured data              |
| **Internationalization** | next-i18next                                  | 13.0+     | 8                 | Standard i18n for Next.js; file-based translations             |
| **Testing**              | Vitest + React Testing Library                | -         | All               | Fast unit tests; E2E with Playwright                           |
| **Build & Deploy**       | GitHub Actions + Vercel                       | -         | All               | Automated testing; built-in deploy previews                    |
| **Monitoring/Errors**    | Sentry                                        | -         | All               | Error tracking; performance monitoring                         |
| **Search**               | PostgreSQL Full-Text + Meilisearch (optional) | -         | 3                 | PostgreSQL native FTS for MVP; Meilisearch for advanced search |

---

## Project Structure

```
ariyadham/
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── deploy.yml
│       └── preview.yml
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (reader)/
│   │   │   ├── page.tsx (homepage)
│   │   │   ├── articles/
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── categories/
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── bookmarks/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── (author)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── articles/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── analytics/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── content/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── refresh/route.ts
│   │   │   ├── articles/
│   │   │   │   ├── route.ts (GET list, POST create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts (GET, PATCH, DELETE)
│   │   │   │   ├── [id]/publish/route.ts
│   │   │   │   ├── [id]/comments/route.ts
│   │   │   │   └── [id]/anjali/route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts (GET current user)
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── [id]/profile/route.ts
│   │   │   ├── authors/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── bookmarks/
│   │   │   │   └── route.ts
│   │   │   ├── admin/
│   │   │   │   ├── users/route.ts
│   │   │   │   ├── content/route.ts
│   │   │   │   ├── analytics/route.ts
│   │   │   │   └── featured/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx (root layout)
│   │   └── error.tsx (global error boundary)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── reader/
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleReader.tsx
│   │   │   ├── AnjaliButton.tsx
│   │   │   ├── BookmarkButton.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── CommentCard.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── author/
│   │   │   ├── RichEditor.tsx
│   │   │   ├── ArticleForm.tsx
│   │   │   ├── SchedulePublish.tsx
│   │   │   ├── AuthorDashboard.tsx
│   │   │   └── ArticleStats.tsx
│   │   ├── admin/
│   │   │   ├── UserTable.tsx
│   │   │   ├── ContentModerationQueue.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── FeaturedContentManager.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Pagination.tsx
│   │   └── icons/ (icon components)
│   ├── lib/
│   │   ├── utils.ts (helper functions)
│   │   ├── types.ts (shared TypeScript types)
│   │   ├── constants.ts (app constants, error codes, routes)
│   │   ├── supabase.ts (Supabase client initialization)
│   │   ├── auth.ts (auth utilities)
│   │   ├── api.ts (API client helpers)
│   │   └── validators.ts (input validation schemas)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useArticles.ts
│   │   ├── useBookmarks.ts
│   │   ├── useComments.ts
│   │   ├── usePagination.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useTheme.ts
│   │   └── useLanguage.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── store/
│   │   ├── authStore.ts (Zustand store for auth)
│   │   ├── uiStore.ts (UI state)
│   │   └── articleStore.ts (article cache)
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css (CSS custom properties)
│   │   └── accessibility.css
│   └── middleware.ts (auth middleware, i18n)
├── public/
│   ├── locales/
│   │   ├── th/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── reader.json
│   │   │   ├── author.json
│   │   │   └── admin.json
│   │   └── en/
│   │       └── (same structure)
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   ├── utils/
│   │   └── hooks/
│   ├── integration/
│   │   ├── api/
│   │   └── components/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── reader.spec.ts
│       ├── author.spec.ts
│       └── admin.spec.ts
├── docs/
│   ├── API.md (API endpoints)
│   ├── SCHEMA.md (database schema)
│   ├── PATTERNS.md (design patterns)
│   └── DEPLOYMENT.md
├── .env.example
├── .env.local (local secrets, not in git)
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js (or vitest config)
├── package.json
├── package-lock.json
└── README.md
```

---

## Epic to Architecture Mapping

| Epic                        | Focus                           | Architecture Components                                      | Key Routes                                               | Key API Endpoints                                          |
| --------------------------- | ------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------- |
| **1: Foundation**           | Setup & Infrastructure          | Project structure, build system, deployment, auth foundation | -                                                        | `/api/health`                                              |
| **2: Authentication**       | User accounts & roles           | Supabase Auth, AuthContext, useAuth hook, Protected routes   | `/login`, `/signup`, `/profile`, `/settings`             | `/api/auth/*`, `/api/users/*`                              |
| **3: Reader Experience**    | Content discovery & reading     | ArticleReader, AnjaliButton, BookmarkButton, ShareButton     | `/`, `/articles/[slug]`, `/categories/[slug]`, `/search` | `/api/articles/*`, `/api/search`                           |
| **4: Author CMS**           | Content creation & publishing   | RichEditor, ArticleForm, AuthorDashboard, SchedulePublish    | `/dashboard`, `/articles/new`, `/articles/[id]/edit`     | `/api/articles/*`, `/api/articles/[id]/publish`            |
| **5: Community**            | Comments & engagement           | CommentSection, AnjaliButton, ShareButton                    | `/articles/[slug]#comments`                              | `/api/articles/[id]/comments`, `/api/articles/[id]/anjali` |
| **6: Admin & Moderation**   | Platform management             | UserTable, ContentModerationQueue, AnalyticsDashboard        | `/admin/*`                                               | `/api/admin/*`                                             |
| **7: Performance & SEO**    | Optimization & visibility       | Next.js Image, Meta tags, Schema, Caching strategies         | All pages                                                | JSON-LD endpoints for search engines                       |
| **8: i18n & Accessibility** | Localization & inclusive design | next-i18next, LanguageContext, WCAG components               | All with `/[lang]/` prefix                               | `/api/locales/*`                                           |

---

## Technology Stack Details

### Core Framework Stack

**Next.js 14+ (App Router)**

- Server-side rendering for SEO
- Static generation for performance
- API routes for backend functionality
- Built-in image optimization
- Automatic code splitting

**React 18.2+**

- Server and client components
- Streaming for faster responses
- Built-in Suspense boundaries

**TypeScript 5.0+**

- Full type safety
- Better IDE support
- Refactoring confidence

### UI & Styling

**Tailwind CSS 3.3+**

- Utility-first responsive design
- Dark mode support via dark: prefix
- Accessibility color tokens
- Custom theme configuration
- No CSS-in-JS overhead

**Headless UI Components** (optional)

- Accessible form components
- Modal/dropdown patterns
- Dialog and disclosure components

### State Management

**React Context API**

- Global UI state (theme, language, user)
- Auth state (current user, permissions)
- Minimal bundle impact

**Zustand** (if complex state emerges)

- Simple store pattern
- Minimal boilerplate
- DevTools integration

**Client-Side Caching**

- Next.js ISR for articles
- Service Worker for offline capability (Phase 2)
- Browser localStorage for user preferences

### Backend & Database

**Supabase**

- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Authentication (email/password, OAuth)
- File storage (for article images, avatars)
- Edge Functions (optional, for custom logic)

**PostgreSQL 15+**

- JSONB for flexible data
- Full-text search (native)
- Row-level security policies
- Triggers for audit trails

### API Design

**Next.js API Routes**

- Serverless functions on Vercel
- TypeScript request/response types
- Middleware for auth
- Error handling patterns

**RESTful Conventions**

- Resource-based URLs (/articles, /users, /comments)
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- Consistent response format

**Response Format**

```typescript
// Success response
{
  success: true,
  data: {...},
  message: "Success message"
}

// Error response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "User-friendly message",
    details: {...}
  }
}
```

### Real-time Features

**Supabase Realtime**

- WebSocket-based updates
- Article view counts
- Comment notifications
- Anjali button animations

### Internationalization

**next-i18next**

- File-based translations
- Namespacing (common, auth, reader, author, admin)
- Dynamic language switching
- Server-side and client-side rendering

### Search

**PostgreSQL Full-Text Search** (MVP)

- Native to Supabase
- Query articles by title, content, author
- Simple but effective

**Meilisearch** (future, Phase 2)

- Dedicated search engine
- Better relevance scoring
- Typo tolerance
- Faceted search

### Deployment & Hosting

**Vercel**

- Auto-scaling Node.js
- Built-in Next.js optimization
- Environment variables
- Preview deployments from pull requests
- Analytics integration

**Supabase Hosting**

- Managed PostgreSQL on AWS
- Auto-backups
- Point-in-time recovery
- Free tier for development

**CDN**

- Vercel Edge Network for static assets
- Cloudflare optional for additional caching

### Monitoring & Error Tracking

**Sentry**

- Error tracking and aggregation
- Performance monitoring
- Release tracking
- Environment separation (dev/staging/prod)

**Google Analytics 4**

- User behavior tracking
- Custom event tracking (anjali, bookmarks, shares)
- Conversion tracking
- Audience segmentation

### Development Tools

**ESLint + Prettier**

- Code quality
- Consistent formatting
- Pre-commit hooks (husky)

**Vitest + React Testing Library**

- Fast unit tests
- Component testing
- Accessibility testing

**Playwright**

- End-to-end testing
- Cross-browser testing
- Visual regression testing

---

## Integration Points

### Frontend ↔ Backend

**API Communication**

- Fetch API or Axios for HTTP requests
- Centralized in `/lib/api.ts`
- Error handling middleware
- Request retry logic

**Real-time Subscriptions**

- Supabase client subscribes to changes
- Updates reflected in React state via Zustand/Context
- Optimistic updates for better UX

**Authentication Flow**

```
Login Form → Supabase Auth → JWT Token → localStorage
Request → API Route → Verify JWT → Supabase RLS → Database
```

### Database ↔ API

**Row Level Security (RLS)**

- Users can only see/modify own profile
- Only authors can edit own articles
- Only admins can moderate content
- Publicly published articles visible to all

**Triggers & Functions**

- Auto-update article view counts
- Update author article counts
- Audit logging for moderation

### External Services

**Supabase OAuth**

- Google & Facebook authentication
- Social login flow
- Profile data mapping

**Email Service** (SendGrid/AWS SES)

- Welcome emails
- Password reset
- Notifications (future)

**Image Optimization**

- Cloudinary API (optional for advanced optimization)
- Vercel Image Optimization (included)

---

## Novel Pattern Designs

### Pattern 1: "Anjali Button" Interaction System

The Anjali button (🙏) is a unique dharma-specific interaction that replaces generic "likes". This requires special architectural consideration.

**Architecture:**

```
AnjaliButton Component
├── Frontend: React component with click handler
├── State: User's anjali status for this article
├── Real-time: Supabase subscription to anjali_reactions
└── Animation: Smooth count update + brief visual feedback

API Endpoint: POST /api/articles/[id]/anjali
├── Auth: Requires logged-in user
├── Logic: Toggle anjali (add if not exists, remove if exists)
├── RLS: User can only manage own anjali reactions
└── Triggers: Update article.anjali_count

Database Schema:
anjali_reactions (
  id, user_id, article_id, created_at
  UNIQUE(user_id, article_id)
)
```

**Data Flow:**

1. User clicks Anjali button
2. Frontend optimistically updates count
3. POST request to `/api/articles/[id]/anjali`
4. Server inserts/deletes reaction
5. Supabase broadcasts change to all subscribers
6. All viewing users see updated count in real-time

**Consistency:**

- Max one anjali per user per article
- Authors cannot anjali their own articles
- Count reflects current state
- Visual feedback on interaction

### Pattern 2: Multi-Language Article Versions

Articles can exist in multiple languages with linked translations.

**Architecture:**

```
Database Schema:
articles (
  id, title, content, slug, language, translated_from_id,
  author_id, created_at, published_at, status
)

// Links Thai and English versions
article_id: 1 → language: 'th'
article_id: 2 → language: 'en', translated_from_id: 1

Frontend Logic:
- Article page: /th/articles/[slug] or /en/articles/[slug]
- Display "Read in [other language]" if translation exists
- hreflang links for SEO
```

**Routing:**

```
Next.js App Router with locale prefix:
src/app/[locale]/(reader)/articles/[slug]/page.tsx

URL Pattern: /th/articles/dharma-basics vs /en/articles/dharma-basics
```

### Pattern 3: Draft → Scheduled → Published State Machine

Authors need to manage article lifecycle across multiple states.

**States:**

```
draft → scheduled → published
   ↓
rejected (with reason)
   ↓
archived
```

**Implementation:**

```typescript
// Database columns
articles {
  status: 'draft' | 'scheduled' | 'published' | 'archived',
  published_at: timestamp,
  scheduled_publish_at: timestamp,
  rejection_reason?: string
}

// Backend job
- Cron job checks scheduled_publish_at
- Transitions articles to 'published' at scheduled time
- Broadcasts notification to author
```

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents and stories.

### Naming Conventions

#### REST API Endpoints

```
Resource naming: PLURAL (users, articles, comments)
GET    /api/articles           → List all articles
GET    /api/articles/[id]      → Get specific article
POST   /api/articles           → Create new article
PATCH  /api/articles/[id]      → Update article
DELETE /api/articles/[id]      → Delete article
POST   /api/articles/[id]/publish  → Special action
```

#### Database Tables & Columns

```
Table naming: snake_case, plural
users, articles, comments, anjali_reactions, reading_history

Column naming: snake_case, descriptive
user_id (not uid, userId, user_ID)
created_at, updated_at (timestamps)
is_published (booleans)
article_count (denormalized counts)
```

#### TypeScript/JavaScript Files

```
Components: PascalCase + .tsx
useHooks: camelCase + .ts
types: camelCase in definitions, PascalCase for exports
constants: UPPER_SNAKE_CASE
API routes: lowercase with brackets for dynamic segments

Example:
- components/reader/ArticleCard.tsx
- hooks/useArticles.ts
- types/article.ts
- lib/constants.ts
- app/api/articles/[id]/route.ts
```

#### React Components

```
Component naming: PascalCase
Props interface: Component name + Props

export interface ArticleCardProps {
  article: Article;
  onAnjali?: () => void;
}

export default function ArticleCard({ article, onAnjali }: ArticleCardProps) {
  ...
}
```

### Code Organization Patterns

#### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import Link from 'next/link';

// 2. Types/Interfaces
interface Props {
  title: string;
  onClick?: () => void;
}

// 3. Component
export default function MyComponent({ title, onClick }: Props) {
  // Hooks first
  const [state, setState] = useState(false);

  // Handlers
  const handleClick = () => {
    setState(!state);
    onClick?.();
  };

  // Render
  return (
    <div onClick={handleClick}>
      {title}
    </div>
  );
}
```

#### API Route Structure

```typescript
// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'ERROR_CODE', message: 'Human message' } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Auth validation
    const { user, error: authError } = await validateAuth(request);
    if (authError) throw authError;

    const body = await request.json();
    const supabase = createClient(user.id);

    // RLS handles authorization
    const { data, error } = await supabase
      .from('articles')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    // ... error handling
  }
}
```

### Error Handling Pattern

```typescript
// Standardized error response
{
  success: false,
  error: {
    code: 'ARTICLE_NOT_FOUND',      // Machine-readable
    message: 'Article not found',    // User-friendly
    details: {                        // Optional extra info
      articleId: '123'
    }
  }
}

// HTTP Status Codes
200 OK - Success
400 Bad Request - Invalid input
401 Unauthorized - Not authenticated
403 Forbidden - Authenticated but not authorized
404 Not Found - Resource doesn't exist
409 Conflict - State conflict (e.g., duplicate)
500 Server Error - Unexpected error
```

### Form Handling Pattern

```typescript
export function ArticleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error.message);
      }

      // Success - redirect or show message
      router.push(`/articles/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Data Fetching Pattern

```typescript
// Client-side fetching with loading states
export function useArticles(page: number) {
  const [data, setData] = useState<Article[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/articles?page=${page}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error.message);

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  return { data, isLoading, error };
}

// Server-side in page.tsx (preferred for performance)
export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### Authentication Pattern

```typescript
// Use custom hook consistently
const { user, isLoading, isLoggedIn } = useAuth();

// Protected routes
export default function AdminPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user?.roles.includes('admin')) return <Unauthorized />;

  return <AdminContent />;
}

// API route protection
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!user.roles.includes('author')) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Proceed with logic
}
```

---

## Consistency Rules

### Styling Consistency

**Tailwind Color Palette**

```css
Primary: Blue (for actions)
Success: Green (for confirmations)
Warning: Amber (for cautions)
Error: Red (for errors)
Neutral: Gray (for UI)

Dark Mode: Use dark: prefix
Responsive: Mobile-first, then md: lg: xl: 2xl:
Accessibility: Use semantic colors, sufficient contrast (WCAG AA)
```

**Spacing Scale**

```css
2, 4, 6, 8, 12, 16, 24, 32, 48, 64 px
Use Tailwind classes: p-2, p-4, gap-4, etc.
Consistent padding/margins across components
```

### Loading & Error States

**Loading State**

```
- Show loading spinner or skeleton
- Disable interactions during loading
- Clear existing error messages
- Use consistent Loading component
```

**Error State**

```
- Display user-friendly error message
- Show retry button if applicable
- Log error to Sentry
- Don't expose technical error details to users
```

**Empty State**

```
- Show helpful empty state illustration
- Provide call-to-action
- Be specific about why it's empty
```

### Date/Time Handling

```typescript
// Always use ISO format in database
// Always use UTC in database, local time for display

import { formatDate } from '@/lib/utils';

// Database: 2025-11-07T15:30:00Z (ISO 8601, UTC)
// Display: "Nov 7, 2025" or "7 พฤศจิกายน 2568"
// Relative: "2 hours ago" via date-fns/dayjs

const displayDate = formatDate(article.created_at, 'long');
```

### Translations & Localization

```typescript
// Always use namespaces
// File: public/locales/th/reader.json

{
  "articles": "บทความ",
  "no_articles_found": "ไม่พบบทความ",
  "read_more": "อ่านต่อ"
}

// Usage in components
import { useTranslation } from 'next-i18next';

export function ArticleList() {
  const { t } = useTranslation('reader');

  return <h2>{t('articles')}</h2>;
}
```

---

## Data Architecture

### Core Data Models

**users**

```sql
id (uuid, primary key)
email (text, unique)
username (text, unique, nullable)
display_name (text)
avatar_url (text, nullable)
bio (text, nullable)
language_preference (text, default: 'th')
role (enum: 'reader', 'author', 'admin')
is_active (boolean)
created_at (timestamp)
updated_at (timestamp)
```

**articles**

```sql
id (uuid, primary key)
title (text)
slug (text, unique per language)
content (text)
excerpt (text)
language (text, enum: 'th', 'en')
translated_from_id (uuid, nullable, foreign key)
author_id (uuid, not null, foreign key)
category_id (uuid, foreign key)
status (enum: 'draft', 'scheduled', 'published', 'archived')
published_at (timestamp, nullable)
scheduled_publish_at (timestamp, nullable)
rejection_reason (text, nullable)
view_count (integer, default: 0)
anjali_count (integer, default: 0, denormalized)
comment_count (integer, default: 0, denormalized)
featured (boolean, default: false)
featured_order (integer, nullable)
created_at (timestamp)
updated_at (timestamp)
```

**comments**

```sql
id (uuid, primary key)
article_id (uuid, not null, foreign key)
user_id (uuid, not null, foreign key)
parent_comment_id (uuid, nullable, foreign key)
content (text)
is_approved (boolean, default: true)
created_at (timestamp)
updated_at (timestamp)
```

**anjali_reactions**

```sql
id (uuid, primary key)
user_id (uuid, not null, foreign key)
article_id (uuid, not null, foreign key)
created_at (timestamp)
UNIQUE(user_id, article_id)
```

**bookmarks**

```sql
id (uuid, primary key)
user_id (uuid, not null, foreign key)
article_id (uuid, not null, foreign key)
created_at (timestamp)
UNIQUE(user_id, article_id)
```

**reading_history**

```sql
id (uuid, primary key)
user_id (uuid, not null, foreign key)
article_id (uuid, not null, foreign key)
read_at (timestamp)
scroll_depth (integer, 0-100, nullable)
time_spent (integer, seconds, nullable)
created_at (timestamp)
```

**categories**

```sql
id (uuid, primary key)
name_th (text)
name_en (text)
slug (text, unique)
description_th (text, nullable)
description_en (text, nullable)
display_order (integer)
```

**article_tags**

```sql
id (uuid, primary key)
article_id (uuid, not null, foreign key)
tag (text)
created_at (timestamp)
```

### Relationships

```
users (1) ──────→ (*) articles (author)
users (1) ──────→ (*) comments
users (1) ──────→ (*) anjali_reactions
users (1) ──────→ (*) bookmarks
users (1) ──────→ (*) reading_history

articles (1) ────→ (*) comments
articles (1) ────→ (*) anjali_reactions
articles (1) ────→ (*) bookmarks
articles (1) ────→ (*) reading_history

categories (1) ──→ (*) articles

articles (self-ref) ──→ translated_from_id (language versions)
comments (self-ref) ──→ parent_comment_id (threading)
```

---

## API Contracts

### Authentication Endpoints

**POST /api/auth/signup**

```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "display_name": "User Name"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name"
  }
}
```

**POST /api/auth/login**

```json
Request:
{
  "email": "user@example.com",
  "password": "password"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { id, email, role, ... },
    "session": { access_token, refresh_token }
  }
}
```

### Article Endpoints

**GET /api/articles**

```
Query params: ?page=1&limit=10&category=ethics&sort=newest
Response: { success: true, data: [articles...], total: 100, pages: 10 }
```

**POST /api/articles**

```json
Request (auth required):
{
  "title": "Article Title",
  "content": "Article content",
  "excerpt": "Short excerpt",
  "category_id": "uuid",
  "tags": ["tag1", "tag2"],
  "language": "th"
}

Response (201):
{
  "success": true,
  "data": { id: "uuid", ... }
}
```

**PATCH /api/articles/[id]**

```
Authorization required (author or admin)
Same request body as POST
Response: 200 with updated article
```

**POST /api/articles/[id]/anjali**

```
Authorization required
Request body: {} (empty)
Response: { success: true, data: { anjali_count: 42 } }
Toggle: removes if already exists, adds if not
```

---

## Security Architecture

### Authentication

**Supabase Auth**

- Email/password with hashed storage
- Email verification (future)
- Password reset via email
- OAuth integration (Google, Facebook)
- JWT tokens with expiration
- Refresh token rotation

**JWT Token Management**

```
Access Token:
- Expires: 1 hour
- Stored: httpOnly cookie (secure transmission)
- Used: API requests in Authorization header

Refresh Token:
- Expires: 7 days
- Stored: httpOnly cookie
- Used: Refresh access token before expiry
```

### Authorization

**Row Level Security (RLS) in Supabase**

```sql
-- Users can view their own profile
CREATE POLICY user_select_own ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY user_update_own ON users
  FOR UPDATE USING (id = auth.uid());

-- Articles visible if published (or user is author/admin)
CREATE POLICY article_select_published ON articles
  FOR SELECT USING (
    status = 'published' OR
    author_id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only authors can update their own articles
CREATE POLICY article_update_own ON articles
  FOR UPDATE USING (author_id = auth.uid());

-- Only admins can delete articles
CREATE POLICY article_delete_admin ON articles
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### Data Protection

**Encryption**

- Passwords: Hashed by Supabase Auth (bcrypt)
- Sensitive data: Encrypted at rest in Supabase
- HTTPS: All communication over TLS

**Secrets Management**

- Environment variables: `.env.local` (never committed)
- Supabase keys: Service role in server-only (API routes)
- Anon key: Client-side (only for public data)

### Input Validation

**Frontend**

- HTML5 validation
- React Hook Form validation
- User-friendly error messages

**Backend (Critical)**

```typescript
import { z } from 'zod';

const CreateArticleSchema = z.object({
  title: z.string().min(5).max(255),
  content: z.string().min(10).max(100000),
  category_id: z.string().uuid(),
  language: z.enum(['th', 'en']),
});

const body = await request.json();
const validated = CreateArticleSchema.parse(body);
```

### CORS & CSRF Protection

**CORS**

- Vercel handles CORS for same-origin requests
- API routes only accept requests from same domain

**CSRF**

- SameSite cookie attribute on JWT
- POST/PATCH/DELETE require valid session
- Next.js built-in CSRF protection

---

## Performance Considerations

### Core Web Vitals Targets

**FCP (First Contentful Paint) < 1.5 seconds**

- Minimize JavaScript
- Inline critical CSS
- Defer non-critical scripts
- Server-side render initial content

**LCP (Largest Contentful Paint) < 2.5 seconds**

- Optimize images (WebP, responsive)
- Preload critical resources
- Lazy load below-the-fold content
- Use next/image component

**CLS (Cumulative Layout Shift) < 0.1**

- Reserve space for images
- Avoid inserting content above existing content
- Use CSS transforms for animations, not layout changes
- Declare image dimensions

### Image Optimization

**Next.js Image Component**

```tsx
import Image from 'next/image';

<Image
  src={article.featuredImage}
  alt="Article featured image"
  width={800}
  height={400}
  responsive
  priority={isAboveTheFold}
/>;
```

**Formats**

- Serve WebP with JPEG fallback
- Responsive srcset for different screen sizes
- CDN delivery via Vercel

### Caching Strategy

**Browser Caching**

```
Static assets: Cache-Control: public, max-age=31536000, immutable
Dynamic pages: Cache-Control: public, max-age=60, s-maxage=3600
API responses: Cache-Control: private, max-age=60
```

**ISR (Incremental Static Regeneration)**

```typescript
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ArticlePage() {
  const article = await getArticle();
  return <ArticleReader article={article} />;
}
```

**Database Connection Pooling**

- Supabase handles connection pooling
- PgBouncer for efficient connections

### Code Splitting

- Automatic via Next.js
- Dynamic imports for heavy components

```typescript
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/RichEditor'), {
  loading: () => <LoadingEditor />,
});
```

### Monitoring

**Web Vitals**

- Use web-vitals library
- Send to Google Analytics
- Monitor in Vercel Analytics

**Performance Budgets**

- JavaScript: < 200KB (gzipped)
- CSS: < 50KB (gzipped)
- Images: Optimized with next/image
- Fonts: System fonts + 1 custom font

---

## Deployment Architecture

### Development Environment

```bash
# Local development
npm install
npm run dev

# Environment: .env.local
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (server-only)
```

### Staging Environment

- Deployed to Vercel preview (automatic on PR)
- Separate Supabase project for staging
- Environment variables: Vercel secrets

### Production Environment

```bash
# Production deployment
npm run build
npm start

# Vercel auto-deploys on push to main
# Environment variables managed in Vercel dashboard
```

**Production Database**

- Supabase PostgreSQL on AWS
- Automated daily backups
- Point-in-time recovery available
- SSL connections required

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on: [push to main]

1. Install dependencies
2. Run tests (Vitest)
3. Run linting (ESLint)
4. Build (Next.js)
5. Deploy to Vercel
6. Run E2E tests on staging
7. Deploy to production
```

### Monitoring in Production

**Sentry Integration**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Uptime Monitoring**

- Vercel uptime monitoring
- Health check endpoint: `/api/health`

---

## Development Environment Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Supabase account (free tier)
- Vercel account (free tier)

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd ariyadham

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Fill in Supabase keys from dashboard

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev

# Visit http://localhost:3000
```

### Database Migrations

```bash
# Create migration
npm run db:create-migration name_of_migration

# Apply migrations
npm run db:push

# Reset database (dev only)
npm run db:reset
```

### Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Full-Stack with Next.js + Supabase

**Decision:** Use Next.js 14 with Supabase as backend-as-a-service

**Rationale:**

- Next.js provides best-in-class React framework with SSR, optimization, and API routes
- Supabase offers managed PostgreSQL with auth, RLS, and real-time
- Reduces infrastructure complexity
- Enables rapid MVP development
- Scales from startup to enterprise

**Alternatives Considered:**

- Separate React SPA + Express backend (more complexity)
- Remix (good, but Next.js has larger ecosystem)
- Firebase (limited customization for complex domains)

**Consequences:**

- Tight coupling to Vercel deployment (can be moved)
- Learning curve for RLS and Supabase patterns
- Cold starts on serverless functions (acceptable for MVP)

---

### ADR-002: Tailwind CSS for All Styling

**Decision:** Use Tailwind CSS exclusively, no shadow DOM or CSS-in-JS

**Rationale:**

- Rapid development with utility-first approach
- Built-in dark mode support
- Better performance (no runtime CSS generation)
- Accessibility tokens included
- Large community and good tooling

**Consequences:**

- Larger HTML with class names
- Learning curve for utility-first mindset
- Must configure custom themes carefully

---

### ADR-003: PostgreSQL Full-Text Search (MVP) → Meilisearch (Phase 2)

**Decision:** Use PostgreSQL FTS for MVP, upgrade to Meilisearch in Phase 2

**Rationale:**

- PostgreSQL FTS is built-in, no external dependencies
- Good enough for MVP scale
- Meilisearch provides better UX (typo tolerance, relevance) at scale

**Consequences:**

- Migration path needed for Phase 2
- Search quality limited in MVP

---

### ADR-004: Supabase RLS for Authorization

**Decision:** Use Row Level Security policies for all authorization

**Rationale:**

- Database-level enforcement is most secure
- Prevents bugs where authorization is forgotten
- Scales to any number of features
- Built into Supabase architecture

**Consequences:**

- Requires careful RLS policy design
- Cannot bypass authorization in bugs
- Testing RLS policies requires special setup

---

### ADR-005: Real-Time Updates with Supabase Subscriptions

**Decision:** Use Supabase Realtime for article counts, anjali reactions, comments

**Rationale:**

- WebSocket-based, low-latency updates
- Real-time broadcast to all connected users
- Integrated into Supabase
- Minimal additional complexity

**Consequences:**

- WebSocket connections add server load
- Requires client-side subscription management
- Testing realtime features more complex

---

## Implementation Ready

This architecture document provides:

✅ **Strategic Decisions** - Technology choices with rationale
✅ **Structural Design** - Project organization and boundaries
✅ **Technical Patterns** - Consistent implementation patterns for agents
✅ **Data Design** - Complete schema with relationships
✅ **Security Model** - Auth, authorization, and protection
✅ **Performance Targets** - Core Web Vitals and optimization strategies
✅ **Deployment Pipeline** - From development to production
✅ **Consistency Rules** - Naming, organization, formats

**Ready for:** Implementation phase with autonomous dev agents

---

_Architecture prepared by: Decision Architecture Workflow_
_For: Ariyadham Platform_
_Date: 2025-11-07_
