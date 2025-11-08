# Story 5.1: Anjali Button & Reactions

**Epic:** 5 - Community & Engagement
**Status:** Completed
**Date Started:** 2025-11-08
**Date Completed:** 2025-11-08

## Overview

As a reader, I want to express gratitude and appreciation by clicking the "Anjali" button, so that I can show respect for the dharma and encourage authors.

## Acceptance Criteria

### Anjali Button Interaction

- [x] Reader viewing an article sees the Anjali button (🙏)
- [x] Clicking the Anjali button records reaction in database
- [x] Count increases visually after clicking
- [x] Brief "Gratitude recorded" message is shown
- [x] Only authenticated users can click Anjali
- [x] Anonymous users see prompt to log in

### Toggle Behavior

- [x] Clicking again removes the Anjali (toggle behavior)
- [x] Visual state shows if user has already given Anjali
- [x] Count decreases when Anjali is removed
- [x] User can only anjali once per article

### Display

- [x] Anjali count is displayed prominently on article page
- [x] Anjali count shown in article lists/cards
- [x] Authors cannot Anjali their own articles (optional)
- [x] Real-time count update for active users (via optimistic UI)

## Prerequisites

- Story 1.3: Authentication Infrastructure
- Story 3.1: Article Display & Reading Interface
- Database table for anjali_reactions exists (from Story 1.2)

## Implementation Details

### Database Changes

**Migration:** `011_anjali_reactions.sql`

- Table `anjali_reactions` should have:
  - `id` (UUID, primary key)
  - `user_id` (UUID, references users)
  - `article_id` (UUID, references articles)
  - `created_at` (timestamp)
  - Unique constraint on (user_id, article_id)
- Add `anjali_count` denormalized field to articles table
- Create trigger to update anjali_count on articles
- Add RLS policies for anjali_reactions

### Type Updates

**File:** `src/types/article.ts`

- Add `anjali_count` field to Article interface
- Add `user_has_anjalied` field for current user's status

**File:** `src/types/anjali.ts` (new)

- Define `AnjaliReaction` interface
- Define API request/response types

### API Endpoints

**New Endpoints:**

1. `POST /api/articles/[id]/anjali` - Toggle Anjali for article
   - Validates user is authenticated
   - Checks if user already gave Anjali
   - If exists: removes Anjali
   - If not exists: creates Anjali
   - Returns updated count and user's status

2. `GET /api/articles/[id]/anjali` - Get Anjali status
   - Returns total count
   - Returns whether current user has anjalied (if authenticated)

### Client-Side Updates

**File:** `src/lib/api/anjali.ts` (new)

Client functions:

- `toggleAnjali(articleId)` - Toggle Anjali reaction
- `getAnjaliStatus(articleId)` - Get current status

**File:** `src/components/article/AnjaliButton.tsx` (new)

Anjali button component:

- Display Anjali icon (🙏) with count
- Show active state if user has anjalied
- Handle click to toggle
- Show toast notification on success
- Handle authentication redirect
- Optimistic UI updates

**File:** Article page integration

Update article pages to include AnjaliButton:

- Article detail page
- Article cards in lists
- Author dashboard (read-only)

### UI/UX Design

**Button States:**

- **Default (not anjalied):** Outlined hands icon, gray color
- **Active (anjalied):** Filled hands icon, gold/warm color
- **Hover:** Slight scale animation
- **Disabled:** Grayed out (own articles)

**Toast Messages:**

- "🙏 Gratitude recorded" (when adding)
- "Anjali removed" (when removing)
- "Please log in to show gratitude" (when not authenticated)

## Security Considerations

- Users can only toggle Anjali for their own reactions
- RLS policies prevent unauthorized access
- Rate limiting to prevent spam (optional)
- Validation that article exists and is published
- Authors can optionally be blocked from own articles

## Testing

### Manual Testing Checklist

- [ ] View article as anonymous user
- [ ] Click Anjali button and verify login prompt
- [ ] Log in and click Anjali button
- [ ] Verify count increases
- [ ] Verify visual state changes to active
- [ ] Click again to remove Anjali
- [ ] Verify count decreases
- [ ] Verify visual state returns to default
- [ ] Refresh page and verify state persists
- [ ] Test with multiple users on same article
- [ ] Verify authors cannot Anjali own articles

## Environment Variables

No new environment variables required.

## Future Enhancements

- WebSocket/real-time updates for count changes
- Anjali animation when clicked
- Show list of users who gave Anjali
- Anjali leaderboard for articles
- Notification to authors when they receive Anjali
- Different reaction types beyond Anjali
- Sound effect option on Anjali

## Files Modified/Created

1. `supabase/migrations/013_anjali_reactions.sql` (new) - Database migration
2. `src/types/article.ts` (modified) - Added anjali_count and user_has_anjalied fields
3. `src/types/anjali.ts` (new) - Anjali-specific type definitions
4. `src/lib/api/anjali.ts` (new) - Client API functions
5. `src/components/article/AnjaliButton.tsx` (new) - Main Anjali button component
6. `app/api/articles/[id]/anjali/route.ts` (new) - API endpoint for toggling anjali
7. `app/articles/[slug]/page.tsx` (modified) - Integrated Anjali button
8. `src/components/article/ArticleCard.tsx` (modified) - Added anjali count display

## Related Stories

- **Prerequisite:** Story 1.3 - Authentication Infrastructure
- **Prerequisite:** Story 3.1 - Article Display & Reading Interface
- **Next:** Story 5.2 - Comments & Discussions
- **Related:** Story 4.4 - Author Dashboard (will show Anjali counts)

## Notes

- Anjali (อัญชลี) is a gesture of respect with palms pressed together
- Icon representation: 🙏 emoji or custom SVG
- Color scheme should match Thai cultural aesthetics (warm gold tones)
- Consider accessibility: button should have proper ARIA labels
- Mobile: Ensure button is large enough for touch targets (44x44px minimum)
