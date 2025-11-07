'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'reader' | 'author' | 'admin';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not logged in
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role requirement
      if (requiredRole && profile) {
        const roleHierarchy: Record<string, number> = {
          reader: 1,
          author: 2,
          admin: 3,
        };

        const userRoleLevel = roleHierarchy[profile.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, profile, isLoading, requiredRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || (requiredRole && profile && profile.role !== requiredRole)) {
    return null;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
