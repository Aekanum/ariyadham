/**
 * Migration: Web Vitals Metrics Table
 * Story 7.2: Core Web Vitals & Performance
 *
 * Creates table for storing Web Vitals metrics collected from clients.
 * Used for performance monitoring and analytics.
 */

-- Create web_vitals_metrics table
CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who generated the metric (nullable for anonymous metrics)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metric information
  metric_name VARCHAR(10) NOT NULL CHECK (metric_name IN ('CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB')),
  metric_value NUMERIC NOT NULL,
  rating VARCHAR(20) NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),

  -- Additional metric data
  metric_id VARCHAR(255) NOT NULL,
  delta NUMERIC NOT NULL,
  navigation_type VARCHAR(50),

  -- Context information
  page_url TEXT NOT NULL,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Indexes for common queries
  CONSTRAINT unique_metric_per_session UNIQUE (metric_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_web_vitals_metrics_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX idx_web_vitals_metrics_created_at ON web_vitals_metrics(created_at DESC);
CREATE INDEX idx_web_vitals_metrics_rating ON web_vitals_metrics(rating);
CREATE INDEX idx_web_vitals_metrics_user_id ON web_vitals_metrics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_web_vitals_metrics_page_url ON web_vitals_metrics(page_url);

-- Composite index for time-series queries
CREATE INDEX idx_web_vitals_metrics_time_metric ON web_vitals_metrics(created_at DESC, metric_name);

-- Enable Row Level Security
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert metrics (for anonymous collection)
CREATE POLICY "Anyone can insert Web Vitals metrics"
  ON web_vitals_metrics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policy: Admins can view all metrics
CREATE POLICY "Admins can view all Web Vitals metrics"
  ON web_vitals_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policy: Users can view their own metrics
CREATE POLICY "Users can view their own Web Vitals metrics"
  ON web_vitals_metrics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add comment to table
COMMENT ON TABLE web_vitals_metrics IS 'Stores Web Vitals performance metrics (CLS, FCP, FID, INP, LCP, TTFB) collected from client browsers';

-- Add comments to columns
COMMENT ON COLUMN web_vitals_metrics.metric_name IS 'Type of Web Vitals metric: CLS, FCP, FID, INP, LCP, or TTFB';
COMMENT ON COLUMN web_vitals_metrics.metric_value IS 'Metric value in milliseconds (or unitless for CLS)';
COMMENT ON COLUMN web_vitals_metrics.rating IS 'Performance rating: good, needs-improvement, or poor';
COMMENT ON COLUMN web_vitals_metrics.delta IS 'Delta from previous measurement';
COMMENT ON COLUMN web_vitals_metrics.navigation_type IS 'Type of navigation that triggered the metric';
COMMENT ON COLUMN web_vitals_metrics.page_url IS 'URL of the page where metric was captured';
