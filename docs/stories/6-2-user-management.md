# Story 6.2: User Management

**Epic:** 6 - Admin & Moderation
**Status:** Done
**Created:** 2025-11-08
**Completed:** 2025-11-08

---

## Story

As an **admin**,
I want to **manage users (view, edit, delete, change roles)**,
So that **I can control platform access**.

---

## Acceptance Criteria

✅ **Given** an admin on the users management page
✅ **When** they search for a user
✅ **Then** matching users appear in a list
✅ **And** they can view user details

✅ **When** they change a user's role
✅ **Then** the change is saved and effective immediately

✅ **When** they click "Deactivate User"
✅ **Then** the user cannot log in
✅ **And** their profile is hidden from the public

---

## Prerequisites

- ✅ Story 1.3: Authentication Infrastructure
- ✅ Story 2.2: User Roles & Permissions

---

## Technical Notes

- Users management page: `/admin/users`
- Implement filtering and sorting
- Bulk actions (change role, deactivate multiple users)
- Audit log for user changes
- Cannot delete own admin account

---

## Implementation Details

### Database Changes

**Migration:** `016_user_action_logs.sql`

Created `user_action_logs` table for tracking user management actions:

- Tracks activate/deactivate actions
- Records who performed the action
- Stores reason and metadata
- Immutable audit trail with RLS policies

### API Endpoints

**GET /api/admin/users**

- List all users with pagination
- Search by name, email, or username
- Filter by role (reader/author/admin)
- Filter by status (active/inactive/all)
- Sort by created_at, email, role, or last_login_at
- Returns user list with pagination metadata

**POST /api/admin/users/:userId/role**

- Change user role (existing from Story 2.2)
- Validates role change
- Prevents self-demotion from admin
- Logs change to role_change_logs table

**POST /api/admin/users/:userId/deactivate**

- Activate or deactivate a user
- Prevents self-deactivation
- Accepts optional reason
- Logs action to user_action_logs table

### Frontend Components

**Page:** `/src/app/admin/users/page.tsx`

Features implemented:

- User list table with pagination
- Search functionality (name, email, username)
- Role filter dropdown
- Status filter (active/inactive/all)
- Sorting by multiple fields (created_at, email, role, last_login_at)
- Inline role change dropdown
- Activate/Deactivate buttons
- User detail modal
- Bulk selection with checkboxes
- Bulk actions:
  - Change role for multiple users
  - Deactivate multiple users
- Protection against self-modification
- Auto-refresh capability
- Responsive design with dark mode support

### Security Features

1. **Admin-only access**: All endpoints protected with `withAdmin` middleware
2. **Self-protection**: Cannot deactivate or demote own admin account
3. **Audit trail**: All role changes and activations logged
4. **RLS policies**: Database-level security on audit logs
5. **Input validation**: Zod schemas for request validation

### User Experience

- Real-time search with debouncing
- Inline role editing without page reload
- Confirmation dialogs for destructive actions
- Success/error feedback
- Bulk operations for efficiency
- User detail modal for quick viewing
- Pagination for performance
- Loading and error states

---

## Files Changed

### Created Files

- `/src/app/api/admin/users/route.ts` - User list API
- `/src/app/api/admin/users/[userId]/deactivate/route.ts` - User activation API
- `/src/app/admin/users/page.tsx` - User management page
- `/supabase/migrations/016_user_action_logs.sql` - Audit log table
- `/docs/stories/6-2-user-management.md` - This story file

### Modified Files

- `/docs/sprint-status.yaml` - Updated story status to done

---

## Testing Checklist

- [x] Admin can view user list
- [x] Search filters users correctly
- [x] Role filter works
- [x] Status filter works
- [x] Sorting works (all fields)
- [x] Pagination works
- [x] Can change user role
- [x] Role change is prevented for self
- [x] Can deactivate user
- [x] Deactivation is prevented for self
- [x] Can activate deactivated user
- [x] User detail modal displays correctly
- [x] Bulk selection works
- [x] Bulk role change works
- [x] Bulk deactivation works
- [x] Audit logs are created
- [x] Non-admin cannot access page
- [x] Responsive design works
- [x] Dark mode works

---

## Definition of Done

- [x] Code written and tested
- [x] API endpoints implemented
- [x] Frontend page implemented
- [x] Database migration created
- [x] Audit trail implemented
- [x] Security measures in place
- [x] Error handling implemented
- [x] Loading states implemented
- [x] Documentation updated
- [x] Code follows project standards
- [x] Type safety ensured
- [x] Responsive design
- [x] Dark mode support
- [x] Story documented
