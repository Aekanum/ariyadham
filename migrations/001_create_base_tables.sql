-- Ariyadham Database Schema
-- Version: 1.0
-- Date: 2025-11-07
-- Description: Create base tables for Ariyadham dharma platform

-- ============================================================================
-- TABLE 1: users
-- ============================================================================
-- Core user account information synced from Supabase Auth

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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 2: authors
-- ============================================================================
-- Author-specific information for users who write content

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Author Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Author Info
  bio_expanded TEXT,
  website_url VARCHAR(500),
  social_links JSONB,

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

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 3: categories
-- ============================================================================
-- Master data for content categories (dharma topics)

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

-- Enable RLS (public read access to categories)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 4: articles
-- ============================================================================
-- Published and draft content with metadata

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
  reading_time_minutes INT,

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

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 5: article_categories
-- ============================================================================
-- Junction table linking articles to categories

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

-- Enable RLS
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 6: article_translations
-- ============================================================================
-- Alternative language versions of articles

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

-- Enable RLS
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 7: comments
-- ============================================================================
-- Threaded comments on articles

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

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 8: anjali_reactions
-- ============================================================================
-- "Anjali button" (🙏) interactions - dharma-specific reactions

CREATE TABLE anjali_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_anjali_reactions_article_id ON anjali_reactions(article_id);
CREATE INDEX idx_anjali_reactions_user_id ON anjali_reactions(user_id);
CREATE INDEX idx_anjali_reactions_created_at ON anjali_reactions(created_at DESC);

-- Enable RLS
ALTER TABLE anjali_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 9: bookmarks
-- ============================================================================
-- Saved articles for reading later

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Custom Folder (optional)
  folder_name VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 10: reading_history
-- ============================================================================
-- Track user reading progress and history

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

-- Enable RLS
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE 11: audit_logs
-- ============================================================================
-- System audit trail for compliance and debugging

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action Info
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,

  -- Actor Info
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),

  -- Changes
  changes JSONB,
  details JSONB,

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

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users Table Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can update roles" ON users
  FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Authors Table Policies
CREATE POLICY "Authors visible based on user role" ON authors
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      user_id = auth.uid()
      OR verification_status = 'verified'
      OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    )
  );

CREATE POLICY "Users can create author profile" ON authors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Articles Table Policies
CREATE POLICY "Published articles visible to all" ON articles
  FOR SELECT USING (
    status = 'published'
    OR author_id = (SELECT id FROM authors WHERE user_id = auth.uid() AND deleted_at IS NULL)
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Authors can create articles" ON articles
  FOR INSERT WITH CHECK (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid() AND deleted_at IS NULL)
  );

CREATE POLICY "Authors can update own articles" ON articles
  FOR UPDATE USING (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid() AND deleted_at IS NULL)
  )
  WITH CHECK (
    author_id = (SELECT id FROM authors WHERE user_id = auth.uid() AND deleted_at IS NULL)
  );

CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Categories Table Policies (Public Read)
CREATE POLICY "Categories visible to all" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify categories" ON categories
  FOR INSERT WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update categories" ON categories
  FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Article Categories Policies
CREATE POLICY "Article categories visible for published articles" ON article_categories
  FOR SELECT USING (
    article_id IN (
      SELECT id FROM articles WHERE status = 'published'
    )
  );

-- Comments Table Policies
CREATE POLICY "Published comments visible on published articles" ON comments
  FOR SELECT USING (
    status = 'published'
    AND article_id IN (SELECT id FROM articles WHERE status = 'published')
  );

CREATE POLICY "Users can create comments on published articles" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND article_id IN (SELECT id FROM articles WHERE status = 'published')
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Anjali Reactions Policies
CREATE POLICY "Anjali reactions visible to all" ON anjali_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reactions" ON anjali_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions" ON anjali_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Bookmarks Policies
CREATE POLICY "Users can see own bookmarks" ON bookmarks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- Reading History Policies
CREATE POLICY "Users can see own reading history" ON reading_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reading history" ON reading_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reading history" ON reading_history
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Audit Logs Policies
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- DATABASE TRIGGERS
-- ============================================================================

-- Trigger Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at trigger to authors table
CREATE TRIGGER update_authors_updated_at
BEFORE UPDATE ON authors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at trigger to articles table
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at trigger to categories table
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at trigger to comments table
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at trigger to reading_history table
CREATE TRIGGER update_reading_history_updated_at
BEFORE UPDATE ON reading_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger Function: Sync article anjali_count
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

-- Apply anjali_count sync trigger
CREATE TRIGGER sync_anjali_count
AFTER INSERT OR DELETE ON anjali_reactions
FOR EACH ROW
EXECUTE FUNCTION sync_article_anjali_count();

-- Trigger Function: Sync article comment_count
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

-- Apply comment_count sync trigger
CREATE TRIGGER sync_comment_count
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION sync_article_comment_count();

-- Trigger Function: Sync article bookmark_count
CREATE OR REPLACE FUNCTION sync_article_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles SET bookmark_count = bookmark_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles SET bookmark_count = bookmark_count - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply bookmark_count sync trigger
CREATE TRIGGER sync_bookmark_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW
EXECUTE FUNCTION sync_article_bookmark_count();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Sample categories
INSERT INTO categories (name_en, name_th, slug_en, slug_th, description_en, description_th, icon_url, color_hex, sort_order, is_active)
VALUES
  ('Meditation', 'สมาธิ', 'meditation', 'meditation', 'Teachings on meditation practice', 'สอนเรื่องการท่องสมาธิ', '/icons/meditation.svg', '#3B82F6', 1, true),
  ('Mindfulness', 'สติ', 'mindfulness', 'mindfulness', 'Mindfulness and present moment awareness', 'สติและการตระหนักสำนึก', '/icons/mindfulness.svg', '#10B981', 2, true),
  ('Ethics', 'ศีล', 'ethics', 'ethics', 'Buddhist moral principles and conduct', 'หลักศีลและความประพฤติ', '/icons/ethics.svg', '#F59E0B', 3, true),
  ('Wisdom', 'ปัญญา', 'wisdom', 'wisdom', 'Understanding and insight into reality', 'ความเข้าใจและการมองเห็นจริง', '/icons/wisdom.svg', '#8B5CF6', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- This migration creates the complete database schema for Ariyadham
-- All tables have RLS enabled and require explicit policies for access
-- All relationships have proper constraints and indexes for performance
