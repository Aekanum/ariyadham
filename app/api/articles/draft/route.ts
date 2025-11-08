import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { generateSlug } from '@/lib/utils/slugs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, excerpt } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = generateSlug(title);

    if (id) {
      // Update existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          title,
          content,
          excerpt,
          slug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('author_id', user.id) // Ensure user owns the article
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // Create new article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          content,
          excerpt,
          slug,
          author_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
