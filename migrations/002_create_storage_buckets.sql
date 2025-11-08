-- Ariyadham Storage Buckets Setup
-- Version: 1.0
-- Date: 2025-11-08
-- Description: Create Supabase Storage buckets for user-uploaded content

-- ============================================================================
-- STORAGE BUCKET: avatars
-- ============================================================================
-- Bucket for user profile avatars
-- Public access for viewing, restricted upload to own user folder

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket for viewing
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES FOR AVATARS BUCKET
-- ============================================================================

-- Policy: Allow authenticated users to upload their own avatar
-- Users can only upload to their own folder (user_id)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow anyone to view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================================
-- STORAGE BUCKET: article-images
-- ============================================================================
-- Bucket for article featured images and inline content images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true, -- Public bucket for viewing
  10485760, -- 10MB file size limit for article images
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES FOR ARTICLE-IMAGES BUCKET
-- ============================================================================

-- Policy: Allow authors to upload article images
CREATE POLICY "Authors can upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-images'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('author', 'admin')
  )
);

-- Policy: Allow authors to update their article images
CREATE POLICY "Authors can update article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article-images'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('author', 'admin')
  )
);

-- Policy: Allow authors to delete their article images
CREATE POLICY "Authors can delete article images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-images'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('author', 'admin')
  )
);

-- Policy: Allow anyone to view article images (public bucket)
CREATE POLICY "Article images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- ============================================================================
-- STORAGE BUCKET: category-icons
-- ============================================================================
-- Bucket for category icons and badges (admin only)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-icons',
  'category-icons',
  true, -- Public bucket for viewing
  1048576, -- 1MB file size limit for icons
  ARRAY['image/svg+xml', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES FOR CATEGORY-ICONS BUCKET
-- ============================================================================

-- Policy: Allow admins to upload category icons
CREATE POLICY "Admins can upload category icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-icons'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy: Allow admins to update category icons
CREATE POLICY "Admins can update category icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'category-icons'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy: Allow admins to delete category icons
CREATE POLICY "Admins can delete category icons"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'category-icons'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy: Allow anyone to view category icons (public bucket)
CREATE POLICY "Category icons are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-icons');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- This migration creates all necessary storage buckets with appropriate
-- RLS policies for secure file upload and access control
