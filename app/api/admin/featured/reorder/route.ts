import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withRole } from '@/lib/middleware/roles';

/**
 * PUT /api/admin/featured/reorder
 * Reorder featured articles (admin only)
 * Body: { orderedIds: string[] } - Array of featured article IDs in new order
 * Story: 6.5 - Featured Content Management
 */
export async function PUT(request: NextRequest) {
  return withRole(['admin'])(request, async () => {
    const supabase = createServerClient();

    try {
      const body = await request.json();
      const { orderedIds } = body;

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'orderedIds must be a non-empty array',
              code: 'INVALID_INPUT',
            },
          },
          { status: 400 }
        );
      }

      // Update each featured article's display_order
      const updatePromises = orderedIds.map((id, index) =>
        supabase
          .from('featured_articles')
          .update({ display_order: index + 1 })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);

      // Check if any updates failed
      const failedUpdates = results.filter((result) => result.error);
      if (failedUpdates.length > 0) {
        console.error('Error reordering featured articles:', failedUpdates);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to reorder some featured articles',
              code: 'REORDER_FAILED',
            },
          },
          { status: 500 }
        );
      }

      // Fetch updated list
      const { data: featured } = await supabase
        .from('featured_articles_with_details')
        .select('*')
        .order('display_order', { ascending: true });

      return NextResponse.json({
        success: true,
        data: featured || [],
        message: 'Featured articles reordered successfully',
      });
    } catch (error) {
      console.error('Error in reordering:', error);
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
