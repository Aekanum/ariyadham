-- Migration: Add Full-Text Search Support
-- Story 3.3: Search Functionality
-- Description: Adds PostgreSQL full-text search capabilities to the articles table

-- Add tsvector column for full-text search
-- This generated column automatically indexes title, content, and excerpt
-- with different weights for relevance ranking:
-- - 'A' weight for title (highest priority)
-- - 'B' weight for content
-- - 'C' weight for excerpt
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'C')
) STORED;

-- Create GIN index for fast full-text search
-- GIN (Generalized Inverted Index) is optimized for full-text search
CREATE INDEX IF NOT EXISTS articles_search_idx
ON articles
USING GIN(search_vector);

-- Create index on published_at for sorting search results
CREATE INDEX IF NOT EXISTS articles_published_at_idx
ON articles(published_at DESC)
WHERE status = 'published';

-- Create index on view_count for sorting by popularity
CREATE INDEX IF NOT EXISTS articles_view_count_idx
ON articles(view_count DESC)
WHERE status = 'published';

-- Create composite index for status and published_at (commonly used together)
CREATE INDEX IF NOT EXISTS articles_status_published_at_idx
ON articles(status, published_at DESC);

-- Comments for documentation
COMMENT ON COLUMN articles.search_vector IS 'Full-text search vector with weighted fields: title (A), content (B), excerpt (C)';
COMMENT ON INDEX articles_search_idx IS 'GIN index for full-text search on articles';
COMMENT ON INDEX articles_published_at_idx IS 'Index for sorting search results by publication date';
COMMENT ON INDEX articles_view_count_idx IS 'Index for sorting search results by popularity';
COMMENT ON INDEX articles_status_published_at_idx IS 'Composite index for filtering published articles by date';

-- Example query to use this full-text search:
-- SELECT id, title, excerpt, ts_rank(search_vector, query) AS rank
-- FROM articles, to_tsquery('english', 'meditation & mindfulness') query
-- WHERE search_vector @@ query AND status = 'published'
-- ORDER BY rank DESC, published_at DESC
-- LIMIT 10;
