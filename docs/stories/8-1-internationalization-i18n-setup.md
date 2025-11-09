# Story 8.1: Internationalization (i18n) Setup

**Epic:** 8 - Multi-Language & Accessibility
**Story ID:** 8.1
**Status:** In Progress
**Assigned To:** Dev Agent
**Created:** 2025-11-09

---

## Story Description

As a **platform user**,
I want **the Ariyadham platform to support both Thai and English languages**,
So that **users can choose their preferred language and access content in their native language**.

---

## Context

Ariyadham serves a diverse audience including Thai speakers and English speakers. To maximize accessibility and reach, the platform must support both languages seamlessly. This story establishes the foundation for internationalization (i18n) by setting up the infrastructure, translation files, and language switching mechanism.

**Referenced Requirements:**
- PRD Section: Multi-Language Support (FR4.1, FR4.2)
- Architecture: next-i18next for i18n implementation

---

## Acceptance Criteria

### AC1: i18n Library Configuration
**Given** the Next.js application,
**When** next-i18next is installed and configured,
**Then:**
- [ ] `next-i18next` package is installed
- [ ] `next-i18next.config.js` is created with proper configuration
- [ ] Default language is set to Thai (`th`)
- [ ] Supported languages include Thai (`th`) and English (`en`)
- [ ] Translation namespaces are configured (common, auth, reader, author, admin)

### AC2: Translation File Structure
**Given** the i18n setup,
**When** the translation file structure is created,
**Then:**
- [ ] Translation files exist at `public/locales/th/` and `public/locales/en/`
- [ ] Namespaced translation files are created:
  - `common.json` - Common UI elements, navigation, buttons
  - `auth.json` - Authentication pages (login, signup, forgot password)
  - `reader.json` - Reader features (articles, categories, bookmarks)
  - `author.json` - Author/CMS features (dashboard, article creation)
  - `admin.json` - Admin features (user management, moderation)
- [ ] Each namespace contains at least 10 essential translations

### AC3: Language Switcher Component
**Given** the translation infrastructure,
**When** a language switcher component is created,
**Then:**
- [ ] `LanguageSwitcher` component exists in `components/layout/`
- [ ] Component displays current language (TH/EN)
- [ ] Component allows switching between Thai and English
- [ ] Language preference is persisted in localStorage
- [ ] Language preference is reflected in the URL (e.g., `/th/`, `/en/`)
- [ ] Page content updates immediately when language is changed

### AC4: Next.js Middleware for i18n
**Given** the i18n configuration,
**When** middleware is configured,
**Then:**
- [ ] `middleware.ts` includes i18n routing logic
- [ ] Requests are automatically redirected to language-prefixed URLs
- [ ] Default language (Thai) is used if no preference is set
- [ ] Language detection works from:
  - URL path prefix
  - localStorage preference
  - Accept-Language header (fallback)

### AC5: Integration with Existing Pages
**Given** the i18n infrastructure,
**When** homepage and navigation are updated,
**Then:**
- [ ] Homepage (`app/page.tsx`) uses i18n translations
- [ ] Navigation component uses i18n translations
- [ ] All static text is extracted to translation files
- [ ] No hardcoded text remains in the UI
- [ ] Both Thai and English versions render correctly

### AC6: Testing & Documentation
**Given** the completed i18n setup,
**When** testing is performed,
**Then:**
- [ ] Language switching works on all major pages
- [ ] No console errors when switching languages
- [ ] Translations load correctly on first visit
- [ ] Language preference persists across page reloads
- [ ] Documentation is created in `docs/I18N.md`
- [ ] README is updated with i18n setup instructions

---

## Technical Implementation

### 1. Install Dependencies

```bash
npm install next-i18next react-i18next i18next
```

### 2. Create Configuration

**File:** `next-i18next.config.js`

```javascript
module.exports = {
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en'],
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
```

### 3. Update Next.js Configuration

**File:** `next.config.js`

```javascript
const { i18n } = require('./next-i18next.config');

module.exports = {
  // ... existing config
  i18n,
};
```

### 4. Translation File Structure

```
public/
└── locales/
    ├── th/
    │   ├── common.json
    │   ├── auth.json
    │   ├── reader.json
    │   ├── author.json
    │   └── admin.json
    └── en/
        ├── common.json
        ├── auth.json
        ├── reader.json
        ├── author.json
        └── admin.json
```

### 5. Language Switcher Component

**File:** `components/layout/LanguageSwitcher.tsx`

```typescript
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div>
      <button onClick={() => changeLanguage('th')}>ไทย</button>
      <button onClick={() => changeLanguage('en')}>EN</button>
    </div>
  );
}
```

### 6. Middleware for i18n Routing

**File:** `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const locales = ['th', 'en'];
const defaultLocale = 'th';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to default locale
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

---

## Definition of Done (DoD)

- [ ] Code implemented and follows project architecture patterns
- [ ] All acceptance criteria met
- [ ] next-i18next installed and configured
- [ ] Translation files created for Thai and English
- [ ] Language switcher component implemented
- [ ] Middleware configured for i18n routing
- [ ] Homepage and navigation use translations
- [ ] No hardcoded text in UI components
- [ ] Code passes lint, type-check, and format checks
- [ ] Build succeeds without errors
- [ ] Manual testing completed:
  - Language switching works
  - Translations load correctly
  - No console errors
  - Language preference persists
- [ ] Documentation created (docs/I18N.md)
- [ ] Code committed with clear commit message
- [ ] Changes pushed to branch
- [ ] Story marked as done in sprint-status.yaml

---

## Dependencies

**Requires:**
- Epic 1-7 complete (foundation established)

**Blocks:**
- Story 8.2: Translate Dynamic Content (Articles)
- Story 8.3: WCAG 2.1 AA Accessibility
- Story 8.4: Mobile-First Responsive Design
- Story 8.5: Elderly User Accessibility

---

## Estimation

**Story Points:** 5
**Estimated Hours:** 8-12 hours

**Breakdown:**
- Configuration & setup: 2 hours
- Translation files creation: 3 hours
- Language switcher component: 2 hours
- Middleware & routing: 2 hours
- Integration & testing: 2 hours
- Documentation: 1 hour

---

## Notes

- Use next-i18next as specified in architecture
- Follow Next.js 14 App Router patterns
- Ensure all translations are reviewed by native speakers before production
- Consider right-to-left (RTL) support for future languages
- Plan for dynamic content translation (Story 8.2)

---

## References

- PRD: Multi-Language Support (Section FR4)
- Architecture: Internationalization (next-i18next)
- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [Next.js i18n Documentation](https://nextjs.org/docs/advanced-features/i18n-routing)

---

**Story Created:** 2025-11-09
**Last Updated:** 2025-11-09
