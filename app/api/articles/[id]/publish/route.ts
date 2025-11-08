import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Publish an article immediately
 * Story 4.2: Article Publishing & Scheduling
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

    // Update article status to published
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        scheduled_publish_at: null, // Clear any scheduled time
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Publish error:', error);
      return NextResponse.json({ error: 'Failed to publish article' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
