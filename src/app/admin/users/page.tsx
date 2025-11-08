'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserListItem } from '@/app/api/admin/users/route';
import type { UserRole } from '@/types/database';

/**
 * Admin User Management Page
 *
 * Story: 6.2 - User Management
 *
 * Features:
 * - Protected route (requires admin role)
 * - User list with search and filtering
 * - Sort by various fields
 * - Change user roles
 * - Activate/deactivate users
 * - Bulk actions support
 * - Pagination
 * - Audit trail tracking
 */
export default function AdminUsersPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'email' | 'role' | 'last_login_at'>(
    'created_at'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Redirect if not logged in or not an admin
   */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access user management');
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      router.push('/unauthorized?message=Only administrators can access this page');
    }
  }, [isLoggedIn, authLoading, user, router]);

  /**
   * Fetch users with current filters
   */
  const fetchUsers = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;

    try {
      setError(null);

      const params = new URLSearchParams({
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '20',
      });

      if (roleFilter !== 'all') {
        params.set('role', roleFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load users');
      }

      setUsers(data.data.users);
      setTotal(data.data.pagination.total);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user, search, roleFilter, statusFilter, sortBy, sortOrder, page]);

  /**
   * Fetch users on mount and when filters change
   */
  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'admin') return;
    fetchUsers();
  }, [isLoggedIn, user, fetchUsers]);

  /**
   * Handle role change for a user
   */
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to change role');
      }

      // Refresh user list
      await fetchUsers();
      alert('Role changed successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change role');
      console.error('Role change error:', err);
    }
  };

  /**
   * Handle user activation/deactivation
   */
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const reason = prompt(`Reason for ${action}ing this user (optional):`);

    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentStatus,
          reason: reason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || `Failed to ${action} user`);
      }

      // Refresh user list
      await fetchUsers();
      alert(`User ${action}d successfully`);
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} user`);
      console.error('Toggle active error:', err);
    }
  };

  /**
   * Handle bulk role change
   */
  const handleBulkRoleChange = async (newRole: UserRole) => {
    if (selectedUsers.size === 0) {
      alert('Please select users first');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to change the role of ${selectedUsers.size} users to ${newRole}?`
      )
    ) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const userId of selectedUsers) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newRole }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setSelectedUsers(new Set());
    await fetchUsers();
    alert(`Bulk role change: ${successCount} succeeded, ${failCount} failed`);
  };

  /**
   * Handle bulk deactivation
   */
  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select users first');
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${selectedUsers.size} users?`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const userId of selectedUsers) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: false }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setSelectedUsers(new Set());
    await fetchUsers();
    alert(`Bulk deactivation: ${successCount} succeeded, ${failCount} failed`);
  };

  /**
   * Toggle user selection
   */
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  /**
   * Select/deselect all users
   */
  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  /**
   * Loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchUsers();
            }}
            className="mt-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, email, or username..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole | 'all');
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="reader">Reader</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'active' | 'inactive' | 'all');
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'created_at' | 'email' | 'role' | 'last_login_at')
                  }
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="created_at">Join Date</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="last_login_at">Last Login</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="rounded-md bg-gray-200 px-3 py-2 dark:bg-gray-600"
                  title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkRoleChange('reader')}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Set as Reader
                </button>
                <button
                  onClick={() => handleBulkRoleChange('author')}
                  className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                >
                  Set as Author
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Table */}
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(userItem.id)}
                        onChange={() => toggleUserSelection(userItem.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {userItem.full_name || userItem.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{userItem.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {userItem.email}
                      {!userItem.email_verified && (
                        <span className="ml-2 text-xs text-yellow-600">⚠ Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value as UserRole)}
                        disabled={userItem.id === user?.id}
                        className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                      >
                        <option value="reader">Reader</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          userItem.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(userItem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setIsModalOpen(true);
                          }}
                          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View
                        </button>
                        {userItem.id !== user?.id && (
                          <button
                            onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                            className={`text-sm hover:underline ${
                              userItem.is_active
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {userItem.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {users.length} of {total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded bg-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * User Detail Modal Component
 */
interface UserDetailModalProps {
  user: UserListItem;
  onClose: () => void;
}

function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <DetailRow label="ID" value={user.id} />
          <DetailRow label="Username" value={user.username} />
          <DetailRow label="Full Name" value={user.full_name || 'N/A'} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow
            label="Email Verified"
            value={user.email_verified ? 'Yes' : 'No'}
            valueClass={user.email_verified ? 'text-green-600' : 'text-red-600'}
          />
          <DetailRow label="Role" value={user.role} />
          <DetailRow
            label="Status"
            value={user.is_active ? 'Active' : 'Inactive'}
            valueClass={user.is_active ? 'text-green-600' : 'text-red-600'}
          />
          <DetailRow label="Joined" value={new Date(user.created_at).toLocaleString()} />
          <DetailRow
            label="Last Login"
            value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail Row Component
 */
interface DetailRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function DetailRow({ label, value, valueClass }: DetailRowProps) {
  return (
    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
      <span className={`text-gray-900 dark:text-white ${valueClass || ''}`}>{value}</span>
    </div>
  );
}
