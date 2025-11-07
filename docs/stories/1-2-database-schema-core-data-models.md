# Story 1.2: Database Schema & Core Data Models

**Epic:** 1 - Foundation & Infrastructure
**Story ID:** 1.2
**Status:** Ready for Development
**Assignee:** Backend Developer
**Effort:** Large (5-8 hours)
**Priority:** Critical

---

## Story Statement

As a **backend developer**,
I want to **define the core database schema for users, content, and interactions**,
So that **all subsequent features have a solid foundation for data persistence**.

---

## Acceptance Criteria

### Schema Creation
**Given** an empty Supabase project
**When** migrations run
**Then** the following tables exist with proper structure:
- ✅ `users` - user profiles, roles, metadata
- ✅ `authors` - author information and verification status
- ✅ `articles` - content with metadata, status, publish dates
- ✅ `article_categories` - taxonomy categories
- ✅ `article_translations` - multi-language article versions
- ✅ `comments` - threaded article comments
- ✅ `anjali_reactions` - Anjali button interactions
- ✅ `bookmarks` - saved articles per user
- ✅ `reading_history` - user reading progress
- ✅ `categories` - category master data
- ✅ `audit_logs` - system audit trail

### Indexes & Performance
**And** appropriate indexes exist for:
- ✅ Article lookup by slug
- ✅ User profile queries
- ✅ Category filtering
- ✅ Comment threading
- ✅ Article status and published date queries
- ✅ User reading history by date

### Row Level Security (RLS)
**And** Row Level Security (RLS) policies are configured:
- ✅ Users can only view/modify own profile
- ✅ Users can only create articles under own author account
- ✅ Published articles visible to all
- ✅ Draft articles only visible to author
- ✅ Comments moderated by admins
- ✅ Anjali reactions user-specific

### Timestamps & Audit
**And** all tables have audit timestamps:
- ✅ `created_at` - auto-set on insert
- ✅ `updated_at` - auto-updated on modification
- ✅ `deleted_at` - soft-delete support where needed

### Data Validation
**And** database constraints ensure data integrity:
- ✅ Unique constraints (email, username, article slug)
- ✅ Foreign key constraints
- ✅ Check constraints for status values
- ✅ NOT NULL constraints on required fields

---

## Prerequisites

- ✅ **Story 1.1 Complete** - Project initialized with Next.js, TypeScript, Tailwind, ESLint, Prettier

## Blocks

- Blocks all other stories (database is fundamental to all features)

## Depends On

- Story 1.1: Project Setup & Repository Structure

---

## Technical Notes

### Technology Stack
- **Database Engine:** PostgreSQL (via Supabase)
- **Migrations:** SQL files in `migrations/` directory
- **RLS Implementation:** PostgreSQL Row Level Security
- **Audit Logging:** Database triggers + audit_logs table
- **Soft Deletes:** `deleted_at` nullable timestamp pattern

### Key Design Decisions

1. **Denormalized Fields** - Store denormalized counts (comment_count, anjali_count) for performance
   - Update via database triggers
   - Sync via API endpoints
   - Display real-time via Supabase subscriptions

2. **Soft Deletes** - Use `deleted_at` nullable timestamp instead of hard deletes
   - Preserve data for compliance
   - Enable restore functionality
   - Query with `deleted_at IS NULL` condition

3. **Article Versioning** - Support multiple languages via article_translations
   - Original article in base language
   - Translations linked via `translated_from_id`
   - Each language version has own slug and metadata

4. **Author Separation** - Separate `authors` table from `users` table
   - Not all users are authors
   - Authors have verification status
   - Authors have bio, profile picture, etc.

5. **Comment Threading** - Support replies to comments
   - `parent_comment_id` nullable to allow replies
   - Thread replies under parent comment
   - Recursively fetch comment threads

### Performance Considerations

- **Indexes on Foreign Keys** - Automatic on relationships
- **Indexes on Filters** - status, published_at, created_at
- **Indexes on Search** - Full-text search on title and content
- **Denormalized Counts** - Avoid expensive aggregations
- **Pagination Support** - Efficient cursor-based pagination

---

## Database Schema

### Table 1: users

