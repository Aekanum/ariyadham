-- Migration 014: Comments & Discussions Enhancements
-- Story 5.2: Enable threaded comments and discussions on articles
-- Created: 2025-11-08

-- ============================================================================
-- NOTES
-- ============================================================================
-- The comments table was created in migration 001_create_base_tables.sql
-- This migration adds enhancements and ensures all required functionality exists

-- ============================================================================
-- 1. VERIFY COMMENTS TABLE EXISTS (Reference)
-- ============================================================================
-- The comments table should have:
-- - id, article_id, user_id, parent_comment_id
-- - content, status, reply_count
-- - created_at, updated_at, deleted_at
-- - Indexes on article_id, user_id, parent_comment_id, status, created_at
-- - RLS policies
-- - Triggers for comment_count and updated_at

-- ============================================================================
-- 2. ADD MISSING INDEXES (If needed)
-- ============================================================================
-- Additional index for efficient reply fetching with status filter
CREATE INDEX IF NOT EXISTS idx_comments_parent_status
ON comments(parent_comment_id, status)
WHERE deleted_at IS NULL;

-- Index for user's comment history
CREATE INDEX IF NOT EXISTS idx_comments_user_created
ON comments(user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. ADD FUNCTION TO UPDATE REPLY COUNT
-- ============================================================================
-- Function to sync reply_count on parent comments
CREATE OR REPLACE FUNCTION sync_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a comment is inserted
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL AND NEW.deleted_at IS NULL THEN
    UPDATE comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;

  -- When a comment is soft deleted
  ELSIF TG_OP = 'UPDATE'
    AND NEW.parent_comment_id IS NOT NULL
    AND NEW.deleted_at IS NOT NULL
    AND OLD.deleted_at IS NULL THEN
    UPDATE comments
    SET reply_count = reply_count - 1
    WHERE id = NEW.parent_comment_id;

  -- When a comment is restored from soft delete
  ELSIF TG_OP = 'UPDATE'
    AND NEW.parent_comment_id IS NOT NULL
    AND NEW.deleted_at IS NULL
    AND OLD.deleted_at IS NOT NULL THEN
    UPDATE comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_comment_reply_count IS 'Automatically update reply_count on parent comments';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_reply_count ON comments;

-- Create trigger to sync reply counts
CREATE TRIGGER sync_reply_count
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION sync_comment_reply_count();

-- ============================================================================
-- 4. ADD HELPER FUNCTIONS FOR COMMENT OPERATIONS
-- ============================================================================

-- Function to get comment tree depth
CREATE OR REPLACE FUNCTION get_comment_depth(comment_uuid UUID)
RETURNS INT AS $$
DECLARE
  depth INT := 0;
  current_id UUID := comment_uuid;
  parent_id UUID;
BEGIN
  LOOP
    SELECT parent_comment_id INTO parent_id
    FROM comments
    WHERE id = current_id;

    EXIT WHEN parent_id IS NULL;

    depth := depth + 1;
    current_id := parent_id;

    -- Prevent infinite loops (max depth 10)
    EXIT WHEN depth >= 10;
  END LOOP;

  RETURN depth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_comment_depth IS 'Calculate the nesting depth of a comment (0 = top-level)';

-- Function to check if user can edit comment (within time limit)
CREATE OR REPLACE FUNCTION can_edit_comment(comment_uuid UUID, minutes_limit INT DEFAULT 15)
RETURNS BOOLEAN AS $$
DECLARE
  comment_user_id UUID;
  comment_created_at TIMESTAMPTZ;
  time_elapsed INTERVAL;
BEGIN
  SELECT user_id, created_at
  INTO comment_user_id, comment_created_at
  FROM comments
  WHERE id = comment_uuid AND deleted_at IS NULL;

  -- Comment doesn't exist or is deleted
  IF comment_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if current user is the comment author
  IF comment_user_id != auth.uid() THEN
    -- Check if user is admin
    IF EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;

  -- Check time limit
  time_elapsed := NOW() - comment_created_at;

  IF time_elapsed > (minutes_limit || ' minutes')::INTERVAL THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_edit_comment IS 'Check if current user can edit a comment (within 15 min time limit)';

-- ============================================================================
-- 5. ENHANCED RLS POLICIES
-- ============================================================================

-- Drop existing comment policies to recreate them with enhancements
DROP POLICY IF EXISTS "Published comments visible on published articles" ON comments;
DROP POLICY IF EXISTS "Users can create comments on published articles" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;

-- Policy: Users can view published comments on published articles
CREATE POLICY "Users can view published comments"
  ON comments
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      -- Published comments on published articles
      (status = 'published' AND article_id IN (
        SELECT id FROM articles WHERE status = 'published' AND deleted_at IS NULL
      ))
      -- Users can see their own comments regardless of status
      OR user_id = auth.uid()
      -- Admins can see all comments
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Authenticated users can create comments on published articles
CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND article_id IN (
      SELECT id FROM articles
      WHERE status = 'published' AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Policy: Users can update own comments within time limit
CREATE POLICY "Users can update own comments within time limit"
  ON comments
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
    AND can_edit_comment(id, 15)
  )
  WITH CHECK (
    user_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy: Users can soft delete own comments, admins can delete any
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  )
  WITH CHECK (
    -- Only allow setting deleted_at, not unsetting it
    deleted_at IS NOT NULL
  );

-- Policy: Admins can moderate comments (change status)
CREATE POLICY "Admins can moderate comments"
  ON comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON comments TO authenticated;
GRANT INSERT ON comments TO authenticated;
GRANT UPDATE ON comments TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION sync_comment_reply_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_depth(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_edit_comment(UUID, INT) TO authenticated;

-- ============================================================================
-- 7. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE comments IS 'Threaded comments on articles with nested reply support';
COMMENT ON COLUMN comments.parent_comment_id IS 'Reference to parent comment for threading (NULL for top-level comments)';
COMMENT ON COLUMN comments.status IS 'Comment moderation status: published, pending, approved, rejected, spam';
COMMENT ON COLUMN comments.reply_count IS 'Denormalized count of direct replies (for performance)';
COMMENT ON COLUMN comments.deleted_at IS 'Soft delete timestamp (NULL = active, NOT NULL = deleted)';

-- ============================================================================
-- ROLLBACK (For reference - do not execute)
-- ============================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS sync_reply_count ON comments;
-- DROP FUNCTION IF EXISTS can_edit_comment(UUID, INT);
-- DROP FUNCTION IF EXISTS get_comment_depth(UUID);
-- DROP FUNCTION IF EXISTS sync_comment_reply_count();
-- DROP INDEX IF EXISTS idx_comments_user_created;
-- DROP INDEX IF EXISTS idx_comments_parent_status;
