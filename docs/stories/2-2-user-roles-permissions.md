# Story 2.2: User Roles & Permissions

**Epic**: 2 - Authentication & User Management
**Status**: 📋 READY FOR DEV
**Started**: -
**Completed**: -

---

## Story

**As a** system
**I want to** manage different user roles (reader, author, admin)
**So that** features and access are properly controlled

---

## Acceptance Criteria

### ✅ Role-Based Access Control

**Given** a user with 'author' role
**When** they try to access the CMS
**Then** they can create and edit articles

**Given** a user with 'reader' role
**When** they try to access the CMS
**Then** they see "not authorized" message

**Given** a user with 'admin' role
**When** they access the admin dashboard
**Then** they see user management, content moderation, analytics

**And** roles can be assigned only by existing admins
**And** role changes are logged for audit purposes

### Implementation Checklist

- [ ] Add role column to user_profiles table
- [ ] Create role enum type in database
- [ ] Update user type to include role field
- [ ] Implement role-based middleware for API routes
- [ ] Create useAuth hook with role checking functions
- [ ] Add role guards for protected routes
- [ ] Create RLS policies based on roles
- [ ] Add admin-only role assignment functionality
- [ ] Implement audit logging for role changes
- [ ] Create unauthorized/forbidden pages
- [ ] Update navigation to show/hide based on role
- [ ] Add role indicators in UI

---

## Technical Implementation

### 1. Database Schema Updates

**Table: `user_profiles`** - Add role column

```sql
-- Create role enum type
CREATE TYPE user_role AS ENUM ('reader', 'author', 'admin');

-- Add role column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN role user_role DEFAULT 'reader' NOT NULL;

-- Create index for role lookups
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Update RLS policies to include role checks
-- Example: Authors can create articles
CREATE POLICY "Authors can create articles"
  ON articles FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles
      WHERE role IN ('author', 'admin')
    )
  );
```

**Table: `role_change_logs`** - Audit trail for role changes

```sql
CREATE TABLE role_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can view logs
CREATE POLICY "Admins can view role change logs"
  ON role_change_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );
```

### 2. TypeScript Types

**Update `src/types/database.ts`:**

```typescript
export type UserRole = 'reader' | 'author' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  language_preference: 'en' | 'th';
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface RoleChangeLog {
  id: string;
  user_id: string;
  old_role?: UserRole;
  new_role: UserRole;
  changed_by: string;
  reason?: string;
  created_at: string;
}
```

### 3. Role-Based Middleware

**File: `src/lib/middleware/roles.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

/**
 * Check if user has required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ authorized: boolean; user?: any; role?: UserRole }> {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false };
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return { authorized: false, user };
  }

  const userRole = profile.role as UserRole;
  const authorized = allowedRoles.includes(userRole);

  return { authorized, user, role: userRole };
}

/**
 * Middleware factory for role-based access
 */
export function withRole(allowedRoles: UserRole[]) {
  return async function middleware(
    request: NextRequest,
    handler: (req: NextRequest, user: any, role: UserRole) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const { authorized, user, role } = await requireRole(request, allowedRoles);

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: 'FORBIDDEN'
          }
        },
        { status: 403 }
      );
    }

    return handler(request, user, role!);
  };
}
```

### 4. Client-Side Role Guards

**File: `src/components/auth/RoleGuard.tsx`**

```typescript
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Client-side role guard component
 * Shows content only if user has allowed role
 */
export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectTo = '/unauthorized',
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const hasRole = allowedRoles.includes(user.role);

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
}
```

**Custom Hook: `src/hooks/useRole.ts`**

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isReader = user?.role === 'reader';
  const isAuthor = user?.role === 'author' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return {
    role: user?.role,
    hasRole,
    isReader,
    isAuthor,
    isAdmin,
  };
}
```

### 5. Admin Role Management API

**File: `app/api/admin/users/[userId]/role/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withRole } from '@/lib/middleware/roles';
import { z } from 'zod';

const updateRoleSchema = z.object({
  newRole: z.enum(['reader', 'author', 'admin']),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/users/:userId/role
 * Update user role (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return withRole(['admin'])(request, async (req, adminUser, adminRole) => {
    const supabase = createServerSupabaseClient();
    const targetUserId = params.userId;

    // Validate request body
    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { newRole, reason } = validation.data;

    // Get current role
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', targetUserId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'User not found' },
        },
        { status: 404 }
      );
    }

    const oldRole = currentProfile.role;

    // Update role
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', targetUserId);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Failed to update role' },
        },
        { status: 500 }
      );
    }

    // Log the change
    await supabase.from('role_change_logs').insert({
      user_id: targetUserId,
      old_role: oldRole,
      new_role: newRole,
      changed_by: adminUser.id,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        oldRole,
        newRole,
      },
    });
  });
}
```

### 6. Unauthorized Page

**File: `app/unauthorized/page.tsx`**

Already exists - ensure it shows appropriate message and links back to allowed areas.

### 7. Protected Route Examples

**CMS Dashboard** (`app/cms/page.tsx`):

```typescript
import RoleGuard from '@/components/auth/RoleGuard';

