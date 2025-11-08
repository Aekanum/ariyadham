import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Toggle Anjali reaction on an article
 * Story 5.1: Anjali Button & Reactions
 *
 * POST - Toggle anjali (add if not exists, remove if exists)
 * GET - Get anjali status for article
 */

/**
 * POST /api/articles/[id]/anjali
 * Toggle anjali reaction for the authenticated user
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await params;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Verify article exists and is published
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, status, author_id')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'published') {
      return NextResponse.json({ error: 'Article is not published' }, { status: 403 });
    }

    // Optional: Prevent authors from giving anjali to their own articles
    // Uncomment to enable this restriction
    // if (article.author_id === user.id) {
    //   return NextResponse.json({ error: 'Cannot anjali your own article' }, { status: 403 });
    // }

    // Call the database function to toggle anjali
    const { data, error } = await supabase.rpc('toggle_anjali_reaction', {
      p_article_id: articleId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Toggle anjali error:', error);
      return NextResponse.json({ error: 'Failed to toggle anjali reaction' }, { status: 500 });
    }

    // data is an array with one element from the function
    const result = data && data.length > 0 ? data[0] : null;

    if (!result) {
      return NextResponse.json({ error: 'Failed to toggle anjali reaction' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        has_anjalied: result.has_anjalied,
        anjali_count: result.anjali_count,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/articles/[id]/anjali
 * Get anjali status for an article (count + whether current user has anjalied)
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { id: articleId } = await params;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Call the database function to get anjali status
    const { data, error } = await supabase.rpc('get_anjali_status', {
      p_article_id: articleId,
      p_user_id: user?.id || null,
    });

    if (error) {
      console.error('Get anjali status error:', error);
      return NextResponse.json({ error: 'Failed to get anjali status' }, { status: 500 });
    }

    // data is an array with one element from the function
    const result = data && data.length > 0 ? data[0] : null;

    if (!result) {
      return NextResponse.json({
        success: true,
        data: {
          anjali_count: 0,
          user_has_anjalied: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        anjali_count: result.anjali_count,
        user_has_anjalied: result.user_has_anjalied,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