Core user account information synced from Supabase Auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,

  -- Status & Roles
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'th')),
  theme_preference VARCHAR(20) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  reading_font_size INT DEFAULT 16 CHECK (reading_font_size >= 12 AND reading_font_size <= 24),
  accessibility_mode BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### Table 2: authors

Author-specific information for users who write content.

```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Author Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Author Info
  bio_expanded TEXT,
  website_url VARCHAR(500),
  social_links JSONB,  -- { "twitter": "...", "facebook": "..." }

  -- Denormalized Counts
  article_count INT DEFAULT 0,
  total_anjali_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_authors_user_id ON authors(user_id);
CREATE INDEX idx_authors_verification_status ON authors(verification_status);
CREATE UNIQUE INDEX idx_authors_user_id_unique ON authors(user_id) WHERE deleted_at IS NULL;
```

### Table 3: articles

Published and draft content with metadata.

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  translated_from_id UUID REFERENCES articles(id) ON DELETE SET NULL,

  -- Content
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Metadata
  language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'th')),
  featured_image_url VARCHAR(500),

  -- Status & Publishing
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,

  -- SEO
  seo_title VARCHAR(70),
  seo_description VARCHAR(160),
  seo_keywords VARCHAR(255),

  -- Denormalized Counts
  view_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  anjali_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,
  reading_time_minutes INT,  -- Estimated reading time

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX idx_articles_slug ON articles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_language ON articles(language) WHERE status = 'published' AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_articles_slug_unique ON articles(slug, language) WHERE deleted_at IS NULL;
```

### Table 4: categories

Master data for content categories (dharma topics).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Category Info
  name_en VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(100) NOT NULL UNIQUE,
  slug_en VARCHAR(100) NOT NULL UNIQUE,
  slug_th VARCHAR(100) NOT NULL UNIQUE,

  -- Description
  description_en TEXT,
  description_th TEXT,
  icon_url VARCHAR(500),
  color_hex VARCHAR(7),

  -- SEO
  seo_description_en VARCHAR(160),
  seo_description_th VARCHAR(160),

  -- Ordering
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_slug_en ON categories(slug_en);
CREATE INDEX idx_categories_slug_th ON categories(slug_th);
```

### Table 5: article_categories

Junction table linking articles to categories.

```sql
CREATE TABLE article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  -- Ordering
  sort_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_article_categories_article_id ON article_categories(article_id);
CREATE INDEX idx_article_categories_category_id ON article_categories(category_id);
CREATE UNIQUE INDEX idx_article_categories_unique ON article_categories(article_id, category_id);
```

### Table 6: article_translations

Alternative language versions of articles.

```sql
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  original_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  translator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_article_translations_article_id ON article_translations(article_id);
CREATE INDEX idx_article_translations_original_id ON article_translations(original_article_id);
CREATE INDEX idx_article_translations_language ON article_translations(language);
CREATE INDEX idx_article_translations_status ON article_translations(status);
```

### Table 7: comments

Threaded comments on articles.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'pending', 'approved', 'rejected', 'spam')),
  flagged_as_spam BOOLEAN DEFAULT false,

  -- Denormalized
  reply_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_status ON comments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC) WHERE deleted_at IS NULL;
```

### Table 8: anjali_reactions

"Anjali button" (🙏) interactions - dharma-specific reactions.

```sql
CREATE TABLE anjali_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  UNIQUE(article_id, user_id)  -- One anjali per user per article
);

CREATE INDEX idx_anjali_reactions_article_id ON anjali_reactions(article_id);
CREATE INDEX idx_anjali_reactions_user_id ON anjali_reactions(user_id);
CREATE INDEX idx_anjali_reactions_created_at ON anjali_reactions(created_at DESC);
```

### Table 9: bookmarks

Saved articles for reading later.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Custom Folder (optional)
  folder_name VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  UNIQUE(article_id, user_id)  -- One bookmark per user per article
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

### Table 10: reading_history

Track user reading progress and history.

```sql
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Progress
  scroll_percentage INT DEFAULT 0 CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100),
  time_spent_seconds INT DEFAULT 0,

  -- Status
  completed BOOLEAN DEFAULT false,
  completion_percentage INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Only one active read per user per article
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX idx_reading_history_updated_at ON reading_history(updated_at DESC);
```

### Table 11: audit_logs

System audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action Info
  action VARCHAR(100) NOT NULL,  -- 'article_published', 'user_created', 'comment_flagged', etc.
  entity_type VARCHAR(50) NOT NULL,  -- 'article', 'user', 'comment', etc.
  entity_id VARCHAR(100) NOT NULL,

  -- Actor Info
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),

  -- Changes
  changes JSONB,  -- { "field": { "old": "...", "new": "..." } }
  details JSONB,  -- Additional context

  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## Row Level Security (RLS) Policies

### Policy 1: Users Table

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can update user roles
CREATE POLICY "Only admins can update roles" ON users
  FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
```

