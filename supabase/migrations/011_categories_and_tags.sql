-- Migration: Categories and Tags System
-- Description: Implement proper categorization and tagging for articles
-- Story: 4.3 - Article Categorization & Tagging

-- ============================================
-- PART 1: Categories Table (Pre-defined)
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Names (multi-language)
  name_en VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(100) NOT NULL UNIQUE,

  -- URL slugs (multi-language)
  slug_en VARCHAR(100) NOT NULL UNIQUE,
  slug_th VARCHAR(100) NOT NULL UNIQUE,

  -- Descriptions (multi-language)
  description_en TEXT,
  description_th TEXT,

  -- Visual identity
  icon_url VARCHAR(500),
  color_hex VARCHAR(7) DEFAULT '#3B82F6',

  -- SEO
  seo_description_en VARCHAR(160),
  seo_description_th VARCHAR(160),

  -- Ordering and status
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug_en ON categories(slug_en);
CREATE INDEX IF NOT EXISTS idx_categories_slug_th ON categories(slug_th);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view active categories
CREATE POLICY "Active categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

-- RLS Policy: Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name_en, name_th, slug_en, slug_th, description_en, description_th, color_hex, sort_order) VALUES
('Fundamentals', 'หลักพื้นฐาน', 'fundamentals', 'fundamentals-th', 'Core Buddhist teachings and principles', 'หลักคำสอนและหลักการพื้นฐานของพระพุทธศาสนา', '#3B82F6', 1),
('Meditation', 'ภาวนา', 'meditation', 'meditation-th', 'Meditation practices and mindfulness', 'การปฏิบัติภาวนาและสติ', '#10B981', 2),
('Ethics', 'ศีลธรรม', 'ethics', 'ethics-th', 'Buddhist ethics and moral conduct', 'จริยธรรมและความประพฤติทางพุทธศาสนา', '#F59E0B', 3),
('Wisdom', 'ปัญญา', 'wisdom', 'wisdom-th', 'Development of wisdom and understanding', 'การพัฒนาปัญญาและความเข้าใจ', '#8B5CF6', 4),
('Practice', 'ปฏิบัติ', 'practice', 'practice-th', 'Daily Buddhist practice and application', 'การปฏิบัติพุทธศาสนาในชีวิตประจำวัน', '#EC4899', 5),
('Community', 'ชุมชน', 'community', 'community-th', 'Sangha and community life', 'สังฆะและชีวิตชุมชน', '#06B6D4', 6)
ON CONFLICT (name_en) DO NOTHING;

-- ============================================
-- PART 2: Tags Table (User-created)
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tag name (single, no multi-language for tags)
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,

  -- Optional description
  description TEXT,

  -- Moderation
  status VARCHAR(20) DEFAULT 'approved' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Usage count (denormalized)
  usage_count INTEGER DEFAULT 0 NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags(status);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_created_by ON tags(created_by);

-- Enable RLS for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view approved tags
CREATE POLICY "Approved tags are viewable by everyone"
  ON tags FOR SELECT
  USING (status = 'approved');

-- RLS Policy: Authors can create tags (subject to moderation)
CREATE POLICY "Authors can create tags"
  ON tags FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IN (
      SELECT user_id FROM user_profiles
      WHERE role IN ('author', 'admin')
    )
  );

-- RLS Policy: Admins can manage all tags
CREATE POLICY "Admins can manage all tags"
  ON tags FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 3: Article-Categories Junction Table
-- ============================================

CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  -- Display order
  sort_order INTEGER DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one category assigned once per article
  UNIQUE(article_id, category_id)
);

-- Indexes for article_categories
CREATE INDEX IF NOT EXISTS idx_article_categories_article_id ON article_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_category_id ON article_categories(category_id);

-- Enable RLS
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view categories of published articles
CREATE POLICY "Article categories are viewable"
  ON article_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND status = 'published'
    )
    OR
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

-- RLS Policy: Authors can manage categories for their articles
CREATE POLICY "Authors can manage article categories"
  ON article_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

-- ============================================
-- PART 4: Article-Tags Junction Table
-- ============================================

CREATE TABLE IF NOT EXISTS article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one tag assigned once per article
  UNIQUE(article_id, tag_id)
);

-- Indexes for article_tags
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);

-- Enable RLS
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view tags of published articles
CREATE POLICY "Article tags are viewable"
  ON article_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND status = 'published'
    )
    OR
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

-- RLS Policy: Authors can manage tags for their articles
CREATE POLICY "Authors can manage article tags"
  ON article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

-- ============================================
-- PART 5: Triggers for Usage Counts
-- ============================================

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage count
CREATE TRIGGER update_tag_usage_on_article_tags
  AFTER INSERT OR DELETE ON article_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- ============================================
-- PART 6: Migrate Existing Data
-- ============================================

-- Migrate existing category data from articles.category to article_categories
DO $$
DECLARE
  article_record RECORD;
  category_id UUID;
BEGIN
  FOR article_record IN SELECT id, category FROM articles WHERE category IS NOT NULL
  LOOP
    -- Try to find matching category by name_en (case insensitive)
    SELECT id INTO category_id
    FROM categories
    WHERE LOWER(name_en) = LOWER(article_record.category)
    LIMIT 1;

    -- If category found, create junction record
    IF category_id IS NOT NULL THEN
      INSERT INTO article_categories (article_id, category_id)
      VALUES (article_record.id, category_id)
      ON CONFLICT (article_id, category_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Remove old category column from articles (commented out for safety - uncomment when ready)
-- ALTER TABLE articles DROP COLUMN IF EXISTS category;

-- ============================================
-- PART 7: Helper Views
-- ============================================

-- View for articles with categories and tags
CREATE OR REPLACE VIEW article_taxonomy AS
SELECT
  a.id as article_id,
  a.title,
  a.slug,
  a.status,

  -- Categories
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', c.id,
        'name_en', c.name_en,
        'name_th', c.name_th,
        'slug_en', c.slug_en,
        'slug_th', c.slug_th,
        'color_hex', c.color_hex
      )
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'
  ) as categories,

  -- Tags
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
FROM articles a
LEFT JOIN article_categories ac ON a.id = ac.article_id
LEFT JOIN categories c ON ac.category_id = c.id AND c.is_active = true
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id AND t.status = 'approved'
GROUP BY a.id, a.title, a.slug, a.status;

-- Add helpful comments
COMMENT ON TABLE categories IS 'Pre-defined content categories (admin-managed)';
COMMENT ON TABLE tags IS 'User-created tags for flexible article labeling';
COMMENT ON TABLE article_categories IS 'Many-to-many junction: articles to categories';
COMMENT ON TABLE article_tags IS 'Many-to-many junction: articles to tags';
