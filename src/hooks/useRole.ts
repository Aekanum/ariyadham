/**
 * useRole Hook
 *
 * Custom React hook for role-based access control in components.
 * Story 2.2: User Roles & Permissions
 *
 * IMPORTANT: Use for UI display logic only. Server-side validation required for security.
 */

import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database';

export interface UseRoleReturn {
  /**
   * Current user's role (undefined if not authenticated)
   */
  role: UserRole | undefined;

  /**
   * Check if user has any of the specified roles
   * @param allowedRoles - Array of roles to check
   * @returns true if user has one of the roles
   */
  hasRole: (allowedRoles: UserRole[]) => boolean;

  /**
   * Check if user has specific role
   * @param role - Role to check
   * @returns true if user has the role
   */
  is: (role: UserRole) => boolean;

  /**
   * Check if user has permission based on role hierarchy
   * admin > author > reader
   * @param requiredRole - Minimum required role
   * @returns true if user has sufficient permission
   */
  hasPermission: (requiredRole: UserRole) => boolean;

  /**
   * Convenience: Check if user is a reader
   */
  isReader: boolean;

  /**
   * Convenience: Check if user is an author or higher
   */
  isAuthor: boolean;

  /**
   * Convenience: Check if user is an admin
   */
  isAdmin: boolean;

  /**
   * Convenience: Check if user can create content (author or admin)
   */
  canCreateContent: boolean;

  /**
   * Convenience: Check if user can manage users (admin only)
   */
  canManageUsers: boolean;
}

/**
 * Hook for role-based access control
 *
 * @returns Role utilities and checks
 *
 * @example
 * function MyComponent() {
 *   const { isAdmin, canCreateContent, hasRole } = useRole();
 *
 *   if (isAdmin) {
 *     return <AdminPanel />;
 *   }
 *
 *   if (canCreateContent) {
 *     return <CreateButton />;
 *   }
 *
 *   return <ReaderView />;
 * }
 *
 * @example
 * function ConditionalButton() {
 *   const { hasPermission } = useRole();
 *
 *   // Only show to authors and admins
 *   if (!hasPermission('author')) {
 *     return null;
 *   }
 *
 *   return <button>Create Article</button>;
 * }
 */
export function useRole(): UseRoleReturn {
  const { user } = useAuth();

  const role = user?.role;

  /**
   * Role hierarchy mapping
   */
  const roleHierarchy: Record<UserRole, number> = {
    reader: 1,
    author: 2,
    admin: 3,
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user || !role) return false;
    return allowedRoles.includes(role);
  };

  /**
   * Check if user has specific role
   */
  const is = (checkRole: UserRole): boolean => {
    if (!user || !role) return false;
    return role === checkRole;
  };

  /**
   * Check if user has permission based on hierarchy
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user || !role) return false;
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  // Convenience flags
  const isReader = role === 'reader';
  const isAuthor = role === 'author' || role === 'admin';
  const isAdmin = role === 'admin';
  const canCreateContent = isAuthor || isAdmin;
  const canManageUsers = isAdmin;

  return {
    role,
    hasRole,
    is,
    hasPermission,
    isReader,
    isAuthor,
    isAdmin,
    canCreateContent,
    canManageUsers,
  };
}

/**
 * Hook variant that throws if user is not authenticated
 * Use this when you expect the component to always be in an authenticated context
 *
 * @throws {Error} If user is not authenticated
 *
 * @example
 * function ProtectedComponent() {
 *   const { role, isAdmin } = useRequireAuth();
 *   // Safe to use, will throw if not authenticated
 *   return <div>Role: {role}</div>;
 * }
 */
export function useRequireAuth(): UseRoleReturn & { role: UserRole } {
  const roleUtils = useRole();

  if (!roleUtils.role) {
    throw new Error('useRequireAuth must be used in an authenticated context');
  }

  return {
    ...roleUtils,
    role: roleUtils.role,
  };
}
