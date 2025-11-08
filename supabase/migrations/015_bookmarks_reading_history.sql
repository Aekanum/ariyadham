-- Migration: Bookmarks and Reading History
-- Story: 5.4 - User Reading History & Bookmarks
-- Created: 2025-11-08
-- Description: Create tables for bookmarks and reading history tracking

-- =============================================================================
-- Table: bookmarks
-- Purpose: Save articles for later reading
-- =============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_name VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_bookmark_per_user_article UNIQUE (article_id, user_id)
);

-- Indexes for bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_folder_name ON bookmarks(folder_name) WHERE folder_name IS NOT NULL;

-- RLS Policies for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY bookmarks_select_own
    ON bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY bookmarks_insert_own
    ON bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY bookmarks_delete_own
    ON bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Users can update their own bookmarks (e.g., change folder)
CREATE POLICY bookmarks_update_own
    ON bookmarks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Table: reading_history
-- Purpose: Track user reading progress and engagement
-- =============================================================================

CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scroll_percentage INT DEFAULT 0 CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100),
    time_spent_seconds INT DEFAULT 0 CHECK (time_spent_seconds >= 0),
    completed BOOLEAN DEFAULT false,
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_reading_history_per_user_article UNIQUE (article_id, user_id)
);

-- Indexes for reading_history
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX idx_reading_history_updated_at ON reading_history(updated_at DESC);
CREATE INDEX idx_reading_history_completed ON reading_history(completed) WHERE completed = true;

-- RLS Policies for reading_history
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reading history
CREATE POLICY reading_history_select_own
    ON reading_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own reading history
CREATE POLICY reading_history_insert_own
    ON reading_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reading history
CREATE POLICY reading_history_update_own
    ON reading_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reading history
CREATE POLICY reading_history_delete_own
    ON reading_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- Triggers
-- =============================================================================

-- Trigger to update reading_history.updated_at on changes
CREATE OR REPLACE FUNCTION update_reading_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reading_history_updated_at
    BEFORE UPDATE ON reading_history
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_history_updated_at();

-- Trigger to update articles.bookmark_count when bookmarks added/removed
CREATE OR REPLACE FUNCTION update_article_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE articles
        SET bookmark_count = bookmark_count + 1
        WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE articles
        SET bookmark_count = bookmark_count - 1
        WHERE id = OLD.article_id AND bookmark_count > 0;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_bookmark_count_insert
    AFTER INSERT ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_article_bookmark_count();

CREATE TRIGGER trigger_update_article_bookmark_count_delete
    AFTER DELETE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_article_bookmark_count();

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE bookmarks IS 'Save articles for later reading';
COMMENT ON TABLE reading_history IS 'Track user reading progress and engagement';

COMMENT ON COLUMN bookmarks.folder_name IS 'Optional folder/collection for organizing bookmarks';
COMMENT ON COLUMN reading_history.scroll_percentage IS 'How far user scrolled (0-100%)';
COMMENT ON COLUMN reading_history.time_spent_seconds IS 'Total time spent reading article';
COMMENT ON COLUMN reading_history.completed IS 'Whether user finished reading';
COMMENT ON COLUMN reading_history.completion_percentage IS 'Estimated reading completion (0-100%)';
