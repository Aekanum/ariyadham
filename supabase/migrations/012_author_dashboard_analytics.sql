-- Migration: Author Dashboard Analytics
-- Description: Create tables and views for tracking article analytics and author dashboard metrics
-- Story: 4.4 - Author Dashboard & Analytics

-- =============================================================================
-- Article Views Tracking Table
-- =============================================================================
-- This table tracks individual article views over time for analytics and charts
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous views
  ip_address INET, -- For deduplication
  user_agent TEXT, -- Browser/device info
  referrer TEXT, -- Where the view came from
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes for performance
  CONSTRAINT unique_view_per_user_article UNIQUE (article_id, user_id, DATE(viewed_at))
);

-- Indexes for article_views
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_article_date ON article_views(article_id, DATE(viewed_at));

-- Enable RLS for article_views
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert views (for tracking)
CREATE POLICY "Anyone can insert article views"
  ON article_views FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Authors can view analytics for their own articles
CREATE POLICY "Authors can view analytics for own articles"
  ON article_views FOR SELECT
  USING (
    article_id IN (
      SELECT id FROM articles WHERE author_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON article_views FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- =============================================================================
-- Function: Increment Article View Count
-- =============================================================================
-- This function increments the view_count on the articles table when a new view is recorded
CREATE OR REPLACE FUNCTION increment_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = NEW.article_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment view count when a new view is inserted
CREATE TRIGGER trigger_increment_article_view_count
  AFTER INSERT ON article_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_article_view_count();

-- =============================================================================
-- Author Dashboard Analytics View
-- =============================================================================
-- Materialized view for author dashboard statistics
-- This provides a fast lookup for dashboard data without complex queries

CREATE MATERIALIZED VIEW IF NOT EXISTS author_dashboard_stats AS
SELECT
  a.author_id,
  COUNT(DISTINCT a.id) as total_articles,
  COUNT(DISTINCT CASE WHEN a.status = 'published' THEN a.id END) as published_articles,
  COUNT(DISTINCT CASE WHEN a.status = 'draft' THEN a.id END) as draft_articles,
  COUNT(DISTINCT CASE WHEN a.status = 'scheduled' THEN a.id END) as scheduled_articles,
  SUM(a.view_count) as total_views,
  SUM(a.anjali_count) as total_anjali,
  SUM(a.comment_count) as total_comments,
  MAX(a.published_at) as last_published_at
FROM articles a
WHERE a.deleted_at IS NULL
GROUP BY a.author_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_author_dashboard_stats_author_id ON author_dashboard_stats(author_id);

-- =============================================================================
-- Article Daily Stats View
-- =============================================================================
-- This view aggregates article views by day for charts and trend analysis

CREATE OR REPLACE VIEW article_daily_stats AS
SELECT
  article_id,
  DATE(viewed_at) as view_date,
  COUNT(*) as views_count,
  COUNT(DISTINCT user_id) as unique_viewers
FROM article_views
GROUP BY article_id, DATE(viewed_at)
ORDER BY article_id, view_date DESC;

-- =============================================================================
-- Article Summary Stats View
-- =============================================================================
-- Complete article stats for the author dashboard with recent metrics

CREATE OR REPLACE VIEW article_summary_stats AS
SELECT
  a.id as article_id,
  a.title,
  a.slug,
  a.status,
  a.published_at,
  a.view_count as total_views,
  a.anjali_count as total_anjali,
  a.comment_count as total_comments,

  -- Last 7 days
  COALESCE((
    SELECT COUNT(*)
    FROM article_views av
    WHERE av.article_id = a.id
      AND av.viewed_at >= NOW() - INTERVAL '7 days'
  ), 0) as views_last_7_days,

  -- Last 30 days
  COALESCE((
    SELECT COUNT(*)
    FROM article_views av
    WHERE av.article_id = a.id
      AND av.viewed_at >= NOW() - INTERVAL '30 days'
  ), 0) as views_last_30_days,

  -- Last 90 days
  COALESCE((
    SELECT COUNT(*)
    FROM article_views av
    WHERE av.article_id = a.id
      AND av.viewed_at >= NOW() - INTERVAL '90 days'
  ), 0) as views_last_90_days

FROM articles a
WHERE a.deleted_at IS NULL;

-- =============================================================================
-- Function: Refresh Author Dashboard Stats
-- =============================================================================
-- Refreshes the materialized view for dashboard performance

CREATE OR REPLACE FUNCTION refresh_author_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY author_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Function: Track Article View (Public API)
-- =============================================================================
-- This function is called from the frontend to track article views
-- It handles deduplication and inserts into article_views

CREATE OR REPLACE FUNCTION track_article_view(
  p_article_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert view record
  -- The unique constraint will prevent duplicate views from same user on same day
  INSERT INTO article_views (
    article_id,
    user_id,
    ip_address,
    user_agent,
    referrer,
    viewed_at
  )
  VALUES (
    p_article_id,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_referrer,
    NOW()
  )
  ON CONFLICT (article_id, user_id, DATE(viewed_at)) DO NOTHING;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail (analytics shouldn't break the user experience)
  RAISE WARNING 'Error tracking article view: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION track_article_view TO authenticated;
GRANT EXECUTE ON FUNCTION track_article_view TO anon;

-- =============================================================================
-- Comments
-- =============================================================================
COMMENT ON TABLE article_views IS 'Tracks individual article views over time for analytics';
COMMENT ON MATERIALIZED VIEW author_dashboard_stats IS 'Aggregated statistics for author dashboard (refresh periodically)';
COMMENT ON VIEW article_daily_stats IS 'Daily view counts per article for trend charts';
COMMENT ON VIEW article_summary_stats IS 'Complete article statistics with time-based metrics';
COMMENT ON FUNCTION track_article_view IS 'Public API to track article views from the frontend';
COMMENT ON FUNCTION refresh_author_dashboard_stats IS 'Refreshes the materialized view for dashboard stats';
