import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * GET /api/search
 * Search articles by keyword
 * Story 3.3: Search Functionality
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Validate query parameter
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Search query is required',
          code: 'INVALID_QUERY',
        },
      },
      { status: 400 }
    );
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid pagination parameters',
          code: 'INVALID_PAGINATION',
        },
      },
      { status: 400 }
    );
  }

  try {
    const offset = (page - 1) * limit;

    // Perform full-text search using PostgreSQL's to_tsquery
    // Search across title, content, and excerpt
    // Using ilike for now (will be replaced with full-text search after migration)
    const searchTerm = `%${query.trim()}%`;

    // Build the search query
    const { data: articles, error: searchError } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        author_id,
        published_at,
        reading_time_minutes,
        category,
        view_count,
        author:user_profiles!author_id (
          id:user_id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to search articles',
            code: 'SEARCH_ERROR',
          },
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`);

    if (countError) {
      console.error('Count error:', countError);
    }

    // Calculate pagination metadata
    const totalResults = count || 0;
    const totalPages = Math.ceil(totalResults / limit);

    return NextResponse.json({
      success: true,
      data: {
        articles: articles || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        query: query.trim(),
      },
    });
  } catch (error) {
    console.error('Unexpected search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
