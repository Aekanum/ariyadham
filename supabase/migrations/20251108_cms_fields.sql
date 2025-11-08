-- Add CMS-specific fields to articles table
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS content_json JSONB,
  ADD COLUMN IF NOT EXISTS auto_saved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS is_auto_saved BOOLEAN DEFAULT FALSE;

-- Create index for author queries
CREATE INDEX IF NOT EXISTS idx_articles_author_status
  ON articles(author_id, status);

-- Add RLS policies for authors
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authors can create articles" ON articles;
  DROP POLICY IF EXISTS "Authors can update own articles" ON articles;
  DROP POLICY IF EXISTS "Authors can delete own drafts" ON articles;

  -- Create policy for inserting articles
  CREATE POLICY "Authors can create articles"
    ON articles FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = author_id AND
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('author', 'admin')
      )
    );

  -- Create policy for updating articles
  CREATE POLICY "Authors can update own articles"
    ON articles FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

  -- Create policy for deleting drafts
  CREATE POLICY "Authors can delete own drafts"
    ON articles FOR DELETE
    TO authenticated
    USING (
      auth.uid() = author_id AND
      status = 'draft'
    );
END $$;

-- Create article-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for article images
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authors can upload article images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;

  -- Policy for uploading images
  CREATE POLICY "Authors can upload article images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'article-images' AND
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('author', 'admin')
      )
    );

  -- Policy for viewing images
  CREATE POLICY "Public can view article images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'article-images');
END $$;