### Policy 2: Articles Table

```sql
-- Published articles visible to all
CREATE POLICY "Published articles visible to all" ON articles
  FOR SELECT USING (
    status = 'published'
    OR author_id = (SELECT id FROM authors WHERE user_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Authors can create articles
CREATE POLICY "Authors can create articles" ON articles
  FOR INSERT WITH CHECK (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid())
  );

-- Authors can update own articles
CREATE POLICY "Authors can update own articles" ON articles
  FOR UPDATE USING (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid())
  );

-- Admins can delete articles
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### Policy 3: Comments Table

```sql
-- Published comments visible if article is visible
CREATE POLICY "Visible comments visible to readers" ON comments
  FOR SELECT USING (
    status = 'published'
    AND article_id IN (SELECT id FROM articles WHERE status = 'published')
  );

-- Users can create comments on published articles
CREATE POLICY "Users can comment on articles" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND article_id IN (SELECT id FROM articles WHERE status = 'published')
  );

-- Users can update own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Policy 4: Anjali Reactions Table

```sql
-- Users can see all anjali reactions
CREATE POLICY "Anjali reactions visible to all" ON anjali_reactions
  FOR SELECT USING (true);

-- Users can create own reactions
CREATE POLICY "Users can create own reactions" ON anjali_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete own reactions
CREATE POLICY "Users can delete own reactions" ON anjali_reactions
  FOR DELETE USING (user_id = auth.uid());
```

### Policy 5: Bookmarks Table

```sql
-- Users can only see own bookmarks
CREATE POLICY "Users can see own bookmarks" ON bookmarks
  FOR SELECT USING (user_id = auth.uid());

-- Users can create bookmarks
CREATE POLICY "Users can create bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (user_id = auth.uid());
```

---

## Database Triggers

### Trigger 1: Auto-update articles.updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to other tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trigger 2: Update article.anjali_count

```sql
CREATE OR REPLACE FUNCTION sync_article_anjali_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles SET anjali_count = anjali_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles SET anjali_count = anjali_count - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_anjali_count
AFTER INSERT OR DELETE ON anjali_reactions
FOR EACH ROW
EXECUTE FUNCTION sync_article_anjali_count();
```

### Trigger 3: Update article.comment_count

```sql
CREATE OR REPLACE FUNCTION sync_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
    UPDATE articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_comment_count
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION sync_article_comment_count();
```

---

## TypeScript Types

Once the database is created, generate types using Supabase CLI or manually create:

```typescript
// src/types/database.ts

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'author' | 'admin';
  email_verified: boolean;
  is_active: boolean;
  language_preference: 'en' | 'th';
  theme_preference: 'light' | 'dark' | 'system';
  reading_font_size: number;
  accessibility_mode: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Author {
  id: string;
  user_id: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null;
  bio_expanded: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  article_count: number;
  total_anjali_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Article {
  id: string;
  author_id: string;
  translated_from_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  language: 'en' | 'th';
  featured_image_url: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  scheduled_for: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  view_count: number;
  comment_count: number;
  anjali_count: number;
  bookmark_count: number;
  reading_time_minutes: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ... (and other type definitions for remaining tables)
```

---

## Implementation Tasks

- [ ] **Task 1:** Create or access Supabase project
  - Go to https://supabase.com and create free project
  - Name: `ariyadham`
  - Region: Choose closest to target users (Singapore/US East)
  - Save connection string and API keys

- [ ] **Task 2:** Create migrations directory
  - Create `migrations/` directory in project root
  - Create `001_create_base_tables.sql` with all table definitions

