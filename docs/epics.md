# Ariyadham - Epic Breakdown

**Author:** Aekanum
**Date:** 2025-11-07
**Project Level:** Greenfield Web App
**Target Scale:** 1,000+ users/month (MVP), scaling to 10k+

---

## Overview

This document provides the complete epic and story breakdown for Ariyadham, decomposing the requirements from the [PRD](./PRD.md) into implementable stories optimized for development agents working in 200k context windows.

### Epic Structure

Ariyadham will be built through 8 coherent epics, each delivering independent business value while building toward the complete platform:

1. **Epic 1: Foundation & Infrastructure** - Project setup, core systems, deployment pipeline
2. **Epic 2: Authentication & User Management** - User onboarding, auth, profiles
3. **Epic 3: Reader Experience** - Content browsing, reading, basic interactions
4. **Epic 4: Author CMS & Publishing** - Content creation, management, publishing
5. **Epic 5: Community & Engagement** - Comments, Anjali button, sharing
6. **Epic 6: Admin & Moderation** - User/content management, analytics
7. **Epic 7: Performance & SEO** - Optimization, search visibility, Core Web Vitals
8. **Epic 8: Multi-Language & Accessibility** - i18n, WCAG compliance, special features

This sequencing ensures:
- Epic 1 establishes all foundations
- Epics 2-3 create the basic user experience
- Epic 4 enables content creators
- Epics 5-8 polish and scale the platform

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the complete development, deployment, and runtime foundation for Ariyadham. This epic creates the scaffolding that all subsequent features depend on.

### Story 1.1: Project Setup & Repository Structure

As a **developer**,
I want a **well-organized project structure with build systems and dependency management configured**,
So that **all team members can quickly understand the codebase and contribute efficiently**.

**Acceptance Criteria:**

**Given** an empty Git repository
**When** the developer clones the repository
**Then** the following structure exists:
- Frontend project in `/frontend` with Next.js configured
- Backend configuration ready for Supabase
- `/docs` folder for documentation
- `.gitignore`, `.env.example`, `README.md` properly configured
- All critical dependencies installed and versions locked

**And** running `npm run dev` starts the development server successfully
**And** running `npm run build` creates an optimized production build

**Prerequisites:** None (first story)

**Technical Notes:**
- Use Next.js 14+ with TypeScript
- Initialize Supabase client configuration (keys in .env)
- Setup ESLint and Prettier for code consistency
- Include pre-commit hooks with husky
- Document setup process in README

---

### Story 1.2: Database Schema & Core Data Models

As a **backend developer**,
I want to **define the core database schema for users, content, and interactions**,
So that **all subsequent features have a solid foundation for data persistence**.

**Acceptance Criteria:**

**Given** an empty Supabase project
**When** migrations run
**Then** the following tables exist:
- `users` - user profiles, roles, metadata
- `articles` - content with metadata, status, publish dates
- `authors` - author information, verification
- `comments` - article comments with threading
- `anjali_reactions` - Anjali button interactions
- `bookmarks` - saved articles per user
- `reading_history` - user reading progress
- `article_categories` - taxonomy for content
- `article_translations` - multi-language support

**And** appropriate indexes exist for query performance
**And** Row Level Security (RLS) policies are configured
**And** all tables have audit timestamps (created_at, updated_at)

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use Supabase's PostgreSQL with migrations via SQL
- RLS policies: Users can only modify own data, articles visible based on status
- Consider denormalized fields for performance (e.g., comment_count, anjali_count)
- Include soft-delete patterns where needed (articles, comments)
- Document schema in SCHEMA.md

---

### Story 1.3: Authentication Infrastructure & User Onboarding

As a **auth developer**,
I want to **implement Supabase authentication with email/password and social login support**,
So that **users can securely create accounts and sign in**.

**Acceptance Criteria:**

**Given** a user visits the signup page
**When** they fill in email, password and submit
**Then** an account is created in Supabase
**And** a confirmation email is sent (or auto-confirmed in dev)
**And** they can log in immediately

**When** a user chooses "Sign in with Google"
**Then** they are redirected to Google OAuth
**And** a new account is created with their Google profile
**And** they are logged in

**And** password reset flow works via email link
**And** sessions persist across page reloads
**And** logout clears session properly

**Prerequisites:** Story 1.2

