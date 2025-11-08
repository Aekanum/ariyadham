# Story 5.2: Comments & Discussions

**Epic:** 5 - Community & Engagement
**Status:** Completed
**Date Started:** 2025-11-08
**Date Completed:** 2025-11-08

## Overview

As a reader, I want to comment on articles and discuss dharma with others, so that we can engage in meaningful conversations.

## Acceptance Criteria

### Basic Comment Functionality

- [ ] Logged-in reader at an article's comment section can see a comment form
- [ ] User can type a comment and submit
- [ ] Comment appears below the article after submission
- [ ] Comment shows user's name, avatar, and timestamp
- [ ] Only authenticated users can comment
- [ ] Anonymous users see prompt to log in

### Reply and Threading

- [ ] User can reply to an existing comment
- [ ] Reply appears nested under the parent comment
- [ ] Comment hierarchy is visually clear (indentation)
- [ ] Parent commenter is notified (optional for MVP)
- [ ] Comments show the number of replies
- [ ] User can collapse/expand comment threads

### Display and Sorting

- [ ] Recent comments are expanded by default
- [ ] Older comments can be collapsed/expanded
- [ ] Comments can be sorted (newest first, oldest first)
- [ ] Comment count is displayed prominently
- [ ] Pagination or infinite scroll for many comments
- [ ] Empty state when no comments exist

### Moderation (Optional for MVP)

- [ ] Comments require approval before appearing (configurable)
- [ ] Flagged comments can be hidden
- [ ] Users can edit their own comments (within time limit)
- [ ] Users can delete their own comments
- [ ] Deleted comments show "[Comment deleted]" placeholder

## Prerequisites

- Story 1.3: Authentication Infrastructure
- Story 3.1: Article Display & Reading Interface
- Database table for comments exists (from Story 1.2)

## Implementation Details

### Database Changes

**Migration:** `014_comments_enhancements.sql`

The comments table should have (or be verified):

- `id` (UUID, primary key)
- `article_id` (UUID, references articles)
- `user_id` (UUID, references users)
- `parent_comment_id` (UUID, references comments, nullable)
- `content` (text)
- `status` (enum: 'published', 'pending', 'deleted')
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `deleted_at` (timestamp, nullable)

Additional enhancements:

- Add `comment_count` denormalized field to articles table (if not exists)
- Add `reply_count` denormalized field to comments table
- Create trigger to update comment_count on articles
- Create trigger to update reply_count on parent comments
- Add indexes for performance:
  - Index on `article_id` for fetching article comments
  - Index on `parent_comment_id` for fetching replies
  - Index on `user_id` for user's comment history
- Add RLS policies for comments:
  - Users can read published comments
  - Users can create comments (authenticated only)
  - Users can update/delete their own comments
  - Admins can moderate all comments

### Type Updates

**File:** `src/types/comment.ts` (new)

Define comment-related types:

- `CommentStatus` enum
- `Comment` interface with nested replies
- `CreateCommentRequest` type
- `UpdateCommentRequest` type
- `CommentWithUser` type (includes user profile)
- `CommentTree` type for nested structure

**File:** `src/types/article.ts` (modified)

- Add `comment_count` field to Article interface (if not exists)

### API Endpoints

**New Endpoints:**

1. `GET /api/articles/[id]/comments` - Get all comments for an article
   - Query params: `sort` (newest/oldest), `limit`, `offset`
   - Returns paginated list of comments with nested replies
   - Returns comment count
   - Includes user profile data (name, avatar)

2. `POST /api/articles/[id]/comments` - Create a new comment
   - Body: `{ content, parent_comment_id? }`
   - Validates user is authenticated
   - Validates content is not empty
   - Creates comment with 'published' or 'pending' status
   - Returns created comment with user data
   - Updates article comment_count

3. `PUT /api/comments/[id]` - Update a comment
   - Body: `{ content }`
   - Validates user owns the comment
   - Validates edit time limit (e.g., 15 minutes)
   - Updates comment content
   - Sets updated_at timestamp
   - Returns updated comment

4. `DELETE /api/comments/[id]` - Delete a comment
   - Validates user owns the comment or is admin
   - Soft deletes comment (sets status to 'deleted')
   - Updates article comment_count
   - Returns success status

### Client-Side Updates

**File:** `src/lib/api/comments.ts` (new)

Client API functions:

- `getComments(articleId, options)` - Fetch comments for article
- `createComment(articleId, content, parentId?)` - Create new comment
- `updateComment(commentId, content)` - Update existing comment
- `deleteComment(commentId)` - Delete comment

**File:** `src/hooks/useComments.ts` (new)

Custom hook for comment management:

- Fetch and cache comments
- Handle optimistic updates
- Manage loading and error states
- Sort and filter comments
- Handle pagination

**File:** `src/components/comments/CommentForm.tsx` (new)

Comment submission form:

- Textarea for comment content
- Character counter (optional)
- Submit button
- Cancel button (for replies)
- Authentication check
- Loading state during submission
- Error handling and display
- Rich text support (basic formatting)

**File:** `src/components/comments/CommentItem.tsx` (new)

Individual comment display:

- User avatar and name
- Timestamp (relative format: "2 hours ago")
- Comment content with formatting
- Reply button
- Edit/Delete buttons (own comments)
- Nested replies display
- Collapse/expand toggle
- Reply count indicator

**File:** `src/components/comments/CommentList.tsx` (new)

Comment list container:

- Display all top-level comments
- Sort controls (newest/oldest)
- Empty state message
- Loading skeleton
- Pagination or infinite scroll
- Comment count header
- Handles comment tree structure

**File:** `src/components/comments/CommentSection.tsx` (new)

Main comment section component:

- Comment count display
- CommentForm for new comments
- CommentList for displaying comments
- Sort and filter controls
- Login prompt for anonymous users
- Error boundaries

**File:** Article page integration

Update article page to include CommentSection:

- Add CommentSection below article content
- Pass article ID to CommentSection
- Load comment count from article data
- Anchor link for direct comment navigation

### UI/UX Design

**Comment Layout:**

- Top-level comments: full width
- Nested replies: indented 40px per level
- Max nesting depth: 3-4 levels
- Visual threading line for nested comments

**Comment Actions:**

- Reply button: subtle, aligned right
- Edit/Delete: show on hover for own comments
- Timestamp: clickable to permalink comment

**States:**

- Loading: Skeleton placeholders
- Empty: "Be the first to comment" message
- Error: Retry option with error message
- Success: Toast notification "Comment posted"

**Accessibility:**

- Proper heading hierarchy
- ARIA labels for buttons
- Keyboard navigation support
- Focus management for reply forms
- Screen reader announcements for actions

## Security Considerations

- Sanitize comment content to prevent XSS attacks
- Validate user authentication for all comment operations
- Implement rate limiting to prevent spam
- RLS policies enforce user permissions
- Content moderation for inappropriate comments
- Edit time limit to prevent abuse (15 minutes)
- Soft delete preserves comment history
- CSRF protection on API endpoints

## Testing

### Manual Testing Checklist

- [ ] View article as anonymous user and see login prompt
- [ ] Log in and see comment form
- [ ] Submit a comment and verify it appears
- [ ] Verify comment shows correct user name and avatar
- [ ] Reply to a comment and verify nesting
- [ ] Verify reply count updates
- [ ] Edit own comment within time limit
- [ ] Verify edit updates content and timestamp
- [ ] Delete own comment and verify soft delete
- [ ] Test comment sorting (newest/oldest)
- [ ] Test pagination with many comments
- [ ] Verify comment count on article page
- [ ] Test with multiple users commenting
- [ ] Test nested replies up to max depth
- [ ] Test on mobile devices (responsive)
- [ ] Test accessibility with keyboard navigation

### Unit Tests

- Comment API route handlers
- Comment form validation
- Comment tree building logic
- Date formatting utilities
- User permission checks

### Integration Tests

- Create comment flow
- Reply to comment flow
- Edit comment flow
- Delete comment flow
- Comment pagination

## Environment Variables

No new environment variables required.

## Future Enhancements

- Real-time comment updates (WebSocket)
- Rich text editor for comments (bold, italic, links)
- Emoji reactions to comments
- Comment upvoting/downvoting
- Mention other users (@username)
- Email notifications for replies
- Comment moderation dashboard for admins
- Flag inappropriate comments
- Search within comments
- Export comments for analysis
- Comment threading improvements (show parent context)
- Mark comment as "helpful" (for article authors)
- Pin important comments to top

## Files to be Modified/Created

1. `supabase/migrations/014_comments_enhancements.sql` (new) - Database migration
2. `src/types/comment.ts` (new) - Comment type definitions
3. `src/types/article.ts` (modified) - Add comment_count field
4. `src/lib/api/comments.ts` (new) - Client API functions
5. `src/hooks/useComments.ts` (new) - Custom React hook
6. `src/components/comments/CommentForm.tsx` (new) - Comment submission form
7. `src/components/comments/CommentItem.tsx` (new) - Individual comment display
8. `src/components/comments/CommentList.tsx` (new) - Comment list container
9. `src/components/comments/CommentSection.tsx` (new) - Main section component
10. `app/api/articles/[id]/comments/route.ts` (new) - GET and POST comments
11. `app/api/comments/[id]/route.ts` (new) - PUT and DELETE comment
12. `app/articles/[slug]/page.tsx` (modified) - Integrate CommentSection
13. `src/lib/utils/sanitize.ts` (new) - Content sanitization utilities
14. `src/lib/utils/date.ts` (modified) - Add relative date formatting

## Related Stories

- **Prerequisite:** Story 1.3 - Authentication Infrastructure
- **Prerequisite:** Story 3.1 - Article Display & Reading Interface
- **Previous:** Story 5.1 - Anjali Button & Reactions
- **Next:** Story 5.3 - Social Sharing
- **Related:** Story 6.3 - Content Moderation (admin features)

## Notes

- Comments are a core feature for community engagement
- Keep interface simple and focused on dharma discussion
- Consider cultural sensitivity for Thai Buddhist context
- Moderation may be important to maintain quality
- Start with basic features, iterate based on user feedback
- Performance: Optimize for articles with many comments (100+)
- Consider comment export for data portability
- Respect user privacy: comments are public by default
- Provide option to disable comments per article (future)