export default function CMSPage() {
  return (
    <RoleGuard allowedRoles={['author', 'admin']}>
      <div>
        <h1>Content Management System</h1>
        {/* CMS content */}
      </div>
    </RoleGuard>
  );
}
```

**Admin Dashboard** (`app/admin/page.tsx`):

```typescript
import RoleGuard from '@/components/auth/RoleGuard';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </RoleGuard>
  );
}
```

---

## Files to Create/Modify

```
app/
├── api/
│   └── admin/
│       └── users/
│           └── [userId]/
│               └── role/
│                   └── route.ts          # Role management API
├── admin/
│   └── page.tsx                          # Admin dashboard (create)
├── cms/
│   └── page.tsx                          # CMS dashboard (create)
src/
├── components/
│   └── auth/
│       └── RoleGuard.tsx                 # Role guard component
├── hooks/
│   └── useRole.ts                        # Role checking hook
├── lib/
│   └── middleware/
│       └── roles.ts                      # Role middleware
├── types/
│   └── database.ts                       # Add UserRole type
├── contexts/
│   └── AuthContext.tsx                   # Update to include role
supabase/
└── migrations/
    └── 007_user_roles.sql                # Role schema migration
```

---

## Prerequisites

- Story 1.3 ✅ (Authentication Infrastructure)
- Story 2.1 ✅ (User Profile Management)

---

## Dependencies

**Existing:**

- `@supabase/supabase-js` - Supabase client
- `zod` - Validation
- `react` - React hooks

**No new dependencies needed**

---

## Quality Checks

### Type Safety

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Manual Testing

- [ ] Reader cannot access CMS
- [ ] Reader cannot access admin dashboard
- [ ] Author can access CMS
- [ ] Author cannot access admin dashboard
- [ ] Admin can access both CMS and admin dashboard
- [ ] Admin can change user roles
- [ ] Role changes are logged in audit table
- [ ] Unauthorized users redirected properly
- [ ] Role indicators show correctly in UI
- [ ] RLS policies enforce role restrictions

---

## Security Considerations

### Authorization

- All role checks must happen server-side
- Client-side guards are UX only, not security
- RLS policies are the ultimate authority
- Never trust role from client

### Role Hierarchy

- reader < author < admin
- Admin has all author permissions
- Author has all reader permissions
- Future: implement permission granularity

### Audit Trail

- All role changes must be logged
- Include who made the change and why
- Logs are immutable (no delete policy)
- Only admins can view audit logs

### Edge Cases

- Handle users with no role (default to reader)
- Prevent self-demotion for admins
- Require at least one admin exists
- Handle concurrent role changes

---

## Accessibility

- Clearly communicate unauthorized access
- Provide helpful links to allowed areas
- Keyboard navigation for admin controls
- Screen reader announcements for role changes

---

## Next Steps

After completing Story 2.2:

### Story 2.3: Author Approval Workflow

Create system for users to request author status and for admins to approve/reject.

### Story 2.4: User Preferences & Settings

Expand user settings with additional preferences beyond profile.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 2.2, lines 277-310)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **Next.js Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

## Implementation Notes

### Design Principles

1. **Security First**: Server-side validation is mandatory
2. **Least Privilege**: Users get minimum necessary permissions
3. **Auditability**: All permission changes are logged
4. **User Experience**: Clear feedback for unauthorized access
5. **Extensibility**: Easy to add new roles or permissions

### Best Practices

- Use RLS as primary security mechanism
- Client guards for UX, not security
- Log all administrative actions
- Test edge cases thoroughly
- Document role capabilities clearly
- Consider permission sets for future

### Role Capabilities

**Reader:**
- View public articles
- Comment on articles (if enabled)
- Manage own profile
- Bookmark articles
- Give Anjali reactions

**Author:**
- All reader capabilities
- Create/edit own articles
- Submit articles for approval
- View article analytics
- Access CMS dashboard

**Admin:**
- All author capabilities
- Approve/reject articles
- Manage user roles
- Access admin dashboard
- View analytics
- Moderate content
- Manage featured content

---

🙏 May this feature ensure proper access control while maintaining ease of use.
