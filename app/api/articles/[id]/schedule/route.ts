import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Schedule an article for future publication
 * Story 4.2: Article Publishing & Scheduling
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { scheduled_publish_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    if (!scheduled_publish_at) {
      return NextResponse.json({ error: 'Scheduled publish time is required' }, { status: 400 });
    }

    // Validate that the scheduled time is in the future
    const scheduledDate = new Date(scheduled_publish_at);
    const now = new Date();

    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled publish time must be in the future' },
        { status: 400 }
      );
    }

    // First, verify the article belongs to the user
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, author_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if user is the author or admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAuthor = article.author_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update article status to scheduled
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'scheduled',
        scheduled_publish_at: scheduledDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Schedule error:', error);
      return NextResponse.json({ error: 'Failed to schedule article' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Cancel a scheduled publication
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // First, verify the article belongs to the user
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, author_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if user is the author or admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAuthor = article.author_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Revert article to draft status
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'draft',
        scheduled_publish_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Cancel schedule error:', error);
      return NextResponse.json(
        { error: 'Failed to cancel scheduled publication' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
