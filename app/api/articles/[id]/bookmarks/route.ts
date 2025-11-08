import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Toggle bookmark on an article
 * Story 5.4: User Reading History & Bookmarks
 *
 * POST - Toggle bookmark (add if not exists, remove if exists)
 * GET - Get bookmark status for article
 */

/**
 * POST /api/articles/[id]/bookmarks
 * Toggle bookmark for the authenticated user
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

    // Parse request body for optional folder_name
    const body = await _request.json().catch(() => ({}));
    const folderName = body.folder_name || null;

    // Verify article exists and is published
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, status, bookmark_count')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'published') {
      return NextResponse.json({ error: 'Article is not published' }, { status: 403 });
    }

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single();

    let hasBookmarked = false;
    let bookmarkCount = article.bookmark_count;

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Delete bookmark error:', deleteError);
        return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
      }

      hasBookmarked = false;
    } else {
      // Add bookmark
      const { error: insertError } = await supabase.from('bookmarks').insert({
        article_id: articleId,
        user_id: user.id,
        folder_name: folderName,
      });

      if (insertError) {
        console.error('Insert bookmark error:', insertError);
        return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
      }

      hasBookmarked = true;
    }

    // Get updated bookmark count
    const { data: updatedArticle } = await supabase
      .from('articles')
      .select('bookmark_count')
      .eq('id', articleId)
      .single();

    if (updatedArticle) {
      bookmarkCount = updatedArticle.bookmark_count;
    }

    return NextResponse.json({
      success: true,
      data: {
        has_bookmarked: hasBookmarked,
        bookmark_count: bookmarkCount,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/articles/[id]/bookmarks
 * Get bookmark status for an article (count + whether current user has bookmarked)
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

    // Get article bookmark count
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('bookmark_count')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    let userHasBookmarked = false;

    if (user) {
      // Check if user has bookmarked
      const { data: bookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .single();

      userHasBookmarked = !!bookmark;
    }

    return NextResponse.json({
      success: true,
      data: {
        bookmark_count: article.bookmark_count || 0,
        user_has_bookmarked: userHasBookmarked,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