**Technical Notes:**
- Setup Supabase Auth configuration
- Configure Google/Facebook OAuth credentials
- Create sign up, login, reset password pages
- Use Supabase's built-in session management
- No custom password hashing (use Supabase built-in)
- Email templates: confirmation, reset password

---

### Story 1.4: Deployment Pipeline & Hosting Setup

As a **devops developer**,
I want to **configure automatic deployment from GitHub to Vercel and Supabase**,
So that **code changes are automatically tested and deployed to production**.

**Acceptance Criteria:**

**Given** code is pushed to the main branch
**When** GitHub Actions runs
**Then** automated tests pass (if configured)
**And** the frontend builds successfully
**And** Vercel automatically deploys to production
**And** environment variables are properly set

**And** Supabase migrations run automatically if needed
**And** database is protected (no auto-reset on prod)

**Prerequisites:** Stories 1.1, 1.2

**Technical Notes:**
- Configure GitHub Actions workflow
- Setup Vercel deployment configuration
- Database migrations should be manual approval in prod
- Environment variables: separate dev/staging/prod configs
- Implement basic health check endpoint
- Setup error tracking (Sentry) placeholder

---

### Story 1.5: API Foundation & Request Handling

As a **backend developer**,
I want to **setup core Next.js API routes with error handling, logging, and validation**,
So that **all API endpoints follow consistent patterns**.

**Acceptance Criteria:**

**Given** a request to any API endpoint
**When** invalid data is provided
**Then** a 400 response with clear error message is returned

**When** request is not authenticated (when required)
**Then** 401 Unauthorized is returned

**When** request is authenticated but user lacks permission
**Then** 403 Forbidden is returned

**And** all API responses follow consistent JSON structure
**And** successful responses include data payload
**And** error responses include error code and message

**Prerequisites:** Stories 1.1, 1.3

**Technical Notes:**
- Create middleware for auth verification
- Implement standardized request/response types
- Setup request validation library (zod or joi)
- Add request logging
- Document API conventions in API.md
- Include rate limiting placeholder

---

### Story 1.6: Core Utilities & Shared Infrastructure

As a **developer**,
I want to **create shared utilities for common operations**,
So that **code is DRY and team can reuse common patterns**.

**Acceptance Criteria:**

**Given** a developer building a feature
**When** they need to format dates, slugs, or validate data
**Then** utility functions are available in `/utils`

**And** hooks for common operations exist in `/hooks`
**And** constants (error codes, routes, etc.) are centralized
**And** types are defined in shared locations

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create `/lib/utils.ts` for common functions
- Create `/lib/types.ts` for shared TypeScript types
- Create `/hooks/` folder for custom React hooks
- Create `/constants/` for app-wide constants
- Document utility functions with JSDoc

---

## Epic 2: Authentication & User Management

**Goal:** Build secure user account management, authentication flows, and user profile functionality. Enables personalization and community features.

### Story 2.1: User Profile Management

As a **user**,
I want to **view and edit my profile (name, bio, avatar, language preference)**,
So that **my account reflects who I am**.

**Acceptance Criteria:**

**Given** a logged-in user navigates to their profile page
**When** they edit their name and bio
**Then** changes are saved to the database
**And** profile is updated immediately in the UI

**When** they upload a new avatar
**Then** image is optimized and stored (Supabase Storage)
**And** displayed in all user interactions

**And** user can set language preference (Thai/English)
**And** preference persists across sessions

**Prerequisites:** Story 1.3

**Technical Notes:**
- Use Supabase Storage for avatar images
- Image optimization: resize to 200x200, 400x400 for different displays
- Profile page: `/profile` route (authenticated)
- Include avatar in User type/context
- Validate name length and special characters

---

### Story 2.2: User Roles & Permissions

As a **system**,
I want to **manage different user roles (reader, author, admin)**,
So that **features and access are properly controlled**.

**Acceptance Criteria:**

**Given** a user with 'author' role
**When** they try to access the CMS
**Then** they can create and edit articles

**Given** a user with 'reader' role
**When** they try to access the CMS
**Then** they see "not authorized" message

**Given** a user with 'admin' role
**When** they access the admin dashboard
**Then** they see user management, content moderation, analytics

**And** roles can be assigned only by existing admins
**And** role changes are logged for audit purposes

**Prerequisites:** Story 1.3

**Technical Notes:**
- Store role in user metadata or separate table
- Use Supabase RLS for enforcement
- Role-based route guards in frontend
- Include role in auth context
- Document role hierarchy: reader < author < admin

