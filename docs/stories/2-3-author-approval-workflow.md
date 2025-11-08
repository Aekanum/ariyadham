# Story 2.3: Author Approval Workflow

**Epic**: 2 - Authentication & User Management
**Status**: ✅ COMPLETED
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As an** admin
**I want to** approve users requesting to become authors
**So that** content quality is maintained

---

## Acceptance Criteria

### ✅ Author Application Process

**Given** a user applies to become an author
**When** they submit their request with a bio and credentials
**Then** admin receives a notification (in-app or email)

**When** admin approves the request
**Then** user's role becomes 'author'
**And** they receive confirmation email
**And** can access the CMS

**When** admin rejects the request
**Then** user is notified with optional reason

### Implementation Checklist

- [ ] Create author_applications table
- [ ] Add application status enum (pending, approved, rejected)
- [ ] Create API endpoint for submitting applications
- [ ] Create API endpoints for admin approval/rejection
- [ ] Build "Apply as Author" form for users
- [ ] Create admin dashboard view for pending applications
- [ ] Implement notification system (in-app)
- [ ] Add email templates for approval/rejection
- [ ] Implement RLS policies for application data
- [ ] Update AuthContext to reflect role changes
- [ ] Add application status page for users
- [ ] Create audit logging for application decisions

---

## Technical Implementation

### 1. Database Schema

**Table: `author_applications`**

```sql
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

CREATE TABLE author_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application details
  bio TEXT NOT NULL,
  credentials TEXT NOT NULL,
  writing_samples TEXT,
  motivation TEXT,

  -- Status tracking
  status application_status DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT one_application_per_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_author_applications_user_id ON author_applications(user_id);
CREATE INDEX idx_author_applications_status ON author_applications(status);
CREATE INDEX idx_author_applications_created_at ON author_applications(created_at DESC);

-- RLS Policies
ALTER TABLE author_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON author_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own applications (if no existing application)
CREATE POLICY "Users can create own applications"
  ON author_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM author_applications
      WHERE user_id = auth.uid()
    )
  );

-- Users can withdraw their pending applications
CREATE POLICY "Users can withdraw pending applications"
  ON author_applications FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'withdrawn'
  );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON author_applications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON author_applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_author_applications_updated_at
  BEFORE UPDATE ON author_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. TypeScript Types

**Update `src/types/database.ts`:**

```typescript
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface AuthorApplication {
  id: string;
  user_id: string;
  bio: string;
  credentials: string;
  writing_samples?: string;
  motivation?: string;
  status: ApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorApplicationWithUser extends AuthorApplication {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ReviewApplicationRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}
```

### 3. API Routes

**File: `app/api/author-application/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createApplicationSchema = z.object({
  bio: z.string().min(100).max(1000),
  credentials: z.string().min(50).max(2000),
  writing_samples: z.string().optional(),
  motivation: z.string().min(100).max(1000),
});

/**
 * POST /api/author-application
 * Submit author application
 */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // Validate request body
  const body = await request.json();
  const validation = createApplicationSchema.safeParse(body);

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

  const { bio, credentials, writing_samples, motivation } = validation.data;

  // Check if user already has an application
  const { data: existingApplication } = await supabase
    .from('author_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .single();

  if (existingApplication) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'You already have an application',
          code: 'APPLICATION_EXISTS',
          details: { status: existingApplication.status },
        },
      },
      { status: 409 }
    );
  }

  // Create application
  const { data: application, error: createError } = await supabase
    .from('author_applications')
    .insert({
      user_id: user.id,
      bio,
      credentials,
      writing_samples,
      motivation,
      status: 'pending',
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create application',
          code: 'CREATE_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: application,
  });
}

/**
 * GET /api/author-application
 * Get current user's application
 */
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // Get user's application
  const { data: application, error: fetchError } = await supabase
    .from('author_applications')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // No application found
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch application',
          code: 'FETCH_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: application,
  });
}
```

**File: `app/api/admin/author-applications/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withRole } from '@/lib/middleware/roles';

