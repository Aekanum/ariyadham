import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * User bookmarks management
 * Story 5.4: User Reading History & Bookmarks
 *
 * GET - List user's bookmarks
 * DELETE - Remove a specific bookmark
 */

/**
 * GET /api/bookmarks
 * List all bookmarks for the authenticated user
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - folder: string (optional filter by folder)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const folder = searchParams.get('folder') || undefined;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('bookmarks')
      .select(
        `
        id,
        article_id,
        user_id,
        folder_name,
        created_at,
        article:articles (
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          reading_time_minutes,
          author:authors (
            id,
            user_id,
            user:users (
              full_name,
              username,
              avatar_url
            )
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by folder if specified
    if (folder) {
      query = query.eq('folder_name', folder);
    }

    const { data: bookmarks, error, count } = await query;

    if (error) {
      console.error('List bookmarks error:', error);
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookmarks: bookmarks || [],
        total: count || 0,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
