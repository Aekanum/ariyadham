'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from '@/components/profile/ProfileForm';
import type { User } from '@/types/database';

/**
 * Profile Page
 *
 * Allows authenticated users to view and edit their profile.
 * Features:
 * - Protected route (requires authentication)
 * - Profile data fetching
 * - Profile editing via ProfileForm
 * - Loading and error states
 */
export default function ProfilePage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Redirect if not logged in
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to view your profile');
    }
  }, [isLoggedIn, authLoading, router]);

  /**
   * Fetch profile data
   */
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/profile');
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to load profile');
        }

        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, user]);

  /**
   * Handle profile update success
   */
  const handleProfileUpdateSuccess = async () => {
    // Refresh profile data
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  /**
   * Show loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  /**
   * Show error state
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <div className="mb-4 flex justify-center">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
            Error Loading Profile
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Show profile form
   */
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 sm:p-8">
          <ProfileForm initialData={profile} onSuccess={handleProfileUpdateSuccess} />
        </div>

        {/* Account Info */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Account Information
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{profile.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary/20">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Additional Settings Link (Future) */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need to change your password or email?{' '}
            <button
              onClick={() => router.push('/settings')}
              className="font-medium text-primary hover:text-primary/90"
            >
              Go to Settings
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
