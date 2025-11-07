# Database Schema Documentation

**Project:** Ariyadham - Buddhist Dharma Platform
**Created:** 2025-11-07
**Last Updated:** 2025-11-07
**Database:** PostgreSQL (Supabase)
**Version:** 1.0

---

## Overview

The Ariyadham database schema is designed to support a comprehensive platform for sharing Buddhist teachings. It includes support for multi-language content, user authentication, community engagement via the Anjali button (🙏), and complete audit trails.

### Key Design Principles

1. **User-Centric:** User data is always separated from content data
2. **Language-Aware:** Every text field has language variants (en, th)
3. **Soft Deletes:** Data is marked as deleted, not hard-deleted, for compliance
4. **Denormalized Counts:** Performance optimized via database triggers
5. **RLS-First:** All data protected by Row Level Security policies
6. **Audit Trail:** All changes logged for compliance and debugging

---

## Entity Relationship Diagram

### High-Level Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                           │
├─────────────────────────────────────────────────────────────┤
│  auth.users (Supabase Auth)                                 │
│    ↓ (referenced by)                                        │
│  users (synced profile data)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    USER & AUTHOR                            │
├─────────────────────────────────────────────────────────────┤
│  users (all registered users)                               │
│    ├─→ authors (author profiles, 1:0..1)                    │
│    ├─→ articles (authored, 1:*)                             │
│    ├─→ comments (written, 1:*)                              │
│    ├─→ anjali_reactions (given, 1:*)                        │
│    ├─→ bookmarks (created, 1:*)                             │
│    └─→ reading_history (tracked, 1:*)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTENT & METADATA                       │
├─────────────────────────────────────────────────────────────┤
│  articles (blog posts/dharma teachings)                     │
│    ├─→ article_categories (*, *)  → categories              │
│    ├─→ article_translations (*, *)  → articles (self-ref)   │
│    ├─→ comments (1:*)                                       │
│    ├─→ anjali_reactions (1:*)                               │
│    ├─→ bookmarks (1:*)                                      │
│    └─→ reading_history (1:*)                                │
│                                                             │
│  categories (content taxonomy)                              │
│    └─→ article_categories (1:*)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ENGAGEMENT & INTERACTION                 │
├─────────────────────────────────────────────────────────────┤
│  anjali_reactions (🙏 dharma reactions)                      │
│  bookmarks (articles saved for later)                       │
│  comments (article discussions)                             │
│    └─→ self-referencing (threading via parent_comment_id)   │
│  reading_history (user reading progress)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUDIT & COMPLIANCE                       │
├─────────────────────────────────────────────────────────────┤
│  audit_logs (all system changes)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Table Reference

### 1. users

**Purpose:** Store user account information and preferences
**Rows:** Variable (all registered users)
**Synced From:** Supabase Auth (auth.users)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, FK auth.users(id) | Synced from Supabase Auth |
| username | VARCHAR(50) | UNIQUE, NOT NULL | For display and mentions |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Synced from Supabase Auth |
| full_name | VARCHAR(255) | NULL | User's display name |
| avatar_url | VARCHAR(500) | NULL | URL to profile picture |
| bio | TEXT | NULL | Short user bio |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | user, author, or admin |
| email_verified | BOOLEAN | DEFAULT false | Email confirmation status |
| is_active | BOOLEAN | DEFAULT true | Account enabled/disabled |
| language_preference | VARCHAR(10) | DEFAULT 'en' | en or th |
| theme_preference | VARCHAR(20) | DEFAULT 'system' | light, dark, or system |
| reading_font_size | INT | DEFAULT 16, 12-24 range | Accessibility setting |
| accessibility_mode | BOOLEAN | DEFAULT false | Senior-friendly mode |
| created_at | TIMESTAMP | DEFAULT now() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT now() | Last profile update |
| last_login_at | TIMESTAMP | NULL | Last authentication |

**Indexes:**
- `idx_users_email` - For login queries
- `idx_users_username` - For mention/search
- `idx_users_role` - For filtering by user type

**RLS Policies:**
- Users can view own profile
- Admins can view all profiles
- Users can update own profile
- Only admins can change roles