---

### Story 2.3: Author Approval Workflow

As a **admin**,
I want to **approve users requesting to become authors**,
So that **content quality is maintained**.

**Acceptance Criteria:**

**Given** a user applies to become an author
**When** they submit their request with a bio and credentials
**Then** admin receives a notification (in-app or email)

**When** admin approves the request
**Then** user's role becomes 'author'
**And** they receive confirmation email
**And** can access the CMS

**When** admin rejects the request
**Then** user is notified with optional reason

**Prerequisites:** Stories 2.1, 2.2

**Technical Notes:**
- Create "Apply as Author" form
- Store applications in a separate table
- Admin dashboard shows pending applications
- Include reason field for rejection
- Email templates: approval, rejection

---

### Story 2.4: User Preferences & Settings

As a **user**,
I want to **customize my reading preferences (theme, font size, language)**,
So that **my experience is personalized**.

**Acceptance Criteria:**

**Given** a user on the settings page
**When** they toggle Dark Mode
**Then** the entire interface switches theme
**And** preference is saved and persists

**When** they adjust font size
**Then** text size changes immediately
**And** preference is saved

**When** they select preferred language
**Then** interface switches to that language
**And** preference is remembered

**Prerequisites:** Story 2.1

**Technical Notes:**
- Store preferences in both user DB and localStorage
- Use React Context/Zustand for theme state
- Sync on login
- Consider CSS custom properties for theme switching

---

## Epic 3: Reader Experience

**Goal:** Create a compelling reading experience with content discovery, browsing, and basic reader interactions. Core value for end users.

### Story 3.1: Article Display & Reading Interface

As a **reader**,
I want to **read articles in a clean, distraction-free interface**,
So that **I can focus on the dharma content**.

**Acceptance Criteria:**

**Given** a reader visits an article page
**When** the page loads
**Then** the article title, author, and date are displayed
**And** article content is rendered in readable format
**And** font is legible on all devices

**When** reader adjusts font size from settings
**Then** article text immediately reflects the change

**And** dark mode toggle works properly
**And** line height is appropriate
**And** article is responsive (mobile, tablet, desktop)

**Prerequisites:** Story 1.1

**Technical Notes:**
- Article page route: `/articles/[slug]`
- Use Next.js Image optimization for featured images
- Render markdown/rich text as HTML
- Include table of contents for long articles (optional)
- Consider print-friendly stylesheet

---

### Story 3.2: Content Discovery & Browsing

As a **reader**,
I want to **browse articles by category and see recommended content**,
So that **I can discover dharma I'm interested in**.

**Acceptance Criteria:**

**Given** a user visits the homepage
**When** the page loads
**Then** they see featured articles
**And** recently published articles
**And** popular articles

**When** they click on a category (e.g., "Gratitude", "Ethics")
**Then** they see articles in that category
**And** results can be sorted (newest, most popular)

**And** pagination works for browsing multiple pages
**And** each article shows: title, excerpt, author, date, category

**Prerequisites:** Story 1.2 (categories data)

**Technical Notes:**
- Homepage layout with featured + recent + popular sections
- Category page: `/categories/[slug]`
- Implement pagination or infinite scroll
- Display article count per category
- Show 5-10 articles per page

---

### Story 3.3: Search Functionality

As a **reader**,
I want to **search for articles by keywords**,
So that **I can quickly find what I'm looking for**.

**Acceptance Criteria:**

**Given** a reader uses the search bar
**When** they type a keyword
**Then** results appear as they type (debounced)
**And** results show matching articles with snippets

**When** they press Enter or click search
**Then** they're taken to a results page
**And** results are sorted by relevance

**Prerequisites:** Story 3.2, Story 1.2

**Technical Notes:**
- Implement with PostgreSQL full-text search or Algolia
- Search by title, content, author name
- Debounce search input to reduce queries
- Show result count
- Handle no-results case gracefully

---

### Story 3.4: Article Metadata & SEO

As a **reader/search engine**,
I want to **see rich metadata for each article**,
So that **search engines index content properly**.

**Acceptance Criteria:**

**Given** an article is published
**When** metadata is provided (title, excerpt, featured image)
**Then** Open Graph tags are generated for social sharing
**And** Schema.org markup is added for search engines

**When** shared on social media
**Then** the article shows with proper title, image, excerpt

**Prerequisites:** Story 3.1, 1.5