- [ ] **Task 3:** Run migrations in Supabase
  - Use Supabase Dashboard SQL Editor OR
  - Use Supabase CLI: `supabase db push`

- [ ] **Task 4:** Configure RLS policies
  - Enable RLS on all tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
  - Create all RLS policies from schema above

- [ ] **Task 5:** Create database triggers
  - Run trigger creation SQL in Supabase SQL Editor

- [ ] **Task 6:** Create TypeScript types
  - Create `src/types/database.ts` with all type definitions
  - Optionally use Supabase CLI to auto-generate: `supabase gen types typescript --local > src/types/database.ts`

- [ ] **Task 7:** Create Supabase client utility
  - Create `src/lib/supabase.ts` with client initialization
  - Export createClient() function for API routes

- [ ] **Task 8:** Update .env.local with Supabase credentials
  - Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Add SUPABASE_SERVICE_ROLE_KEY for server-side operations

- [ ] **Task 9:** Document schema in SCHEMA.md
  - Create `docs/SCHEMA.md` with schema documentation
  - Include ER diagram (text-based or link to visual)
  - Document all tables, relationships, and constraints

- [ ] **Task 10:** Create test data (optional)
  - Insert sample categories
  - Create test user and author profiles
  - Create sample articles for testing

- [ ] **Task 11:** Verify RLS policies work
  - Test that users can only see own profiles
  - Test that published articles are visible to all
  - Test that draft articles only visible to authors

- [ ] **Task 12:** Run type checking and linting
  - `npm run type-check` - Should pass
  - `npm run lint` - Should pass
  - `npm run build` - Should succeed

---

## Database Diagrams

### Entity Relationship Diagram (Text-based)

```
users (1) ────────────→ (*) authors
  ├─→ articles (author_id)
  ├─→ comments
  ├─→ anjali_reactions
  ├─→ bookmarks
  └─→ reading_history

articles (1) ──────────→ (*) comments
  ├─→ anjali_reactions
  ├─→ bookmarks
  ├─→ reading_history
  ├─→ article_categories → categories
  └─→ article_translations

articles (self-ref) ───→ article_translations (translated_from_id)
```

### Table Dependencies

1. `users` - Independent (synced from auth.users)
2. `authors` - Depends on users
3. `categories` - Independent
4. `articles` - Depends on authors, categories
5. `article_categories` - Depends on articles, categories
6. `article_translations` - Depends on articles, users
7. `comments` - Depends on articles, users
8. `anjali_reactions` - Depends on articles, users
9. `bookmarks` - Depends on articles, users
10. `reading_history` - Depends on articles, users
11. `audit_logs` - Depends on users (optional)

---

## Definition of Done

✅ All acceptance criteria met:
- [ ] All 11 tables created with proper structure
- [ ] All indexes created for performance
- [ ] RLS policies configured and tested
- [ ] Database triggers working
- [ ] Timestamps on all tables
- [ ] Data constraints enforced
- [ ] TypeScript types generated/created
- [ ] Supabase client utility created
- [ ] Environment variables configured
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Schema documented in SCHEMA.md

✅ Code quality:
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Proper naming conventions followed
- [ ] Comments on complex logic

---

## Dependencies & Context

### Architecture Patterns Used
- RLS for authorization (from architecture.md)
- Denormalized counts via triggers (from architecture.md)
- Soft deletes with `deleted_at` (from architecture.md)
- Multi-language support via article_translations (from architecture.md)

### Related Stories
- **Blocks:** Story 1.3 (Authentication depends on users table)
- **Blocks:** Story 2.1 (User profiles depend on users table)
- **Blocks:** Story 3.1 (Article reading depends on articles table)
- **Blocks:** All Epic 4+ stories (Author CMS, community features)

### Technologies
- PostgreSQL (SQL dialect via Supabase)
- Row Level Security
- Database Triggers
- Foreign Key Constraints

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Architecture Design Document - Data Architecture Section](./architecture.md)
- [Epics & Stories - Epic 1 Overview](./epics.md)

---

**Status:** Ready for Implementation
**Created:** 2025-11-07
**Last Updated:** 2025-11-07
