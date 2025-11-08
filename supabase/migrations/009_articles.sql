-- Migration: Articles Table
-- Description: Create articles table for storing dharma content
-- Story: 3.1 - Article Display & Reading Interface

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- Author
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Publication
  status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Metadata
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0 NOT NULL,

  -- Categories (will be enhanced in Story 4.3)
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view published articles
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

-- RLS Policy: Authors can view their own articles (any status)
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = author_id);

-- RLS Policy: Authors can create articles
CREATE POLICY "Authors can create articles"
  ON articles FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    auth.uid() IN (
      SELECT user_id FROM user_profiles
      WHERE role IN ('author', 'admin')
    )
  );

-- RLS Policy: Authors can update own articles
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- RLS Policy: Authors can delete own draft articles
CREATE POLICY "Authors can delete own drafts"
  ON articles FOR DELETE
  USING (
    auth.uid() = author_id AND
    status = 'draft'
  );

-- RLS Policy: Admins can view all articles
CREATE POLICY "Admins can view all articles"
  ON articles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- RLS Policy: Admins can update any article
CREATE POLICY "Admins can update any article"
  ON articles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- RLS Policy: Admins can delete any article
CREATE POLICY "Admins can delete any article"
  ON articles FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Function to calculate reading time (200 words per minute)
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Count words by splitting on whitespace
  word_count := array_length(regexp_split_to_array(trim(content_text), '\s+'), 1);

  -- Return reading time in minutes (minimum 1 minute)
  RETURN GREATEST(1, CEIL(word_count / 200.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-update reading time
CREATE OR REPLACE FUNCTION update_article_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time_minutes := calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate reading time on insert/update
CREATE TRIGGER calculate_article_reading_time
  BEFORE INSERT OR UPDATE OF content ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_reading_time();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample articles for testing (optional - can be removed in production)
-- These will only be inserted if the articles table is empty
DO $$
DECLARE
  sample_author_id UUID;
BEGIN
  -- Get first author/admin user
  SELECT user_id INTO sample_author_id
  FROM user_profiles
  WHERE role IN ('author', 'admin')
  LIMIT 1;

  -- Only insert if we found an author and table is empty
  IF sample_author_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM articles LIMIT 1) THEN
    INSERT INTO articles (
      title,
      slug,
      excerpt,
      content,
      author_id,
      status,
      published_at,
      category
    ) VALUES (
      'The Four Noble Truths',
      'the-four-noble-truths',
      'An introduction to the foundational teachings of Buddhism: the truth of suffering, its origin, its cessation, and the path leading to its cessation.',
      E'# The Four Noble Truths\n\nThe Four Noble Truths are the essence of Buddha''s teachings. They form the foundation of Buddhist philosophy and practice.\n\n## 1. The Truth of Suffering (Dukkha)\n\nLife contains suffering. Birth is suffering, aging is suffering, illness is suffering, death is suffering. Being separated from what we love is suffering. Not getting what we want is suffering.\n\n## 2. The Truth of the Origin of Suffering (Samudaya)\n\nSuffering arises from craving and attachment. We crave pleasure, existence, and even non-existence. This craving leads to rebirth and continued suffering.\n\n## 3. The Truth of the Cessation of Suffering (Nirodha)\n\nSuffering can end. By eliminating craving and attachment, we can achieve liberation (Nirvana).\n\n## 4. The Truth of the Path (Magga)\n\nThe Noble Eightfold Path leads to the cessation of suffering:\n\n1. Right View\n2. Right Intention\n3. Right Speech\n4. Right Action\n5. Right Livelihood\n6. Right Effort\n7. Right Mindfulness\n8. Right Concentration\n\nBy following this path, we can transform our lives and find true peace.',
      sample_author_id,
      'published',
      NOW(),
      'Fundamentals'
    ),
    (
      'Mindfulness Meditation for Beginners',
      'mindfulness-meditation-for-beginners',
      'Learn the basics of mindfulness meditation and how to establish a daily practice that brings peace and clarity to your life.',
      E'# Mindfulness Meditation for Beginners\n\nMindfulness meditation is a simple yet profound practice that can transform your relationship with your thoughts, emotions, and daily experiences.\n\n## What is Mindfulness?\n\nMindfulness means paying attention to the present moment with openness, curiosity, and acceptance. It''s about being aware of what''s happening right now, without judgment.\n\n## Getting Started\n\n### Find a Quiet Space\n\nChoose a place where you won''t be disturbed. It doesn''t need to be completely silent, but it should be relatively peaceful.\n\n### Sit Comfortably\n\nYou can sit on a chair, cushion, or bench. Keep your back straight but not rigid. Rest your hands on your knees or in your lap.\n\n### Focus on Your Breath\n\nBring your attention to your breathing. Notice the sensation of air entering and leaving your nostrils, or the rise and fall of your chest or belly.\n\n### When Your Mind Wanders\n\nYour mind will wander - this is completely normal. When you notice you''ve been thinking, gently bring your attention back to your breath. Don''t judge yourself.\n\n## Building Your Practice\n\nStart with just 5-10 minutes daily. Consistency is more important than duration. As the practice becomes easier, you can gradually increase the time.\n\n## Benefits\n\nRegular mindfulness practice can:\n\n- Reduce stress and anxiety\n- Improve focus and concentration\n- Enhance emotional regulation\n- Increase self-awareness\n- Promote overall well-being\n\nRemember: meditation is a skill that develops with practice. Be patient and kind with yourself.',
      sample_author_id,
      'published',
      NOW() - INTERVAL '2 days',
      'Meditation'
    );
  END IF;
END $$;

-- Add helpful comment
COMMENT ON TABLE articles IS 'Stores dharma articles and content';
COMMENT ON COLUMN articles.slug IS 'URL-friendly unique identifier for the article';
COMMENT ON COLUMN articles.reading_time_minutes IS 'Automatically calculated based on word count (200 words/min)';