---

### 2. authors

**Purpose:** Author-specific information for users who write content
**Rows:** Variable (subset of users with role='author')
**Cardinality:** users (1:0..1) authors

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Author profile ID |
| user_id | UUID | FK users(id), UNIQUE | One author per user (soft) |
| verification_status | VARCHAR(20) | DEFAULT 'pending' | pending, verified, rejected |
| verified_at | TIMESTAMP | NULL | When verified by admin |
| bio_expanded | TEXT | NULL | Longer author biography |
| website_url | VARCHAR(500) | NULL | Author's personal website |
| social_links | JSONB | NULL | {twitter, facebook, etc.} |
| article_count | INT | DEFAULT 0 | Denormalized, updated by trigger |
| total_anjali_count | INT | DEFAULT 0 | Denormalized, updated by trigger |
| created_at | TIMESTAMP | DEFAULT now() | Author profile creation |
| updated_at | TIMESTAMP | DEFAULT now() | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete marker |

**Indexes:**
- `idx_authors_user_id` - For profile lookups
- `idx_authors_verification_status` - For filtering verified authors
- `idx_authors_user_id_unique` - UNIQUE on user_id where deleted_at IS NULL

**Triggers:**
- Updates denormalized counts when articles are created/deleted
- Updates total anjali count when reactions added/removed

---

### 3. articles

**Purpose:** Store dharma content (blog posts, teachings)
**Rows:** Variable (all published, scheduled, draft, and archived content)
**Cardinality:** authors (1:*) articles

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Article ID |
| author_id | UUID | FK authors(id), NOT NULL | Article author |
| translated_from_id | UUID | FK articles(id) | Original article if translation |
| title | VARCHAR(500) | NOT NULL | Article headline |
| slug | VARCHAR(500) | UNIQUE (per language) | URL-friendly identifier |
| excerpt | TEXT | NULL | Summary/preview |
| content | TEXT | NOT NULL | Full markdown content |
| language | VARCHAR(10) | DEFAULT 'en' | en or th |
| featured_image_url | VARCHAR(500) | NULL | Hero image URL |
| status | VARCHAR(20) | DEFAULT 'draft' | draft, scheduled, published, archived |
| published_at | TIMESTAMP | NULL | When published |
| scheduled_for | TIMESTAMP | NULL | When to auto-publish |
| seo_title | VARCHAR(70) | NULL | For search engines |
| seo_description | VARCHAR(160) | NULL | Meta description |
| seo_keywords | VARCHAR(255) | NULL | SEO keywords |
| view_count | INT | DEFAULT 0 | Read counter |
| comment_count | INT | DEFAULT 0 | Denormalized, trigger-updated |
| anjali_count | INT | DEFAULT 0 | Denormalized, trigger-updated |
| bookmark_count | INT | DEFAULT 0 | Denormalized, trigger-updated |
| reading_time_minutes | INT | NULL | Estimated read time |
| created_at | TIMESTAMP | DEFAULT now() | Creation time |
| updated_at | TIMESTAMP | DEFAULT now() | Last edit |
| deleted_at | TIMESTAMP | NULL | Soft delete marker |

**Indexes:**
- `idx_articles_author_id` - For author's articles
- `idx_articles_status` - For filtering by status
- `idx_articles_published_at` - For chronological sorting
- `idx_articles_slug` - For URL lookups
- `idx_articles_language` - For language filtering
- `idx_articles_slug_unique` - UNIQUE on slug+language

**Triggers:**
- Updates comment_count when comments added/deleted
- Updates anjali_count when reactions added/removed
- Updates bookmark_count when bookmarks added/removed
- Auto-updates updated_at on any change

---

### 4. categories