**Technical Notes:**
- Generate meta tags in Next.js head
- Include: og:title, og:description, og:image, og:url
- Schema markup: Article type with author, datePublished, headline
- Canonical URLs for multi-language versions

---

## Epic 4: Author CMS & Publishing

**Goal:** Provide authors with a powerful yet easy-to-use content management system. Enables content creators to build the platform.

### Story 4.1: Article Creation & Editing

As an **author**,
I want to **create and edit articles using a rich text editor**,
So that **I can write dharma content with formatting**.

**Acceptance Criteria:**

**Given** an author on the create article page
**When** they fill in title and content
**Then** they can format text (bold, italic, headings, lists)
**And** they can add images

**When** they click "Save Draft"
**Then** article is saved without publishing
**And** they can return to edit later

**And** they receive real-time save feedback
**And** unsaved changes warning if they try to leave

**Prerequisites:** Stories 1.3, 2.2

**Technical Notes:**
- Use a rich text editor (Tiptap, Slate, or Draft.js)
- Rich editor features: bold, italic, heading, quote, code, list
- Image upload to Supabase Storage
- Auto-save drafts periodically
- Content is stored as structured format (not just HTML)

---

### Story 4.2: Article Publishing & Scheduling

As an **author**,
I want to **publish articles immediately or schedule them for future publication**,
So that **I can plan content ahead of time**.

**Acceptance Criteria:**

**Given** an author with a drafted article
**When** they choose "Publish Now"
**Then** article is immediately published
**And** it appears on the site
**And** notifications can be sent (optional)

**When** they choose "Schedule"
**Then** they can set a future publication date/time
**And** system publishes automatically at that time

**And** they can see scheduled articles in their dashboard
**And** can modify or cancel scheduled publications

**Prerequisites:** Story 4.1

**Technical Notes:**
- Publish status: draft, scheduled, published, archived
- Store publish_date and scheduled_publish_at in DB
- Implement background job or cron for scheduled publishing
- Timezone handling for scheduled time
- Notifications (optional for MVP)

---

### Story 4.3: Article Categorization & Tagging

As an **author**,
I want to **assign categories and tags to my articles**,
So that **articles are discoverable and organized**.

**Acceptance Criteria:**

**Given** an author creating an article
**When** they select a category from a dropdown
**Then** the article is associated with that category

**When** they add tags (custom or from suggestion list)
**Then** tags are saved with the article
**And** tags appear below the article title

**When** a reader clicks a tag
**Then** they see all articles with that tag

**Prerequisites:** Story 4.1

**Technical Notes:**
- Categories: pre-defined (Ethics, Meditation, etc.)
- Tags: can be created by authors (with admin moderation option)
- Implement tag autocomplete/suggestion
- Store relationship in database
- Display tags prominently on article page

---

### Story 4.4: Author Dashboard & Analytics

As an **author**,
I want to **see statistics about my articles**,
So that **I can understand the impact of my writing**.

**Acceptance Criteria:**

**Given** an author on their dashboard
**When** the page loads
**Then** they see all their articles (drafts, published, scheduled)
**And** they see total views, total Anjali, total comments per article

**When** they click on an article
**Then** they see a detailed analytics view
**And** can see view trends over time (graph)

**And** they see which articles are most popular
**And** recent comments on their articles

**Prerequisites:** Stories 4.1, 4.2, 4.3

**Technical Notes:**
- Dashboard route: `/author/dashboard`
- Track views per article
- Calculate statistics from events
- Show last 7/30/90 day options
- Include engagement metrics (comments, anjali)

---

## Epic 5: Community & Engagement

**Goal:** Build community features that foster interaction, reflection, and sharing of dharma. The heart of the platform's value.

### Story 5.1: Anjali Button & Reactions

As a **reader**,
I want to **express gratitude and appreciation by clicking the "Anjali" button**,
So that **I can show respect for the dharma and encourage authors**.

**Acceptance Criteria:**

**Given** a reader viewing an article
**When** they click the Anjali button (🙏)
**Then** their click is recorded in the database
**And** the count increases visually
**And** they see a brief "Gratitude recorded" message

**When** they click again
**Then** their Anjali is removed (toggle behavior)

**And** only authenticated users can click Anjali
**And** Anjali count is displayed prominently

**Prerequisites:** Stories 1.3, 3.1

