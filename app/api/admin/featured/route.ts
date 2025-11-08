import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withRole } from '@/lib/middleware/roles';

/**
 * GET /api/admin/featured
 * Get all featured articles (admin only)
 * Story: 6.5 - Featured Content Management
 */
export async function GET(request: NextRequest) {
  return withRole(['admin'])(request, async () => {
    const supabase = createServerClient();

    // Get featured articles with article details using the view
    const { data: featured, error } = await supabase
      .from('featured_articles_with_details')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured articles:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch featured articles',
            code: 'FETCH_FAILED',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: featured || [],
    });
  });
}

/**
 * POST /api/admin/featured
 * Add an article to featured list (admin only)
 * Body: { articleId: string }
 */
export async function POST(request: NextRequest) {
  return withRole(['admin'])(request, async (_req, user) => {
    const supabase = createServerClient();

    try {
      const body = await request.json();
      const { articleId } = body;

      if (!articleId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Article ID is required',
              code: 'INVALID_INPUT',
            },
          },
          { status: 400 }
        );
      }

      // Check if article exists and is published
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('id, status, title')
        .eq('id', articleId)
        .single();

      if (articleError || !article) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Article not found',
              code: 'ARTICLE_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      if (article.status !== 'published') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Only published articles can be featured',
              code: 'ARTICLE_NOT_PUBLISHED',
            },
          },
          { status: 400 }
        );
      }

      // Check if article is already featured
      const { data: existing } = await supabase
        .from('featured_articles')
        .select('id')
        .eq('article_id', articleId)
        .single();

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Article is already featured',
              code: 'ALREADY_FEATURED',
            },
          },
          { status: 400 }
        );
      }

      // Check current count of featured articles (limit to 10)
      const { count } = await supabase
        .from('featured_articles')
        .select('*', { count: 'exact', head: true });

      if (count !== null && count >= 10) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Maximum of 10 featured articles reached',
              code: 'LIMIT_REACHED',
            },
          },
          { status: 400 }
        );
      }

      // Get the next display order
      const { data: lastFeatured } = await supabase
        .from('featured_articles')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = lastFeatured ? lastFeatured.display_order + 1 : 1;

      // Add to featured articles
      const { data: newFeatured, error: insertError } = await supabase
        .from('featured_articles')
        .insert({
          article_id: articleId,
          display_order: nextOrder,
          featured_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error adding featured article:', insertError);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to add featured article',
              code: 'INSERT_FAILED',
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: newFeatured,
          message: 'Article featured successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error in featured article creation:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        },
        { status: 500 }
      );
    }
  });
}
