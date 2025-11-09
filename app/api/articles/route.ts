import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { cachedJson, CacheConfig } from '@/lib/cache';

/**
 * GET /api/articles
 * Get published articles with optional filtering
 * Query params: status, limit, offset, category
 *
 * Story 7.4: Caching Strategy
 * - Public articles are cached with SHORT strategy (30s)
 * - Private/draft articles are not cached
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch articles',
            code: 'FETCH_FAILED',
          },
        },
        { status: 500 }
      );
    }

    // Cache strategy: Only cache published articles (public data)
    const cacheStrategy = status === 'published' ? CacheConfig.SHORT : CacheConfig.NONE;

    return cachedJson(
      {
        success: true,
        data: articles || [],
      },
      cacheStrategy
    );
  } catch (error) {
    console.error('Error in articles fetch:', error);
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
}
