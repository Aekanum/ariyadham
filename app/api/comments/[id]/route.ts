import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { CommentWithUser } from '@/types/comment';

/**
 * Individual comment operations
 * Story 5.2: Comments & Discussions
 *
 * PUT - Update a comment (within time limit)
 * DELETE - Soft delete a comment
 */

/**
 * PUT /api/comments/[id]
 * Update a comment (only within edit time limit)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: commentId } = await params;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comment content is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Fetch existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment
    if (existingComment.user_id !== user.id) {
      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userProfile || userProfile.role !== 'admin') {
        return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 });
      }
    }

    // Check edit time limit (15 minutes)
    const createdAt = new Date(existingComment.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > 15 && existingComment.user_id === user.id) {
      return NextResponse.json(
        { error: 'Comment can only be edited within 15 minutes of creation' },
        { status: 403 }
      );
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        *,
        user:users!comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (updateError) {
      console.error('Update comment error:', updateError);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        comment: updatedComment as unknown as CommentWithUser,
      },
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[id]
 * Soft delete a comment
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

    const { id: commentId } = await params;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Fetch existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment or is admin
    let isAdmin = false;
    if (existingComment.user_id !== user.id) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      isAdmin = userProfile?.role === 'admin';

      if (!isAdmin) {
        return NextResponse.json(
          { error: 'You can only delete your own comments' },
          { status: 403 }
        );
      }
    }

    // Soft delete comment by setting deleted_at and status
    const { error: deleteError } = await supabase
      .from('comments')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted',
      })
      .eq('id', commentId);

    if (deleteError) {
      console.error('Delete comment error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
