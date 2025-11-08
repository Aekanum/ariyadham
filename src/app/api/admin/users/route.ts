/**
 * Admin API: User Management
 *
 * Story 6.2: User Management
 *
 * GET /api/admin/users - List all users with search and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withAdmin } from '@/lib/middleware/roles';

/**
 * User list response item
 */
export interface UserListItem {
  id: string;
  email: string;
  full_name: string | null;
  username: string;
  role: 'reader' | 'author' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  email_verified: boolean;
}

/**
 * GET /api/admin/users
 *
 * Fetch all users with optional search and filtering
 *
 * Query Parameters:
 * - search: Search by name, email, or username
 * - role: Filter by role (reader|author|admin)
 * - status: Filter by active status (active|inactive|all)
 * - sortBy: Sort field (created_at|email|role|last_login_at)
 * - sortOrder: Sort order (asc|desc)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 *
 * @param request - Next.js request
 * @returns JSON response with user list
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAdmin(request, async () => {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') as 'reader' | 'author' | 'admin' | null;
    const statusFilter = searchParams.get('status') || 'all'; // active|inactive|all
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    try {
      // Build query
      let query = supabase.from('user_profiles').select(
        `
          user_id,
          email,
          full_name,
          username,
          role,
          is_active,
          created_at,
          last_login_at,
          email_verified
        `,
        { count: 'exact' }
      );

      // Apply search filter
      if (search) {
        query = query.or(
          `email.ilike.%${search}%,full_name.ilike.%${search}%,username.ilike.%${search}%`
        );
      }

      // Apply role filter
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      // Apply status filter
      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      }

      // Apply sorting
      const validSortFields = ['created_at', 'email', 'role', 'last_login_at', 'full_name'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to fetch users',
              code: 'FETCH_ERROR',
              details: error.message,
            },
          },
          { status: 500 }
        );
      }

      // Transform data to match interface
      const users: UserListItem[] = (data || []).map((user) => ({
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        email_verified: user.email_verified,
      }));

      return NextResponse.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Unexpected error occurred',
            code: 'INTERNAL_ERROR',
          },
        },
        { status: 500 }
      );
    }
  });
}
