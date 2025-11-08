import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withRole } from '@/lib/middleware/roles';

/**
 * GET /api/admin/author-applications
 * Get all author applications (admin only)
 */
export async function GET(request: NextRequest) {
  return withRole(['admin'])(request, async () => {
    const supabase = createServerClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Build query
    let query = supabase
      .from('author_applications')
      .select(
        `
        *,
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

    // Get user email for each application
    const applicationsWithEmail = await Promise.all(
      (applications || []).map(async (app) => {
        const { data: userData } = await supabase.auth.admin.getUserById(app.user_id);
        return {
          ...app,
          user: {
            id: app.user_id,
            email: userData?.user?.email || '',
            full_name: app.user_profile?.full_name || '',
            avatar_url: app.user_profile?.avatar_url || null,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: applicationsWithEmail,
    });
  });
}
