# Story 3.3: Search Functionality

**Epic**: 3 - Reader Experience
**Status**: ✅ COMPLETED
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As a** reader
**I want to** search for articles by keywords
**So that** I can quickly find what I'm looking for

---

## Acceptance Criteria

### ⬜ Instant Search (Debounced)

**Given** a reader uses the search bar
**When** they type a keyword
**Then** results appear as they type (debounced)
**And** results show matching articles with snippets

### ⬜ Search Results Page

**When** they press Enter or click search
**Then** they're taken to a results page
**And** results are sorted by relevance

### ⬜ Search Features

**And** search works for title, content, and author name
**And** result count is displayed
**And** no-results case is handled gracefully

### Implementation Checklist

- [ ] Create SearchBar component with debounced input
- [ ] Create search results page (app/search/page.tsx)
- [ ] Implement PostgreSQL full-text search
- [ ] Create search API endpoint (/api/search)
- [ ] Add search by title, content, author
- [ ] Implement relevance-based sorting
- [ ] Add result count display
- [ ] Handle empty/no-results state
- [ ] Add loading states during search
- [ ] Test search functionality across different queries

---

## Prerequisites

- Story 3.2: Content Discovery & Browsing ✅
- Story 1.2: Database Schema & Core Data Models ✅

---

## Technical Notes

### Database Implementation

- Use PostgreSQL full-text search capabilities
- Create tsvector columns or indexes for efficient search
- Search across: article title, content, author name
- Use `ts_rank` for relevance scoring

### Frontend Implementation

- Debounce search input (300-500ms) to reduce API calls
- Show search suggestions as user types
- Implement keyboard navigation (arrow keys, enter)
- Handle loading and error states

### API Design

- Endpoint: `GET /api/search?q={query}&page={page}`
- Return: articles array, total count, current page
- Limit results per page (e.g., 10-20 articles)

### Performance Considerations

- Index tsvector columns for fast search
- Implement query caching for common searches
- Limit search to published articles only
- Consider pagination for large result sets

### UX Considerations

- Show "No results found" with helpful suggestions
- Highlight search terms in results (optional)
- Show search history (optional, future enhancement)
- Make search bar prominent and easily accessible

---

## Implementation Details

### Search Bar Component

```tsx
// Location: src/components/search/SearchBar.tsx
// Features:
// - Debounced input (useDebounce hook)
// - Auto-suggest dropdown
// - Clear button
// - Keyboard navigation
// - Loading indicator
```

### Search Results Page

```tsx
// Location: app/search/page.tsx
// Features:
// - Display search query
// - Show result count
// - Article cards with excerpts
// - Pagination
// - Empty state
// - Sort options (relevance, date)
```

### Search API

```tsx
// Location: app/api/search/route.ts
// Features:
// - Full-text search using PostgreSQL
// - Relevance scoring with ts_rank
// - Pagination support
// - Filter by published status
// - Return snippets/excerpts
```

### Database Migration

```sql
-- Add tsvector column for full-text search
ALTER TABLE articles
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'C')
) STORED;

-- Create GIN index for fast search
CREATE INDEX articles_search_idx ON articles USING GIN(search_vector);
```

---

## Testing Checklist

- [ ] Search returns relevant results for various keywords
- [ ] Debounce works correctly (no excessive API calls)
- [ ] Pagination works on search results
- [ ] Empty query handling
- [ ] No results case displays properly
- [ ] Search highlights work correctly
- [ ] Performance is acceptable (<500ms for typical queries)
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works
- [ ] Special characters in search don't break functionality

---

## Related Stories

- Story 3.1: Article Display & Reading Interface
- Story 3.2: Content Discovery & Browsing
- Story 3.4: Article Metadata & SEO

---

## Notes

- Consider implementing advanced search filters in future (by category, date range, author)
- Consider adding search analytics to track popular search terms
- May integrate with external search service (Algolia, Meilisearch) for better performance in the future
- Thai language search support will require additional configuration (Story 8.1/8.2)

---

_Story created: 2025-11-08_
_Last updated: 2025-11-08_