**Technical Notes:**
- Anjali icon/button with count display
- Store anjali reactions in DB
- User can only anjali once per article
- Real-time count update (consider WebSocket for active users)
- Disable for authors on own articles (optional)

---

### Story 5.2: Comments & Discussions

As a **reader**,
I want to **comment on articles and discuss dharma with others**,
So that **we can engage in meaningful conversations**.

**Acceptance Criteria:**

**Given** a logged-in reader at an article's comment section
**When** they type a comment and submit
**Then** their comment appears below the article
**And** shows their name, avatar, timestamp

**When** they reply to a comment
**Then** the reply appears nested under the parent comment
**And** the parent commenter is notified (optional)

**And** comments show the number of replies
**And** recent comments are expanded, older ones collapsed
**And** comments can be sorted (newest first, most helpful)

**Prerequisites:** Stories 1.3, 3.1

**Technical Notes:**
- Comment form with textarea and submit button
- Store comment hierarchy (parent_comment_id for replies)
- Rich text support in comments (basic formatting)
- Moderation: hide comments pending approval initially
- Email notifications for thread replies (optional)

---

### Story 5.3: Social Sharing

As a **reader**,
I want to **share articles with my friends on social media**,
So that **dharma spreads to more people**.

**Acceptance Criteria:**

**Given** a reader viewing an article
**When** they click the Share button
**Then** they see sharing options: Facebook, Line, Twitter, Copy Link

**When** they click Facebook Share
**Then** a dialog opens to share on their wall
**And** article shows with proper image and title (OG tags)

**And** they can copy article link to clipboard
**And** copy includes article title automatically

**Prerequisites:** Stories 3.1, 3.4

**Technical Notes:**
- Integrate social media sharing APIs
- Ensure Open Graph tags are correct for proper preview
- Use Next.js built-in sharing or standard Web Share API
- Generate short, clean share links
- Track shares (optional analytics)

---

### Story 5.4: User Reading History & Bookmarks

As a **reader**,
I want to **bookmark articles to read later and see my reading history**,
So that **I can manage content I want to return to**.

**Acceptance Criteria:**

**Given** a logged-in reader viewing an article
**When** they click the Bookmark button
**Then** the article is added to their bookmarks
**And** button changes to show "bookmarked" state

**When** they visit their bookmarks page
**Then** they see all their bookmarked articles
**And** can remove articles from bookmarks
**And** can organize bookmarks into lists

**When** they visit an article they previously read
**Then** it appears in their reading history
**And** shows how long ago they read it

**Prerequisites:** Stories 1.3, 3.1

**Technical Notes:**
- Bookmarks page: `/reader/bookmarks`
- Reading history: `/reader/history`
- Store in DB with user relationships
- Show read articles with visual indicator
- Support removing items from history
- Paginate results if many bookmarks

---

## Epic 6: Admin & Moderation

**Goal:** Provide admin tools for platform management, content moderation, and monitoring. Ensures quality and health of the platform.

### Story 6.1: Admin Dashboard Overview

As an **admin**,
I want to **see a high-level overview of platform health and activity**,
So that **I can monitor the platform at a glance**.

**Acceptance Criteria:**

**Given** an admin user visiting the admin dashboard
**When** the page loads
**Then** they see:
- Total users count
- Total articles count
- Monthly active users (MAU)
- Articles published this month
- Recent activity feed

**And** dashboard auto-refreshes data every minute

**Prerequisites:** Stories 1.3, 2.2

**Technical Notes:**
- Admin dashboard route: `/admin`
- Fetch aggregated stats from database
- Consider caching heavy calculations
- Use charts/graphs for visual representation
- Include quick actions (view recent articles, users, comments)

---

### Story 6.2: User Management

As an **admin**,
I want to **manage users (view, edit, delete, change roles)**,
So that **I can control platform access**.

**Acceptance Criteria:**

**Given** an admin on the users management page
**When** they search for a user
**Then** matching users appear in a list
**And** they can view user details

**When** they change a user's role
**Then** the change is saved and effective immediately

**When** they click "Deactivate User"
**Then** the user cannot log in
**And** their profile is hidden from the public

**Prerequisites:** Stories 1.3, 2.2

**Technical Notes:**
- Users management page: `/admin/users`
- Implement filtering and sorting
- Bulk actions (change role, deactivate multiple users)
- Audit log for user changes
- Cannot delete own admin account

---

### Story 6.3: Content Moderation

