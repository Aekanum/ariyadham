import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Track reading history for an article
 * Story 5.4: User Reading History & Bookmarks
 *
 * POST - Create or update reading history
 * GET - Get reading history for article
 */

/**
 * POST /api/articles/[id]/reading-history
 * Create or update reading history for the authenticated user
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

    // Parse request body
    const body = await _request.json().catch(() => ({}));
    const {
      scroll_percentage = 0,
      time_spent_seconds = 0,
      completed = false,
      completion_percentage = 0,
    } = body;

    // Validate values
    if (
      scroll_percentage < 0 ||
      scroll_percentage > 100 ||
      time_spent_seconds < 0 ||
      completion_percentage < 0 ||
      completion_percentage > 100
    ) {
      return NextResponse.json({ error: 'Invalid parameter values' }, { status: 400 });
    }

    // Verify article exists and is published
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, status')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'published') {
      return NextResponse.json({ error: 'Article is not published' }, { status: 403 });
    }

    // Check if reading history already exists
    const { data: existingHistory } = await supabase
      .from('reading_history')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single();

    let history;

    if (existingHistory) {
      // Update existing reading history
      const { data: updatedHistory, error: updateError } = await supabase
        .from('reading_history')
        .update({
          scroll_percentage: Math.max(existingHistory.scroll_percentage, scroll_percentage),
          time_spent_seconds: existingHistory.time_spent_seconds + time_spent_seconds,
          completed: completed || existingHistory.completed,
          completion_percentage: Math.max(
            existingHistory.completion_percentage,
            completion_percentage
          ),
        })
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update reading history error:', updateError);
        return NextResponse.json({ error: 'Failed to update reading history' }, { status: 500 });
      }

      history = updatedHistory;
    } else {
      // Create new reading history
      const { data: newHistory, error: insertError } = await supabase
        .from('reading_history')
        .insert({
          article_id: articleId,
          user_id: user.id,
          scroll_percentage,
          time_spent_seconds,
          completed,
          completion_percentage,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert reading history error:', insertError);
        return NextResponse.json({ error: 'Failed to create reading history' }, { status: 500 });
      }

      history = newHistory;
    }

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/articles/[id]/reading-history
 * Get reading history for an article for the authenticated user
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get reading history
    const { data: history, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Get reading history error:', error);
      return NextResponse.json({ error: 'Failed to get reading history' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: history || null,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
