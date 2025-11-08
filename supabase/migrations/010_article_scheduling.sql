-- Migration: Article Scheduling
-- Description: Add scheduling capability for articles
-- Story: 4.2 - Article Publishing & Scheduling

-- Add scheduled_publish_at column for scheduled publishing
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

-- Update the status check constraint to include 'scheduled'
ALTER TABLE articles
DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE articles
ADD CONSTRAINT articles_status_check
CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

-- Create index for scheduled articles for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_publish_at
ON articles(scheduled_publish_at)
WHERE status = 'scheduled' AND scheduled_publish_at IS NOT NULL;

-- Function to auto-publish scheduled articles
CREATE OR REPLACE FUNCTION auto_publish_scheduled_articles()
RETURNS INTEGER AS $$
DECLARE
  published_count INTEGER;
BEGIN
  -- Update articles that are scheduled and past their publish time
  WITH updated AS (
    UPDATE articles
    SET
      status = 'published',
      published_at = scheduled_publish_at,
      updated_at = NOW()
    WHERE
      status = 'scheduled'
      AND scheduled_publish_at IS NOT NULL
      AND scheduled_publish_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO published_count FROM updated;

  RETURN published_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate scheduled_publish_at is in the future when scheduling
CREATE OR REPLACE FUNCTION validate_scheduled_publish_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is scheduled, ensure scheduled_publish_at is set and in the future
  IF NEW.status = 'scheduled' THEN
    IF NEW.scheduled_publish_at IS NULL THEN
      RAISE EXCEPTION 'scheduled_publish_at must be set when status is scheduled';
    END IF;

    IF NEW.scheduled_publish_at <= NOW() THEN
      RAISE EXCEPTION 'scheduled_publish_at must be in the future';
    END IF;
  END IF;

  -- If publishing now, set published_at to now if not already set
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    IF NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
  END IF;

  -- Clear scheduled_publish_at if status changes from scheduled
  IF OLD.status = 'scheduled' AND NEW.status != 'scheduled' THEN
    NEW.scheduled_publish_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_article_scheduling ON articles;
CREATE TRIGGER validate_article_scheduling
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION validate_scheduled_publish_at();

-- Add helpful comments
COMMENT ON COLUMN articles.scheduled_publish_at IS 'Timestamp when a scheduled article should be automatically published';
COMMENT ON FUNCTION auto_publish_scheduled_articles() IS 'Function to be called by cron job to auto-publish scheduled articles';