As an **admin**,
I want to **review and approve articles before publication**,
So that **the platform maintains quality and avoids inappropriate content**.

**Acceptance Criteria:**

**Given** an admin on the content moderation page
**When** they see pending articles
**Then** they can view article preview
**And** approve or reject with optional reason

**When** they approve an article
**Then** it transitions to published state
**And** author is notified

**When** they reject an article
**Then** author receives notification with reason
**And** article remains in draft for author to revise

**And** admins can view published articles and unpublish if needed

**Prerequisites:** Stories 1.3, 2.2, 4.1

**Technical Notes:**
- Content moderation page: `/admin/moderation`
- Queue shows pending articles for approval
- Preview shows full article formatting
- Email notifications: approval, rejection
- Audit trail of all moderation actions

---

### Story 6.4: Analytics & Reporting

As an **admin**,
I want to **view detailed analytics about platform usage**,
So that **I can understand user behavior and platform performance**.

**Acceptance Criteria:**

**Given** an admin on the analytics page
**When** they view the dashboard
**Then** they see:
- User growth trends
- Article publication trends
- Most popular articles
- Top authors
- Engagement metrics (Anjali, comments, shares)

**When** they select a date range
**Then** data updates to reflect that period

**And** they can export reports as CSV

**Prerequisites:** Stories 1.3, 3.1, 4.4, 5.1

**Technical Notes:**
- Analytics page: `/admin/analytics`
- Integrate with Google Analytics
- Track custom events (anjali, comments, shares)
- Use charting library (Chart.js, Recharts)
- Consider time-series data storage for performance

---

### Story 6.5: Featured Content Management

As an **admin**,
I want to **select featured articles to showcase on the homepage**,
So that **I can highlight the best content**.

**Acceptance Criteria:**

**Given** an admin on the featured content page
**When** they search for articles
**Then** they can select articles to feature
**And** arrange featured articles in order

**When** they save the changes
**Then** homepage displays featured articles in that order
**And** featured articles show a badge/indicator

**And** they can unfeature articles anytime

**Prerequisites:** Stories 3.1, 4.1

**Technical Notes:**
- Featured content page: `/admin/featured`
- Limit featured articles (e.g., 5-10 max)
- Drag-and-drop reordering
- Preview homepage with featured articles
- Feature timestamp tracking

---

## Epic 7: Performance & SEO Optimization

**Goal:** Optimize platform performance and search engine visibility. Critical for reach and user experience.

### Story 7.1: Image Optimization & CDN

As a **user**,
I want to **images to load quickly on any device**,
So that **the site feels fast and responsive**.

**Acceptance Criteria:**

**Given** an article with multiple images
**When** the page loads on mobile
**Then** images are appropriately sized for mobile
**And** load quickly without blocking page render

**When** accessed on desktop
**Then** images are optimized for larger screens

**And** all images are served through CDN
**And** image formats are optimized (WebP where supported)

**Prerequisites:** Stories 3.1, 4.1

**Technical Notes:**
- Use Next.js Image component with automatic optimization
- Implement responsive image srcset
- Lazy load images below the fold
- Serve WebP format with JPEG fallback
- Configure Vercel or Cloudflare CDN
- Monitor image delivery metrics

---

### Story 7.2: Core Web Vitals & Performance

As a **user**,
I want to **the site to load and feel fast**,
So that **I enjoy reading without frustration**.

**Acceptance Criteria:**

**Given** any page on Ariyadham
**When** loaded on a typical connection
**Then** First Contentful Paint (FCP) < 1.5 seconds
**And** Largest Contentful Paint (LCP) < 2.5 seconds
**And** Cumulative Layout Shift (CLS) < 0.1

**When** measured with Google PageSpeed Insights
**Then** score is > 85/100 on mobile and desktop

**Prerequisites:** Stories 7.1, 1.5

**Technical Notes:**
- Implement code splitting and lazy loading
- Minimize JavaScript bundle
- Optimize CSS delivery
- Server-side render for faster FCP
- Use service worker for caching
- Monitor with Web Vitals library
- Set performance budgets

---

### Story 7.3: SEO Foundation & Structured Data

As a **content creator**,
I want to **articles are discoverable through Google search**,
So that **more people find our dharma**.

**Acceptance Criteria:**

**Given** published articles
**When** Google crawls the site
**Then** all articles are indexed in Google Search
**And** appear in search results for relevant keywords

**When** articles are shared or viewed
**Then** rich snippets appear with title, image, description

