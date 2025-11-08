import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withRole } from '@/lib/middleware/roles';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/admin/featured/[id]
 * Remove an article from featured list (admin only)
 * Story: 6.5 - Featured Content Management
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withRole(['admin'])(request, async () => {
    const supabase = createServerClient();

    try {

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Featured article ID is required',
              code: 'INVALID_INPUT',
            },
          },
          { status: 400 }
        );
      }

      // Check if featured article exists
      const { data: featured, error: fetchError } = await supabase
        .from('featured_articles')
        .select('id, article_id')
        .eq('id', id)
        .single();

      if (fetchError || !featured) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Featured article not found',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      // Delete featured article (trigger will automatically reorder remaining articles)
      const { error: deleteError } = await supabase.from('featured_articles').delete().eq('id', id);

      if (deleteError) {
        console.error('Error removing featured article:', deleteError);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Failed to remove featured article',
              code: 'DELETE_FAILED',
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Featured article removed successfully',
      });
    } catch (error) {
      console.error('Error in featured article deletion:', error);
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
