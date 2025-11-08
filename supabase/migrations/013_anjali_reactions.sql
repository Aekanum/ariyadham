-- Migration: Anjali Reactions System
-- Description: Create anjali_reactions table and add denormalized counts to articles
-- Story: 5.1 - Anjali Button & Reactions

-- =============================================================================
-- Add Denormalized Count Columns to Articles
-- =============================================================================
-- Add anjali_count and comment_count to articles table for performance
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS anjali_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0 NOT NULL;

-- Add index for sorting by anjali count
CREATE INDEX IF NOT EXISTS idx_articles_anjali_count ON articles(anjali_count DESC);

-- =============================================================================
-- Create Anjali Reactions Table
-- =============================================================================
-- This table stores individual anjali reactions from users to articles
CREATE TABLE IF NOT EXISTS anjali_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one anjali per user per article
  CONSTRAINT unique_anjali_per_user_article UNIQUE (user_id, article_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_anjali_reactions_user_id ON anjali_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_anjali_reactions_article_id ON anjali_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_anjali_reactions_created_at ON anjali_reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE anjali_reactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for Anjali Reactions
-- =============================================================================

-- Policy: Anyone can view anjali reactions
CREATE POLICY "Anyone can view anjali reactions"
  ON anjali_reactions FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can add anjali reactions
CREATE POLICY "Authenticated users can add anjali reactions"
  ON anjali_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own anjali reactions
CREATE POLICY "Users can delete own anjali reactions"
  ON anjali_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can delete any anjali reaction (moderation)
CREATE POLICY "Admins can delete any anjali reaction"
  ON anjali_reactions FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- =============================================================================
-- Function: Increment Anjali Count
-- =============================================================================
-- This function increments the anjali_count on articles when a reaction is added
CREATE OR REPLACE FUNCTION increment_anjali_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles
  SET anjali_count = anjali_count + 1
  WHERE id = NEW.article_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment count when anjali is added
CREATE TRIGGER trigger_increment_anjali_count
  AFTER INSERT ON anjali_reactions
  FOR EACH ROW
  EXECUTE FUNCTION increment_anjali_count();

-- =============================================================================
-- Function: Decrement Anjali Count
-- =============================================================================
-- This function decrements the anjali_count on articles when a reaction is removed
CREATE OR REPLACE FUNCTION decrement_anjali_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles
  SET anjali_count = GREATEST(0, anjali_count - 1)
  WHERE id = OLD.article_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrement count when anjali is removed
CREATE TRIGGER trigger_decrement_anjali_count
  AFTER DELETE ON anjali_reactions
  FOR EACH ROW
  EXECUTE FUNCTION decrement_anjali_count();

-- =============================================================================
-- Function: Toggle Anjali Reaction (Public API)
-- =============================================================================
-- This function toggles anjali reaction for a user on an article
-- Returns the new state and count

CREATE OR REPLACE FUNCTION toggle_anjali_reaction(
  p_article_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  has_anjalied BOOLEAN,
  anjali_count INTEGER
) AS $$
DECLARE
  v_exists BOOLEAN;
  v_count INTEGER;
BEGIN
  -- Check if user has already given anjali
  SELECT EXISTS (
    SELECT 1 FROM anjali_reactions
    WHERE article_id = p_article_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove anjali
    DELETE FROM anjali_reactions
    WHERE article_id = p_article_id AND user_id = p_user_id;

    has_anjalied := FALSE;
  ELSE
    -- Add anjali
    INSERT INTO anjali_reactions (article_id, user_id)
    VALUES (p_article_id, p_user_id)
    ON CONFLICT (user_id, article_id) DO NOTHING;

    has_anjalied := TRUE;
  END IF;

  -- Get updated count
  SELECT a.anjali_count INTO v_count
  FROM articles a
  WHERE a.id = p_article_id;

  anjali_count := v_count;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_anjali_reaction TO authenticated;

-- =============================================================================
-- Function: Get Anjali Status (Public API)
-- =============================================================================
-- This function returns anjali status for an article and optionally for a user

CREATE OR REPLACE FUNCTION get_anjali_status(
  p_article_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  anjali_count INTEGER,
  user_has_anjalied BOOLEAN
) AS $$
DECLARE
  v_count INTEGER;
  v_has_anjalied BOOLEAN := FALSE;
BEGIN
  -- Get article anjali count
  SELECT a.anjali_count INTO v_count
  FROM articles a
  WHERE a.id = p_article_id;

  -- Check if user has given anjali (if user_id provided)
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM anjali_reactions
      WHERE article_id = p_article_id AND user_id = p_user_id
    ) INTO v_has_anjalied;
  END IF;

  anjali_count := COALESCE(v_count, 0);
  user_has_anjalied := v_has_anjalied;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_anjali_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_anjali_status TO anon;

-- =============================================================================
-- Initialize Anjali Counts for Existing Articles
-- =============================================================================
-- Update anjali_count for any existing articles based on actual reactions
UPDATE articles a
SET anjali_count = (
  SELECT COUNT(*)
  FROM anjali_reactions ar
  WHERE ar.article_id = a.id
)
WHERE anjali_count != (
  SELECT COUNT(*)
  FROM anjali_reactions ar
  WHERE ar.article_id = a.id
);

-- =============================================================================
-- Comments
-- =============================================================================
COMMENT ON TABLE anjali_reactions IS 'Stores anjali (gratitude) reactions from users to articles';
COMMENT ON COLUMN articles.anjali_count IS 'Denormalized count of anjali reactions (auto-updated by triggers)';
COMMENT ON COLUMN articles.comment_count IS 'Denormalized count of comments (to be used in Story 5.2)';
COMMENT ON FUNCTION toggle_anjali_reaction IS 'Public API to toggle anjali reaction on an article';
COMMENT ON FUNCTION get_anjali_status IS 'Public API to get anjali count and user status for an article';