**And** XML sitemap is auto-generated and submitted
**And** robots.txt is properly configured

**Prerequisites:** Stories 3.4, 4.2

**Technical Notes:**
- Implement Schema.org Article markup
- Generate dynamic sitemap.xml
- Robots.txt for search engine crawling
- Proper canonical URLs for multi-language
- Meta descriptions under 160 characters
- Open Graph tags for social sharing
- Submit sitemap to Google Search Console

---

### Story 7.4: Caching Strategy

As a **developer**,
I want to **implement intelligent caching**,
So that **repeated requests are served quickly**.

**Acceptance Criteria:**

**Given** requests to the same content
**When** content hasn't changed
**Then** cached version is served
**And** reduces database queries

**Given** published content
**When** new articles are published
**Then** affected caches are invalidated
**And** fresh content is displayed

**Prerequisites:** Stories 1.5, 7.2

**Technical Notes:**
- Browser caching headers (Cache-Control)
- Implement Redis caching (if needed)
- ISR (Incremental Static Regeneration) in Next.js for articles
- Cache article lists, categories, popular articles
- Invalidate caches on publish/update
- Monitor cache hit rate

---

## Epic 8: Multi-Language Support & Accessibility

**Goal:** Make Ariyadham accessible to all users regardless of language, ability, or device. Accessibility is sacred duty in Dharma context.

### Story 8.1: Internationalization (i18n) Setup

As a **user in different regions**,
I want to **use Ariyadham in my preferred language (Thai/English)**,
So that **I can understand and engage with content**.

**Acceptance Criteria:**

**Given** a user visiting the site for the first time
**When** browser language is Thai
**Then** interface displays in Thai

**When** user selects English from language switcher
**Then** all UI elements change to English
**And** preference is saved

**When** user logs in from another device
**Then** their language preference is restored

**And** all routes support `/th/*` and `/en/*` paths
**And** language switcher is accessible on every page

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use i18n framework (next-i18next or similar)
- Translation files: `/public/locales/[lang]/[namespace].json`
- Default language: Thai, fallback: English
- Store preference in user profile and localStorage
- Support both URL-based and cookie-based language selection
- SEO: hreflang tags for multi-language pages

---

### Story 8.2: Translate Dynamic Content (Articles)

As an **author and reader**,
I want to **articles can be published in multiple languages**,
So that **dharma reaches Thai and English speakers**.

**Acceptance Criteria:**

**Given** an author creating an article
**When** they publish in Thai
**Then** article is available at `/th/articles/[slug]`

**When** they provide English translation
**Then** same article is available at `/en/articles/[slug]`
**And** both versions have hreflang links to each other

**Given** a reader on the Thai version of an article
**When** English version exists
**Then** a "Read in English" link is shown

**Prerequisites:** Stories 4.1, 8.1

**Technical Notes:**
- Article table includes language field
- Articles can have multiple translations (one content per language)
- Display available language versions
- Both versions appear in search results
- Analytics tracked per language
- Authors can add/edit translations separately

---

### Story 8.3: WCAG 2.1 AA Accessibility

As a **user with disabilities**,
I want to **navigate and read content using accessibility features**,
So that **everyone can access dharma**.

**Acceptance Criteria:**

**Given** a user with screen reader
**When** they navigate the site
**Then** all content is read meaningfully
**And** interactive elements are announced properly

**Given** a user with low vision
**When** they increase font size to 200%
**Then** content remains readable and accessible
**And** no horizontal scrolling is required

**Given** a user who can't distinguish colors
**When** they view the site
**Then** information is not communicated by color alone

**And** all interactive elements are keyboard accessible (Tab, Enter)
**And** focus indicators are visible
**And** color contrast ratios meet WCAG AA (4.5:1 for text)

**Prerequisites:** Stories 3.1, 4.1, 2.4

**Technical Notes:**
- Semantic HTML: use proper heading hierarchy, alt text for images
- ARIA labels for interactive elements
- Test with screen readers (NVDA, JAWS)
- Keyboard navigation: Tab order, focus management
- Color contrast: use tools to verify ratios
- Support text zoom up to 200%
- Test with accessibility validators (axe, Wave)

---

### Story 8.4: Mobile-First Responsive Design

As a **user on mobile device**,
I want to **easily read and navigate on phone or tablet**,
So that **I can access dharma anywhere, anytime**.

**Acceptance Criteria:**

