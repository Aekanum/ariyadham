'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { optimizeImage, isValidImage, isValidFileSize, formatFileSize } from '@/lib/utils/image';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

/**
 * AvatarUpload Component
 *
 * Handles avatar image selection, preview, and upload to the server.
 * Features:
 * - Image preview before upload
 * - Client-side validation (file type and size)
 * - Image optimization before upload
 * - Loading states
 * - Error handling
 */
export default function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  onUploadError,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!isValidImage(file)) {
      const errorMsg = 'Invalid file type. Please select a JPEG, PNG, WebP, or GIF image.';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Validate file size (5MB max)
    if (!isValidFileSize(file, 5)) {
      const errorMsg = `File too large. Maximum size is 5MB. Your file is ${formatFileSize(
        file.size
      )}.`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start upload
      await handleUpload(file);
    } catch (err) {
      const errorMsg = 'Failed to process image';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      console.error('File change error:', err);
    }
  };

  /**
   * Upload image to server
   */
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Optimize image before upload
      const optimizedBlob = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        format: 'webp',
      });

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', optimizedBlob, 'avatar.webp');

      // Upload to server
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Update preview with server URL
      setPreview(data.data.avatarUrl);

      // Call success callback
      onUploadComplete(data.data.avatarUrl);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      console.error('Upload error:', err);

      // Reset preview on error
      setPreview(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Delete current avatar
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Delete failed');
      }

      setPreview(null);
      onUploadComplete('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      console.error('Delete error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger file input click
   */
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={`h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 ${
            isUploading ? 'opacity-50' : ''
          }`}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Avatar preview"
              className="h-full w-full object-cover"
              width={128}
              height={128}
              sizes="128px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-600">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Loading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={handleSelectFile}
          disabled={isUploading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          {preview ? 'Change Avatar' : 'Upload Avatar'}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUploading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
          >
            Remove
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-xs rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Upload Guidelines */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Maximum file size: 5MB
        <br />
        Supported formats: JPEG, PNG, WebP, GIF
      </p>
    </div>
  );
}
