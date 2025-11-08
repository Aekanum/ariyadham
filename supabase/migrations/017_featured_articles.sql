-- Migration: Featured Articles
-- Description: Create featured articles functionality for admin management
-- Story: 6.5 - Featured Content Management

-- Create featured_articles table to track articles featured on homepage
CREATE TABLE IF NOT EXISTS featured_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Article reference
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

  -- Display order (lower number = higher priority)
  display_order INTEGER NOT NULL,

  -- Featured by admin
  featured_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  featured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure unique article (can't feature same article twice)
  CONSTRAINT unique_featured_article UNIQUE (article_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_featured_articles_article_id ON featured_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_featured_articles_display_order ON featured_articles(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_articles_featured_at ON featured_articles(featured_at DESC);

-- Enable Row Level Security
ALTER TABLE featured_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view featured articles
CREATE POLICY "Featured articles are viewable by everyone"
  ON featured_articles FOR SELECT
  USING (true);

-- RLS Policy: Only admins can manage featured articles
CREATE POLICY "Admins can insert featured articles"
  ON featured_articles FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update featured articles"
  ON featured_articles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete featured articles"
  ON featured_articles FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_featured_articles_updated_at
  BEFORE UPDATE ON featured_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reorder featured articles after deletion
CREATE OR REPLACE FUNCTION reorder_featured_articles_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update display_order for all articles with order greater than deleted article
  UPDATE featured_articles
  SET display_order = display_order - 1
  WHERE display_order > OLD.display_order;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically reorder after deletion
CREATE TRIGGER reorder_featured_on_delete
  AFTER DELETE ON featured_articles
  FOR EACH ROW
  EXECUTE FUNCTION reorder_featured_articles_after_delete();

-- Create a view for easy querying of featured articles with article details
CREATE OR REPLACE VIEW featured_articles_with_details AS
SELECT
  fa.id,
  fa.article_id,
  fa.display_order,
  fa.featured_by,
  fa.featured_at,
  fa.created_at,
  fa.updated_at,
  a.title,
  a.slug,
  a.excerpt,
  a.featured_image_url,
  a.author_id,
  a.published_at,
  a.category,
  a.reading_time_minutes,
  a.view_count
FROM featured_articles fa
INNER JOIN articles a ON fa.article_id = a.id
WHERE a.status = 'published'
ORDER BY fa.display_order ASC;

-- Add helpful comments
COMMENT ON TABLE featured_articles IS 'Tracks articles featured on the homepage with display order';
COMMENT ON COLUMN featured_articles.display_order IS 'Order in which articles appear (1 = first, 2 = second, etc.)';
COMMENT ON VIEW featured_articles_with_details IS 'Convenient view combining featured articles with their article details';