/**
 * GET /api/admin/author-applications
 * Get all author applications (admin only)
 */
export async function GET(request: NextRequest) {
  return withRole(['admin'])(request, async (req, adminUser, adminRole) => {
    const supabase = createServerSupabaseClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Build query
    let query = supabase
      .from('author_applications')
      .select(
        `
        *,
        user:auth.users!user_id (
          id,
          email
        ),
        user_profile:user_profiles!user_id (
          full_name,
          avatar_url
        )
      `
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch applications',
            code: 'FETCH_FAILED',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: applications,
    });
  });
}
```

**File: `app/api/admin/author-applications/[applicationId]/review/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withRole } from '@/lib/middleware/roles';
import { z } from 'zod';

const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

type RouteParams = {
  params: Promise<{ applicationId: string }>;
};

/**
 * POST /api/admin/author-applications/:applicationId/review
 * Approve or reject author application (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { applicationId } = await params;

  return withRole(['admin'])(request, async (req, adminUser, adminRole) => {
    const supabase = createServerSupabaseClient();

    // Validate request body
    const body = await request.json();
    const validation = reviewApplicationSchema.safeParse(body);

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

    const { status, reason } = validation.data;

    // Get application
    const { data: application, error: fetchError } = await supabase
      .from('author_applications')
      .select('*, user_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Application not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if already reviewed
    if (application.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Application already reviewed',
            code: 'ALREADY_REVIEWED',
          },
        },
        { status: 409 }
      );
    }

    // Update application
    const { error: updateError } = await supabase
      .from('author_applications')
      .update({
        status,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? reason : null,
      })
      .eq('id', applicationId);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update application',
            code: 'UPDATE_FAILED',
          },
        },
        { status: 500 }
      );
    }

    // If approved, update user role
    if (status === 'approved') {
      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'author' })
        .eq('user_id', application.user_id);

      if (roleError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to update user role',
              code: 'ROLE_UPDATE_FAILED',
            },
          },
          { status: 500 }
        );
      }

      // Log role change
      await supabase.from('role_change_logs').insert({
        user_id: application.user_id,
        old_role: 'reader',
        new_role: 'author',
        changed_by: adminUser.id,
        reason: 'Author application approved',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status,
      },
    });
  });
}
```

### 4. UI Components

**File: `src/components/author/ApplyAuthorForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyAuthorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: '',
    credentials: '',
    writing_samples: '',
    motivation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/author-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit application');
      }

      // Redirect to application status page
      router.push('/author/application/status');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio (100-1000 characters)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          required
          minLength={100}
          maxLength={1000}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Tell us about yourself..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.bio.length}/1000 characters
        </p>
      </div>

      <div>
        <label htmlFor="credentials" className="block text-sm font-medium">
          Credentials & Experience (50-2000 characters)
        </label>
        <textarea
          id="credentials"
          name="credentials"
          rows={4}
          required
          minLength={50}
          maxLength={2000}
          value={formData.credentials}
          onChange={(e) =>
            setFormData({ ...formData, credentials: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Your background, education, experience with dharma..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.credentials.length}/2000 characters
        </p>
      </div>

      <div>
        <label htmlFor="writing_samples" className="block text-sm font-medium">
          Writing Samples (optional)
        </label>
        <textarea
          id="writing_samples"
          name="writing_samples"
          rows={3}
          value={formData.writing_samples}
          onChange={(e) =>
            setFormData({ ...formData, writing_samples: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Links to your writing or sample text..."
        />
      </div>

      <div>
        <label htmlFor="motivation" className="block text-sm font-medium">
          Why do you want to become an author? (100-1000 characters)
        </label>
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          required
          minLength={100}
          maxLength={1000}
          value={formData.motivation}
          onChange={(e) =>
            setFormData({ ...formData, motivation: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="What motivates you to share dharma with others?"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.motivation.length}/1000 characters
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

**File: `app/admin/author-applications/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import type { AuthorApplicationWithUser } from '@/types/database';

export default function AuthorApplicationsPage() {
  const [applications, setApplications] = useState<AuthorApplicationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
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
  };

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected', reason?: string) => {
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
          <h3 className="text-lg font-semibold">{application.user_profile?.full_name}</h3>
          <p className="text-sm text-gray-600">{application.user?.email}</p>
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

        <div>
          <h4 className="text-sm font-medium text-gray-700">Motivation</h4>
          <p className="text-sm text-gray-600">{application.motivation}</p>
        </div>

        {application.writing_samples && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Writing Samples</h4>
            <p className="text-sm text-gray-600">{application.writing_samples}</p>
          </div>
        )}
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
    </div>
  );
}
```

---

## Files to Create/Modify

```
app/
├── api/
│   ├── author-application/
│   │   └── route.ts                          # Submit/get application
│   └── admin/
│       └── author-applications/
│           ├── route.ts                      # List all applications
│           └── [applicationId]/
│               └── review/
│                   └── route.ts              # Approve/reject
├── admin/
│   └── author-applications/
│       └── page.tsx                          # Admin dashboard
├── author/
│   ├── apply/
│   │   └── page.tsx                          # Application form page
│   └── application/
│       └── status/
│           └── page.tsx                      # Application status page
src/
├── components/
│   └── author/
│       └── ApplyAuthorForm.tsx               # Application form component
├── types/
│   └── database.ts                           # Add application types
supabase/
└── migrations/
    └── 008_author_applications.sql           # Application schema migration
```

---

## Prerequisites

- Story 2.1 ✅ (User Profile Management)
- Story 2.2 ✅ (User Roles & Permissions)

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

- [ ] User can submit author application
- [ ] Duplicate applications are prevented
- [ ] Admin can view all pending applications
- [ ] Admin can approve application and role is updated
- [ ] Admin can reject application with reason
- [ ] User receives appropriate feedback
- [ ] RLS policies enforce access control
- [ ] Role change is logged in audit table
- [ ] Application status is displayed correctly
- [ ] Withdrawn applications work properly

---

## Security Considerations

### Authorization

- Only authenticated users can apply
- Users can only view their own application
- Only admins can review applications
- Role updates trigger audit logging
- RLS policies enforce all access control

### Validation

- All form inputs are validated
- Character limits enforced
- Status transitions validated
- Prevent duplicate applications
- Prevent re-reviewing already processed applications

### Data Protection

- Personal information (bio, credentials) protected by RLS
- Only admins and application owner can view details
- Audit trail for all admin actions
- No ability to delete applications (for record-keeping)

---

## Accessibility

- Form fields properly labeled
- Error messages clear and helpful
- Keyboard navigation supported
- Screen reader friendly
- Character count feedback for text areas
- Clear status indicators

---

## Next Steps

After completing Story 2.3:

### Story 2.4: User Preferences & Settings

Expand user settings with additional preferences beyond profile (theme, font size, language preferences).

---

## References

- **Epic Definition**: `docs/epics.md` (Story 2.3, lines 312-342)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`
- **Story 2.2**: `docs/stories/2-2-user-roles-permissions.md`
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

## Implementation Notes

### Design Principles

1. **Quality Control**: Manual review ensures content quality
2. **Transparency**: Clear communication of application status
3. **Auditability**: All decisions logged for accountability
4. **User Experience**: Simple application process
5. **Scalability**: Can handle growing author base

### Best Practices

- Keep application form simple and focused
- Provide clear guidelines for applicants
- Set expectations for review timeline
- Use consistent status terminology
- Make rejection reasons constructive
- Track metrics on application approval rates

### Application Review Criteria

Admins should consider:

1. **Writing Quality**: Sample writing or credentials
2. **Dharma Knowledge**: Understanding of Buddhist teachings
3. **Motivation**: Genuine interest in sharing dharma
4. **Fit**: Alignment with platform values
5. **Communication**: Clear, respectful communication style

---

🙏 May this feature help identify and empower authors who will share dharma with wisdom and compassion.
