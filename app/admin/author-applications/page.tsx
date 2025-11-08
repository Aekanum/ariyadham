'use client';

import { useEffect, useState, useCallback } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import type { AuthorApplicationWithUser } from '@/types/database';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AuthorApplicationsPage() {
  const [applications, setApplications] = useState<AuthorApplicationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/author-applications?status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = async (
    applicationId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/author-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh applications
        fetchApplications();
      }
    } catch (error) {
      console.error('Failed to review application:', error);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Author Applications</h1>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('pending')}
            className={`rounded px-4 py-2 ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`rounded px-4 py-2 ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`rounded px-4 py-2 ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded px-4 py-2 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p>No applications found</p>
            ) : (
              applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onReview={handleReview}
                />
              ))
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function ApplicationCard({
  application,
  onReview,
}: {
  application: AuthorApplicationWithUser;
  onReview: (id: string, status: 'approved' | 'rejected', reason?: string) => void;
}) {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{application.user?.full_name || 'Unknown User'}</h3>
          <p className="text-sm text-gray-600">{application.user?.email || ''}</p>
        </div>
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            application.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : application.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Bio</h4>
          <p className="text-sm text-gray-600">{application.bio}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Credentials</h4>
          <p className="text-sm text-gray-600">{application.credentials}</p>
        </div>

        {application.motivation && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Motivation</h4>
            <p className="text-sm text-gray-600">{application.motivation}</p>
          </div>
        )}

        {application.writing_samples && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Writing Samples</h4>
            <p className="text-sm text-gray-600">{application.writing_samples}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700">Submitted</h4>
          <p className="text-sm text-gray-600">
            {new Date(application.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {application.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onReview(application.id, 'approved')}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectReason(true)}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}

      {showRejectReason && (
        <div className="mt-4">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="w-full rounded border p-2"
            rows={3}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                onReview(application.id, 'rejected', rejectReason);
                setShowRejectReason(false);
                setRejectReason('');
              }}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setShowRejectReason(false);
                setRejectReason('');
              }}
              className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {application.rejection_reason && (
        <div className="mt-4 rounded bg-red-50 p-3">
          <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
          <p className="text-sm text-red-700">{application.rejection_reason}</p>
        </div>
      )}

      {application.reviewed_at && (
        <div className="mt-4 text-sm text-gray-500">
          Reviewed on {new Date(application.reviewed_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
