'use client';

import { useState, FormEvent } from 'react';
import type { User } from '@/types/database';
import AvatarUpload from './AvatarUpload';

interface ProfileFormProps {
  initialData: User;
  onSuccess?: () => void;
}

/**
 * ProfileForm Component
 *
 * Form for editing user profile information.
 * Features:
 * - Name, bio, language preference editing
 * - Avatar upload integration
 * - Client-side validation
 * - Optimistic UI updates
 * - Error handling
 * - Loading states
 */
export default function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    bio: initialData.bio || '',
    language_preference: initialData.language_preference,
    avatar_url: initialData.avatar_url,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Name is required';
    } else if (formData.full_name.length > 255) {
      errors.full_name = 'Name must be less than 255 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle field-specific errors from server
        if (data.error?.details?.fields) {
          setFieldErrors(data.error.details.fields);
        } else {
          setError(data.error?.message || 'Failed to update profile');
        }
        return;
      }

      setSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle avatar upload completion
   */
  const handleAvatarUploadComplete = (avatarUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl || null,
    }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            Profile updated successfully!
          </p>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Profile Picture
        </label>
        <div className="mt-2">
          <AvatarUpload
            currentAvatarUrl={formData.avatar_url}
            onUploadComplete={handleAvatarUploadComplete}
            onUploadError={(err) => setError(err)}
          />
        </div>
      </div>

      {/* Full Name Field */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          value={formData.full_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
            fieldErrors.full_name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder="Enter your full name"
        />
        {fieldErrors.full_name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.full_name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.full_name.length}/255 characters
        </p>
      </div>

      {/* Bio Field */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
            fieldErrors.bio
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder="Tell us a little about yourself..."
        />
        {fieldErrors.bio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.bio}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Language Preference */}
      <div>
        <label
          htmlFor="language_preference"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Language Preference
        </label>
        <select
          id="language_preference"
          name="language_preference"
          value={formData.language_preference}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              language_preference: e.target.value as 'en' | 'th',
            }))
          }
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option value="en">English</option>
          <option value="th">ไทย (Thai)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This will be your preferred language for the interface
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setFormData({
              full_name: initialData.full_name || '',
              bio: initialData.bio || '',
              language_preference: initialData.language_preference,
              avatar_url: initialData.avatar_url,
            });
            setFieldErrors({});
            setError(null);
          }}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
