'use client';

import { useEffect, useState } from 'react';
import { AuthorApplication } from '@/types/database';
import Link from 'next/link';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function ApplicationStatusPage() {
  const [application, setApplication] = useState<AuthorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await fetch('/api/author-application');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch application');
      }

      setApplication(data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Author Application</h1>
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="mb-4">You haven&apos;t submitted an author application yet.</p>
          <Link
            href="/author/apply"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Author Application Status</h1>

      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Application</h2>
            {getStatusBadge(application.status)}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Bio</h3>
              <p className="text-sm text-gray-600">{application.bio}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Credentials & Experience</h3>
              <p className="text-sm text-gray-600">{application.credentials}</p>
            </div>

            {application.writing_samples && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Writing Samples</h3>
                <p className="text-sm text-gray-600">{application.writing_samples}</p>
              </div>
            )}

            {application.motivation && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Motivation</h3>
                <p className="text-sm text-gray-600">{application.motivation}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700">Submitted On</h3>
              <p className="text-sm text-gray-600">
                {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>

            {application.reviewed_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Reviewed On</h3>
                <p className="text-sm text-gray-600">
                  {new Date(application.reviewed_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {application.rejection_reason && (
              <div className="rounded-md bg-red-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-red-800">Rejection Reason</h3>
                <p className="text-sm text-red-700">{application.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {application.status === 'pending' && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Your application is currently under review. We will notify you via email once a
              decision has been made. This process usually takes 3-5 business days.
            </p>
          </div>
        )}

        {application.status === 'approved' && (
          <div className="rounded-lg bg-green-50 p-4">
            <p className="mb-2 text-sm font-semibold text-green-800">
              Congratulations! Your application has been approved.
            </p>
            <p className="mb-4 text-sm text-green-700">
              You can now access the Content Management System and start creating articles.
            </p>
            <Link
              href="/cms"
              className="inline-block rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Go to CMS
            </Link>
          </div>
        )}

        {application.status === 'rejected' && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">
              We appreciate your interest in becoming an author. Unfortunately, your application was
              not approved at this time. You may reapply after addressing the feedback provided.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
