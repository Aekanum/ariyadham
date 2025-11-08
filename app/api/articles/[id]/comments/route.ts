import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { CommentWithUser, CommentWithReplies, CommentSortOption } from '@/types/comment';

/**
 * Comments API endpoints for articles
 * Story 5.2: Comments & Discussions
 *
 * GET - Get all comments for an article (with nested replies)
 * POST - Create a new comment on an article
 */

/**
 * Build comment tree structure from flat list
 */
function buildCommentTree(comments: CommentWithUser[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const topLevelComments: CommentWithReplies[] = [];

  // First pass: create all comment nodes
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
      depth: 0,
    });
  });

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;

    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        node.depth = parent.depth + 1;
        parent.replies.push(node);
      } else {
        // Parent not found (might be deleted), treat as top-level
        topLevelComments.push(node);
      }
    } else {
      topLevelComments.push(node);
    }
  });

  return topLevelComments;
}

/**
 * GET /api/articles/[id]/comments
 * Get all comments for an article with nested replies
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const { id: articleId } = await params;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get('sort') as CommentSortOption) || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify article exists and is published
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, status')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'published') {
      return NextResponse.json({ error: 'Article is not published' }, { status: 403 });
    }

    // Get user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query for comments
    let query = supabase
      .from('comments')
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
      .eq('article_id', articleId)
      .is('deleted_at', null);

    // Apply status filter based on user role
    if (user) {
      // Authenticated users see published comments + their own
      query = query.or(`status.eq.published,user_id.eq.${user.id}`);
    } else {
      // Anonymous users only see published comments
      query = query.eq('status', 'published');
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: true });
    }

    // Fetch all comments (we'll paginate the top-level comments after building tree)
    const { data: commentsData, error: commentsError } = await query;

    if (commentsError) {
      console.error('Fetch comments error:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Type cast and build tree
    const comments = commentsData as unknown as CommentWithUser[];
    const commentTree = buildCommentTree(comments);

    // Count total top-level comments
    const totalCount = commentTree.length;

    // Paginate top-level comments
    const paginatedComments = commentTree.slice(offset, offset + limit);

    // Check if there are more comments
    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      success: true,
      data: {
        comments: paginatedComments,
        total_count: totalCount,
        has_more: hasMore,
        next_offset: hasMore ? offset + limit : undefined,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/articles/[id]/comments
 * Create a new comment on an article
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

    const { id: articleId } = await params;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { content, parent_comment_id } = body;

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

    // Verify article exists and is published
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, status')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot comment on unpublished articles' },
        { status: 403 }
      );
    }

    // If replying to a comment, verify parent exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, article_id')
        .eq('id', parent_comment_id)
        .is('deleted_at', null)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      if (parentComment.article_id !== articleId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this article' },
          { status: 400 }
        );
      }
    }

    // Create comment
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        user_id: user.id,
        parent_comment_id: parent_comment_id || null,
        content: content.trim(),
        status: 'published', // Auto-approve for MVP (can be 'pending' for moderation)
      })
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

    if (insertError) {
      console.error('Create comment error:', insertError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        comment: newComment as unknown as CommentWithUser,
      },
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
