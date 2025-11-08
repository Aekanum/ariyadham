'use client';

/**
 * RoleGuard Component
 *
 * Client-side role-based access control component.
 * Renders children only if user has required role.
 * Story 2.2: User Roles & Permissions
 *
 * IMPORTANT: This is for UX only. Server-side validation is required for security.
 */

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database';

export interface RoleGuardProps {
  /**
   * Roles that are allowed to see the content
   */
  allowedRoles: UserRole[];

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Optional fallback content to show if user doesn't have permission
   */
  fallback?: ReactNode;

  /**
   * Optional redirect path if user doesn't have permission
   * @default '/unauthorized'
   */
  redirectTo?: string;

  /**
   * If true, shows loading state while checking auth
   * @default true
   */
  showLoading?: boolean;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;
}

/**
 * RoleGuard Component
 *
 * Protects content based on user role.
 *
 * @example
 * // Only admins can see this
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </RoleGuard>
 *
 * @example
 * // Authors and admins can see this
 * <RoleGuard allowedRoles={['author', 'admin']}>
 *   <CMSEditor />
 * </RoleGuard>
 *
 * @example
 * // Show fallback instead of redirecting
 * <RoleGuard
 *   allowedRoles={['admin']}
 *   fallback={<p>You need admin access</p>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectTo = '/unauthorized',
  showLoading = true,
  loadingComponent,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    if (!showLoading) return null;

    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Check if user has required role
  const hasRole = allowedRoles.includes(user.role);

  if (!hasRole) {
    // Show fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise redirect
    router.push(redirectTo);
    return null;
  }

  // User has permission, render children
  return <>{children}</>;
}

/**
 * AdminGuard Component
 * Shorthand for admin-only content
 *
 * @example
 * <AdminGuard>
 *   <AdminDashboard />
 * </AdminGuard>
 */
export function AdminGuard({ children, ...props }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['admin']} {...props}>
      {children}
    </RoleGuard>
  );
}

/**
 * AuthorGuard Component
 * Shorthand for author and admin content
 *
 * @example
 * <AuthorGuard>
 *   <ArticleEditor />
 * </AuthorGuard>
 */
export function AuthorGuard({ children, ...props }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['author', 'admin']} {...props}>
      {children}
    </RoleGuard>
  );
}

/**
 * RoleGate Component
 * Renders different content based on user role
 *
 * @example
 * <RoleGate
 *   reader={<ReaderView />}
 *   author={<AuthorView />}
 *   admin={<AdminView />}
 * />
 */
export function RoleGate({
  reader,
  author,
  admin,
  loading: loadingContent,
}: {
  reader?: ReactNode;
  author?: ReactNode;
  admin?: ReactNode;
  loading?: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return loadingContent ? <>{loadingContent}</> : null;
  }

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <>{admin || author || reader}</>;
    case 'author':
      return <>{author || reader}</>;
    case 'reader':
    default:
      return <>{reader}</>;
  }
}
