import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * GET /api/featured
 * Get featured articles for homepage (public endpoint)
 * Story: 6.5 - Featured Content Management
 */
export async function GET(_request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Get featured articles with article details using the view
    const { data: featured, error } = await supabase
      .from('featured_articles_with_details')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(10);

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
  } catch (error) {
    console.error('Error in featured articles fetch:', error);
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