**Given** a user on iPhone
**When** they visit Ariyadham
**Then** content is readable and touchable
**And** buttons are at least 44x44px (touch-friendly)

**When** they rotate to landscape
**Then** content adapts to landscape layout

**Given** a user on tablet
**When** they view content
**Then** layout optimizes for larger screen

**And** all features work on mobile as well as desktop
**And** mobile navigation is intuitive

**Prerequisites:** Stories 3.1, 4.1

**Technical Notes:**
- Mobile-first design approach
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Touch targets min 44x44px (44px is mobile standard)
- Avoid hover-only interactions on mobile
- Test on various devices: iPhone, Android, iPad
- Performance optimized for 4G connections

---

### Story 8.5: Elderly User Accessibility (Senior-Friendly Mode)

As an **elderly user**,
I want to **use Ariyadham with larger text, simpler navigation, and clear design**,
So that **I can comfortably read dharma**.

**Acceptance Criteria:**

**Given** a user enabling "Senior Mode" from accessibility settings
**When** they browse the site
**Then** text is automatically larger (120% of normal)
**And** navigation menu is simplified
**And** colors have high contrast
**And** animations are reduced/disabled

**When** they use the site
**Then** all buttons are clearly labeled and large
**And** forms are simple with minimal options
**And** error messages are clear and helpful

**Prerequisites:** Stories 2.4, 8.3

**Technical Notes:**
- Add "Senior Mode" preference in settings
- Increase base font size by 20-30%
- Simplify interface: hide less important features
- Increase line height and letter spacing
- Use larger icons
- Provide phone number for support
- Consider text-to-speech integration (future)

---

## Epic Summary & Sequencing

### Recommended Development Order

1. **Epic 1: Foundation** (Weeks 1-2)
   - Sets up everything needed for subsequent epics
   - Must complete before starting other epics

2. **Epic 2: Authentication** (Weeks 3-4)
   - Enables user accounts and personalization
   - Prerequisite for reader and author features

3. **Epic 3: Reader Experience** (Weeks 4-6)
   - Core user value: reading articles
   - Can be built in parallel with authentication completion

4. **Epic 4: Author CMS** (Weeks 6-8)
   - Enables content creation
   - Depends on foundation and basic reader experience

5. **Epics 5-6: Community & Admin** (Weeks 8-10)
   - Polish user experience and enable scaling
   - Can be developed in parallel

6. **Epics 7-8: Performance & Accessibility** (Weeks 10-12)
   - Optimization and scaling
   - Some work can begin earlier (performance budgets, i18n setup)

**Total Estimated Timeline: 12 weeks for MVP**

### Dependencies Summary

- Epic 1 (Foundation) → No dependencies (start here)
- Epic 2 (Auth) → Depends on Epic 1
- Epic 3 (Reader) → Depends on Epics 1-2
- Epic 4 (Author CMS) → Depends on Epics 1-2, 3
- Epic 5 (Community) → Depends on Epics 1-3
- Epic 6 (Admin) → Depends on Epics 1-4
- Epic 7 (Performance) → Can start early, accelerates after Epics 3-4
- Epic 8 (i18n/Accessibility) → Can start early, integrates throughout

### Quality Gates

Before moving to next epic:
- All stories in current epic have passing tests
- Code review completed
- No critical bugs open
- Performance benchmarks meet targets

---

## Implementation Notes for Development Teams

### Story Completion Checklist

For each story:
- ✅ Code written and tested
- ✅ Unit tests pass (>80% coverage)
- ✅ Integration tests pass
- ✅ Code reviewed by peer
- ✅ Database migrations tested
- ✅ Performance impact assessed
- ✅ Accessibility verified
- ✅ Documentation updated

### Context for Development Agents

Each epic/story includes:
- Clear user story format
- BDD-style acceptance criteria
- Technical implementation notes
- Database schema considerations
- Performance guidelines
- Accessibility requirements

### Using This Epic Document

1. **For Planning:** Use epic structure and sequencing
2. **For Implementation:** Expand each story into detailed technical specs using the `create-story` workflow
3. **For Testing:** Use acceptance criteria as test scenarios
4. **For Progress Tracking:** Track story completion in sprint board

---

_This epic breakdown transforms Ariyadham's PRD into actionable implementation stories, optimized for autonomous development with comprehensive context._

_Ready for: Technical architecture design, Sprint planning, Story-level implementation._