**Purpose:** Content taxonomy/categorization
**Rows:** ~5-20 (static/admin-maintained)
**Cardinality:** Standalone master data

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Category ID |
| name_en | VARCHAR(100) | UNIQUE, NOT NULL | English name |
| name_th | VARCHAR(100) | UNIQUE, NOT NULL | Thai name |
| slug_en | VARCHAR(100) | UNIQUE, NOT NULL | English URL slug |
| slug_th | VARCHAR(100) | UNIQUE, NOT NULL | Thai URL slug |
| description_en | TEXT | NULL | English description |
| description_th | TEXT | NULL | Thai description |
| icon_url | VARCHAR(500) | NULL | Category icon/SVG URL |
| color_hex | VARCHAR(7) | NULL | Brand color (e.g., #3B82F6) |
| seo_description_en | VARCHAR(160) | NULL | English meta |
| seo_description_th | VARCHAR(160) | NULL | Thai meta |
| sort_order | INT | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT true | Active/inactive status |
| created_at | TIMESTAMP | DEFAULT now() | Creation time |
| updated_at | TIMESTAMP | DEFAULT now() | Last edit |

**Indexes:**
- `idx_categories_is_active` - For filtering active categories
- `idx_categories_slug_en` - For English URL routing
- `idx_categories_slug_th` - For Thai URL routing

**RLS Policies:**
- All users can read active categories
- Only admins can create/update categories

---

### 5. article_categories

**Purpose:** Junction table for many-to-many relationship between articles and categories
**Rows:** Variable (typically 1-5 per article)
**Cardinality:** articles (*:*) categories

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Junction record ID |
| article_id | UUID | FK articles(id), NOT NULL | Article being categorized |
| category_id | UUID | FK categories(id), NOT NULL | Assigned category |
| sort_order | INT | DEFAULT 0 | Display order of categories |
| created_at | TIMESTAMP | DEFAULT now() | When assigned |

**Indexes:**
- `idx_article_categories_article_id` - For article's categories
- `idx_article_categories_category_id` - For category's articles
- `idx_article_categories_unique` - UNIQUE on article_id+category_id

---

### 6. article_translations

**Purpose:** Track translations of articles to other languages
**Rows:** Variable (0-1 per language per article)
**Cardinality:** articles (*) article_translations

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Translation record ID |
| article_id | UUID | FK articles(id), NOT NULL | Translated article |
| original_article_id | UUID | FK articles(id), NOT NULL | Original language article |
| language | VARCHAR(10) | NOT NULL | Target language (en, th) |
| status | VARCHAR(20) | DEFAULT 'pending' | pending, approved, rejected |
| translator_id | UUID | FK users(id) | Who translated it |
| approved_by_id | UUID | FK users(id) | Who approved it |
| created_at | TIMESTAMP | DEFAULT now() | Translation start |
| updated_at | TIMESTAMP | DEFAULT now() | Last update |
| approved_at | TIMESTAMP | NULL | When approved |

**Indexes:**
- `idx_article_translations_article_id` - For getting translations
- `idx_article_translations_original_id` - For getting translated versions
- `idx_article_translations_language` - For language-specific queries
- `idx_article_translations_status` - For translation workflow

---

### 7. comments

**Purpose:** User discussions on articles
**Rows:** Variable (typically 0-50 per article)
**Cardinality:** articles (1:*) comments, users (1:*) comments

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Comment ID |
| article_id | UUID | FK articles(id), NOT NULL | Article being commented on |
| user_id | UUID | FK users(id), NOT NULL | Comment author |
| parent_comment_id | UUID | FK comments(id) | Reply threading |
| content | TEXT | NOT NULL | Comment text |
| status | VARCHAR(20) | DEFAULT 'published' | published, pending, approved, rejected, spam |
| flagged_as_spam | BOOLEAN | DEFAULT false | Spam flag |
| reply_count | INT | DEFAULT 0 | Denormalized reply count |
| created_at | TIMESTAMP | DEFAULT now() | When posted |
| updated_at | TIMESTAMP | DEFAULT now() | Last edit |
| deleted_at | TIMESTAMP | NULL | Soft delete (user deletion) |

**Indexes:**
- `idx_comments_article_id` - For article's comments
- `idx_comments_user_id` - For user's comments
- `idx_comments_parent_comment_id` - For comment threading
- `idx_comments_status` - For filtering by status
- `idx_comments_created_at` - For chronological sorting

**Triggers:**
- Auto-updates updated_at on changes
- Updates parent reply_count when replies added/deleted
- Updates article comment_count when comments added/deleted

---

### 8. anjali_reactions

**Purpose:** "Anjali button" (🙏) reactions - dharma-specific interaction
**Rows:** Variable (typically 5-100+ per popular article)
**Cardinality:** articles (1:*) anjali_reactions, users (1:*) anjali_reactions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Reaction ID |
| article_id | UUID | FK articles(id), NOT NULL | Reacted to article |
| user_id | UUID | FK users(id), NOT NULL | User who reacted |
| created_at | TIMESTAMP | DEFAULT now() | When reacted |

**Indexes:**
- `idx_anjali_reactions_article_id` - For article's reactions
- `idx_anjali_reactions_user_id` - For user's reactions
- `idx_anjali_reactions_created_at` - For chronological queries

**Constraints:**
- UNIQUE(article_id, user_id) - One reaction per user per article

**Triggers:**
- Updates article anjali_count when inserted/deleted
- Updates author total_anjali_count via article count

**RLS Policies:**
- Anyone can see reactions (counts)
- Users can only add/remove own reactions
- No deletion without user authentication

---

### 9. bookmarks

**Purpose:** Save articles for later reading
**Rows:** Variable (typically 0-1000+ for active users)
**Cardinality:** articles (1:*) bookmarks, users (1:*) bookmarks

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Bookmark ID |
| article_id | UUID | FK articles(id), NOT NULL | Bookmarked article |
| user_id | UUID | FK users(id), NOT NULL | User who bookmarked |
| folder_name | VARCHAR(100) | NULL | Optional folder/collection |
| created_at | TIMESTAMP | DEFAULT now() | When bookmarked |

**Indexes:**
- `idx_bookmarks_user_id` - For user's bookmarks
- `idx_bookmarks_article_id` - For article's bookmark count
- `idx_bookmarks_created_at` - For chronological sorting

**Constraints:**
- UNIQUE(article_id, user_id) - One bookmark per user per article

**Triggers:**
- Updates article bookmark_count when inserted/deleted

**RLS Policies:**
- Users can only see own bookmarks
- Users can only modify own bookmarks

---

### 10. reading_history

**Purpose:** Track user reading progress and engagement
**Rows:** Variable (one per user per article they've opened)
**Cardinality:** articles (1:*) reading_history, users (1:*) reading_history

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | History record ID |
| article_id | UUID | FK articles(id), NOT NULL | Article read |
| user_id | UUID | FK users(id), NOT NULL | User reading |
| scroll_percentage | INT | DEFAULT 0, 0-100 | How far scrolled |
| time_spent_seconds | INT | DEFAULT 0 | Minutes spent reading |
| completed | BOOLEAN | DEFAULT false | Finished reading? |
| completion_percentage | INT | DEFAULT 0, 0-100 | Percentage complete |
| created_at | TIMESTAMP | DEFAULT now() | First opened |
| updated_at | TIMESTAMP | DEFAULT now() | Last updated |

**Indexes:**
- `idx_reading_history_user_id` - For user's history
- `idx_reading_history_article_id` - For article engagement stats
- `idx_reading_history_updated_at` - For recently read

**Constraints:**
- UNIQUE(article_id, user_id) - One active read per user per article

**RLS Policies:**
- Users can only see own reading history
- Users can only modify own reading history

---

### 11. audit_logs

**Purpose:** System audit trail for compliance and debugging
**Rows:** Variable (grows with every change)
**Cardinality:** All tables (1:*) audit_logs

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Log entry ID |
| action | VARCHAR(100) | NOT NULL | e.g., 'article_published' |
| entity_type | VARCHAR(50) | NOT NULL | e.g., 'article', 'user' |
| entity_id | VARCHAR(100) | NOT NULL | ID of affected entity |
| actor_id | UUID | FK users(id) | Who made the change |
| actor_role | VARCHAR(20) | NULL | Role of actor (for context) |
| changes | JSONB | NULL | {field: {old, new}} |
| details | JSONB | NULL | Additional context |
| success | BOOLEAN | DEFAULT true | Did operation succeed? |
| error_message | TEXT | NULL | Error details if failed |
| created_at | TIMESTAMP | DEFAULT now() | When logged |

**Indexes:**
- `idx_audit_logs_action` - For action filtering
- `idx_audit_logs_entity_type_id` - For entity-specific history
- `idx_audit_logs_actor_id` - For user activity history
- `idx_audit_logs_created_at` - For chronological queries

**RLS Policies:**
- Only admins can read audit logs

---

## Data Types Reference

| PostgreSQL Type | Usage | Example |
|---|---|---|
| UUID | Primary keys, foreign keys | `gen_random_uuid()` |
| VARCHAR(n) | Strings with max length | `VARCHAR(255)` for email |
| TEXT | Long text (no limit) | Article content, comments |
| BOOLEAN | True/false | `is_active`, `email_verified` |
| INT | Whole numbers | Counts, percentages |
| TIMESTAMP WITH TIME ZONE | Dates and times | `CURRENT_TIMESTAMP` |
| JSONB | JSON objects | `social_links`, `changes` |

---

## Performance Optimization Strategies

### 1. Denormalization with Triggers
Certain counts are denormalized to avoid expensive aggregations:
- `articles.comment_count` - Updated by trigger on comments table
- `articles.anjali_count` - Updated by trigger on anjali_reactions table
- `articles.bookmark_count` - Updated by trigger on bookmarks table
- `authors.article_count` - Updated by trigger on articles table

**Benefit:** O(1) read performance instead of O(n) aggregation

### 2. Strategic Indexing
Indexes are created on:
- **Foreign keys** - Automatic in PostgreSQL, enables fast joins
- **Filters** - `status`, `language`, `published_at`, `is_active`
- **Search** - Slugs, usernames, emails for quick lookups
- **Sorting** - `created_at`, `published_at`, `updated_at` for ordering

### 3. Soft Deletes
All sensitive data uses soft deletes (`deleted_at IS NULL`):
- Preserves referential integrity
- Enables user/data recovery
- Supports compliance requirements (data retention)
- WHERE clauses filter deleted records automatically

### 4. Unique Constraints
Uniqueness enforced at database level:
- `articles.slug` - Per language, prevents duplicates
- `users.email` - Ensures no duplicate accounts
- `users.username` - For mentions and profiles
- `anjali_reactions` - One per user per article (prevents spam)

### 5. Full-Text Search (Future)
PostgreSQL native FTS or external Meilisearch:
- Index on article `title` and `content`
- Fast partial-match search
- Ranking by relevance

---

## Backup & Recovery

### Supabase Backup Strategy
- **Automatic daily backups** - 7-day retention on free tier
- **Point-in-time recovery** - Available on Pro plan
- **Manual backups** - Via Supabase Dashboard

### Disaster Recovery Plan
1. **Data Loss Scenario** - Restore from daily backup
2. **Corruption Scenario** - Point-in-time recovery
3. **Migration Scenario** - Database export/import via pg_dump

---

## Compliance & Data Privacy

### GDPR Compliance
- Users can request data export
- Soft deletes allow data retention
- Audit logs track all modifications
- RLS policies prevent unauthorized access

### Data Retention
- **Active users:** Kept indefinitely
- **Deleted accounts:** Soft-deleted, retained 90 days, then purged
- **Audit logs:** Retained for 1 year for compliance
- **Anonymous data:** Aggregated for analytics

---

## Migration & Deployment

### Running Migrations

**Option 1: Supabase Dashboard SQL Editor**
```sql
-- Paste migrations/001_create_base_tables.sql into SQL Editor
-- Click "Run"
```

**Option 2: Supabase CLI**
```bash
# Install CLI
npm install -g supabase

# Link to project
supabase link --project-ref <project-id>

# Run migrations
supabase db push
```

**Option 3: Direct psql**
```bash
psql postgresql://user:password@host/dbname < migrations/001_create_base_tables.sql
```

### Verifying Schema
```sql
-- List all tables
\dt

-- View table structure
\d articles

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'articles';

-- View indexes
\di
```

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-07 | Initial schema with 11 tables, RLS policies, triggers |

---

**Last Updated:** 2025-11-07
**Maintained By:** Ariyadham Development Team
