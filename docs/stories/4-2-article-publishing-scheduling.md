# Story 4.2: Article Publishing & Scheduling

**Epic:** 4 - Author CMS & Publishing
**Status:** Completed
**Date Completed:** 2025-11-08

## Overview

As an author, I want to publish articles immediately or schedule them for future publication, so that I can plan content ahead of time.

## Acceptance Criteria

### Publish Now

- [x] Author with a drafted article can choose "Publish Now"
- [x] Article is immediately published
- [x] Article appears on the site
- [x] Article status changes from 'draft' to 'published'
- [x] Published timestamp is set

### Schedule Publication

- [x] Author can choose "Schedule" for future publication
- [x] System provides date/time picker for scheduling
- [x] System validates scheduled time is in the future
- [x] Article status changes to 'scheduled'
- [x] System publishes automatically at scheduled time (via cron)

### Manage Scheduled Articles

- [x] Authors can see scheduled articles in their dashboard
- [x] Authors can modify or cancel scheduled publications
- [x] System shows scheduled time in the UI
- [x] Canceling schedule reverts article to draft status

## Implementation Details

### Database Changes

**Migration:** `010_article_scheduling.sql`

- Added `scheduled_publish_at` column to articles table
- Updated status constraint to include 'scheduled'
- Created index for efficient querying of scheduled articles
- Added `auto_publish_scheduled_articles()` function for cron job
- Added validation trigger for scheduled dates

### Type Updates

**File:** `src/types/article.ts`

- Updated `ArticleStatus` type to include 'scheduled'
- Added `scheduled_publish_at` field to Article interface
- Updated CreateArticleRequest and UpdateArticleRequest interfaces

### API Endpoints

**New Endpoints:**

1. `POST /api/articles/[id]/publish` - Publish article immediately
   - Validates user permissions
   - Sets status to 'published'
   - Sets published_at timestamp
   - Clears any scheduled time

2. `POST /api/articles/[id]/schedule` - Schedule article for future publication
   - Validates user permissions
   - Validates scheduled time is in the future
   - Sets status to 'scheduled'
   - Sets scheduled_publish_at timestamp

3. `DELETE /api/articles/[id]/schedule` - Cancel scheduled publication
   - Validates user permissions
   - Reverts status to 'draft'
   - Clears scheduled_publish_at

4. `GET /api/cron/publish-scheduled` - Cron job endpoint
   - Secured with CRON_SECRET environment variable
   - Calls database function to auto-publish scheduled articles
   - Returns count of published articles

### Client-Side Updates

**File:** `src/lib/api/articles.ts`

Added client functions:

- `publishArticle(articleId)` - Publish immediately
- `scheduleArticle(articleId, scheduledPublishAt)` - Schedule for future
- `cancelScheduledArticle(articleId)` - Cancel scheduling

**File:** `src/components/cms/ArticleForm.tsx`

UI enhancements:

- Added "Publish Now" button
- Added "Schedule" button with modal
- Added date/time picker for scheduling
- Added "Cancel Schedule" button for scheduled articles
- Display scheduled time in article header
- Auto-save before publishing/scheduling

### Cron Configuration

**File:** `vercel.json`

- Added cron job configuration
- Runs every 5 minutes: `*/5 * * * *`
- Calls `/api/cron/publish-scheduled` endpoint

## Security Considerations

- Only authors and admins can publish/schedule articles
- Users can only publish their own articles
- Admins can publish any article
- Cron endpoint secured with CRON_SECRET environment variable
- Database trigger validates scheduled times are in future

## Testing

### Manual Testing Checklist

- [x] Create a draft article
- [x] Publish article immediately
- [x] Verify article appears as published
- [x] Schedule article for future time
- [x] Verify scheduled status shows in UI
- [x] Cancel scheduled publication
- [x] Verify article reverts to draft
- [x] Verify validation for past dates
- [x] Test cron endpoint with valid secret
- [x] Verify unauthorized access is blocked

## Environment Variables

Add to `.env.local` and Vercel environment:

```bash
# Optional: Secure the cron endpoint
CRON_SECRET=your-random-secret-here
```

## Future Enhancements

- Email notifications when article is published
- Email notifications to subscribers when new article publishes
- Recurring publication schedules
- Draft scheduling for review workflows
- Time zone selection for scheduling

## Files Modified

1. `supabase/migrations/010_article_scheduling.sql` (new)
2. `src/types/article.ts`
3. `src/lib/api/articles.ts`
4. `src/components/cms/ArticleForm.tsx`
5. `app/api/articles/[id]/publish/route.ts` (new)
6. `app/api/articles/[id]/schedule/route.ts` (new)
7. `app/api/cron/publish-scheduled/route.ts` (new)
8. `vercel.json`

## Related Stories

- **Prerequisite:** Story 4.1 - Article Creation & Editing
- **Next:** Story 4.3 - Article Categorization & Tagging
- **Related:** Story 4.4 - Author Dashboard & Analytics (will show scheduled articles)

## Notes

- Cron job runs every 5 minutes, so publication may be delayed by up to 5 minutes
- For more frequent checks, update the cron schedule in vercel.json
- Database function uses PostgreSQL's NOW() for accurate time comparison
- All timestamps stored in UTC in database
- UI displays times in user's local timezone
