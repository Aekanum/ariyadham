import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * User reading history management
 * Story 5.4: User Reading History & Bookmarks
 *
 * GET - List user's reading history
 * DELETE - Remove a specific reading history entry
 */

/**
 * GET /api/reading-history
 * List all reading history for the authenticated user
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - completed: boolean (optional filter by completed status)
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
    const completedFilter = searchParams.get('completed');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reading_history')
      .select(
        `
        id,
        article_id,
        user_id,
        scroll_percentage,
        time_spent_seconds,
        completed,
        completion_percentage,
        created_at,
        updated_at,
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
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by completed status if specified
    if (completedFilter !== null) {
      const completed = completedFilter === 'true';
      query = query.eq('completed', completed);
    }

    const { data: history, error, count } = await query;

    if (error) {
      console.error('List reading history error:', error);
      return NextResponse.json({ error: 'Failed to fetch reading history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        history: history || [],
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

/**
 * DELETE /api/reading-history
 * Remove a reading history entry
 * Body: { article_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const articleId = body.article_id;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Delete reading history entry
    const { error } = await supabase
      .from('reading_history')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete reading history error:', error);
      return NextResponse.json({ error: 'Failed to delete reading history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Reading history deleted successfully' },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
