# Story 2.4: User Preferences & Settings

**Epic**: 2 - Authentication & User Management
**Status**: 🔨 IN PROGRESS
**Started**: 2025-11-08
**Completed**: -

---

## Story

**As a** user
**I want to** customize my reading preferences (theme, font size, language)
**So that** my experience is personalized

---

## Acceptance Criteria

### ✅ Theme Customization

**Given** a user on the settings page
**When** they toggle Dark Mode
**Then** the entire interface switches theme
**And** preference is saved and persists

### ✅ Font Size Adjustment

**When** they adjust font size
**Then** text size changes immediately
**And** preference is saved

### ✅ Language Selection

**When** they select preferred language
**Then** interface switches to that language
**And** preference is remembered

### Implementation Checklist

- [ ] Verify user_profiles table has preference columns
- [ ] Create ThemeContext and provider
- [ ] Create PreferencesContext for font size
- [ ] Implement CSS custom properties for theme
- [ ] Create settings page UI
- [ ] Create API route for updating preferences
- [ ] Implement theme switcher component
- [ ] Implement font size slider
- [ ] Implement language selector
- [ ] Sync preferences with localStorage
- [ ] Load preferences on login
- [ ] Apply theme on app load
- [ ] Update navigation to include settings link

---

## Technical Implementation

### 1. Database Schema

The `user_profiles` table already includes preference fields from Story 1.2:

```sql
-- These fields already exist in user_profiles table
language_preference VARCHAR(2) DEFAULT 'en' NOT NULL CHECK (language_preference IN ('en', 'th'));
theme_preference VARCHAR(10) DEFAULT 'system' NOT NULL CHECK (theme_preference IN ('light', 'dark', 'system'));
reading_font_size INTEGER DEFAULT 16 NOT NULL CHECK (reading_font_size BETWEEN 12 AND 24);
accessibility_mode BOOLEAN DEFAULT false NOT NULL;
```

No migration needed - these were created in Story 1.2.

### 2. Theme Context

**File: `src/contexts/ThemeContext.tsx`**

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Resolve system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = () => {
      if (theme === 'system') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return theme as ResolvedTheme;
    };

    setResolvedTheme(resolveTheme());

    const handler = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 3. Preferences Context

**File: `src/contexts/PreferencesContext.tsx`**

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Preferences {
  fontSize: number;
  language: 'en' | 'th';
  accessibilityMode: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updateFontSize: (size: number) => Promise<void>;
  updateLanguage: (lang: 'en' | 'th') => Promise<void>;
  updateAccessibilityMode: (enabled: boolean) => Promise<void>;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: Preferences = {
  fontSize: 16,
  language: 'en',
  accessibilityMode: false,
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  // Load preferences on mount and when user changes
  useEffect(() => {
    if (user) {
      setPreferences({
        fontSize: user.reading_font_size,
        language: user.language_preference,
        accessibilityMode: user.accessibility_mode,
      });
    } else {
      // Load from localStorage if not logged in
      const stored = localStorage.getItem('preferences');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch {
          // Ignore invalid localStorage data
        }
      }
    }
  }, [user]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${preferences.fontSize}px`);
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = async (key: keyof Preferences, value: any) => {
    setLoading(true);
    try {
      // Update local state immediately
      setPreferences((prev) => ({ ...prev, [key]: value }));

      // Update server if logged in
      if (user) {
        const response = await fetch('/api/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Revert on error
      if (user) {
        setPreferences({
          fontSize: user.reading_font_size,
          language: user.language_preference,
          accessibilityMode: user.accessibility_mode,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFontSize = (size: number) => updatePreference('fontSize', size);
  const updateLanguage = (lang: 'en' | 'th') => updatePreference('language', lang);
  const updateAccessibilityMode = (enabled: boolean) => updatePreference('accessibilityMode', enabled);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateFontSize,
        updateLanguage,
        updateAccessibilityMode,
        loading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
```

### 4. API Route for Preferences

**File: `app/api/preferences/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  fontSize: z.number().min(12).max(24).optional(),
  language: z.enum(['en', 'th']).optional(),
  accessibilityMode: z.boolean().optional(),
});

/**
 * PATCH /api/preferences
 * Update user preferences
 */
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // Validate request body
  const body = await request.json();
  const validation = updatePreferencesSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid request',
          details: validation.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { fontSize, language, accessibilityMode } = validation.data;

  // Build update object
  const updates: any = {};
  if (fontSize !== undefined) updates.reading_font_size = fontSize;
  if (language !== undefined) updates.language_preference = language;
  if (accessibilityMode !== undefined) updates.accessibility_mode = accessibilityMode;

  // Update preferences
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update preferences',
          code: 'UPDATE_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: updates,
  });
}
```

### 5. Settings Page

**File: `app/settings/page.tsx`**

```typescript
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { preferences, updateFontSize, updateLanguage, updateAccessibilityMode, loading } =
    usePreferences();
  const [saveMessage, setSaveMessage] = useState('');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    showSaveMessage('Theme updated');
  };

  const handleFontSizeChange = async (size: number) => {
    await updateFontSize(size);
    showSaveMessage('Font size updated');
  };

  const handleLanguageChange = async (lang: 'en' | 'th') => {
    await updateLanguage(lang);
    showSaveMessage('Language updated');
  };

  const handleAccessibilityToggle = async (enabled: boolean) => {
    await updateAccessibilityMode(enabled);
    showSaveMessage('Accessibility mode updated');
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize your reading experience
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">{saveMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Theme Section */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                        theme === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Reading Preferences
            </h2>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size: {preferences.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={preferences.fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  disabled={loading}
                  className="mt-2 w-full accent-blue-600"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Smaller</span>
                  <span>Larger</span>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    disabled={loading}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      preferences.language === 'en'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('th')}
                    disabled={loading}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      preferences.language === 'th'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    ไทย (Thai)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Accessibility
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Accessibility Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enhanced features for better readability
                </p>
              </div>
              <button
                onClick={() => handleAccessibilityToggle(!preferences.accessibilityMode)}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.accessibilityMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.accessibilityMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Files to Create/Modify

```
app/
├── settings/
│   └── page.tsx                          # Settings page UI
├── api/
│   └── preferences/
│       └── route.ts                      # Preferences API
src/
├── contexts/
│   ├── ThemeContext.tsx                  # Theme management
│   └── PreferencesContext.tsx            # Font size, language, etc.
├── styles/
│   └── globals.css                       # Update with CSS custom properties
└── app/
    └── layout.tsx                        # Wrap with providers
```

---

## Prerequisites

- Story 2.1 ✅ (User Profile Management)

---

## Dependencies

**Existing:**

- `react` - React hooks
- User preferences already in database from Story 1.2

**No new dependencies needed**

---

## Quality Checks

### Type Safety

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Manual Testing

- [ ] Theme switches between light/dark/system
- [ ] Theme persists across page reloads
- [ ] Font size adjusts immediately
- [ ] Font size persists for logged-in users
- [ ] Language selection works
- [ ] Accessibility mode toggles
- [ ] Preferences sync with database when logged in
- [ ] Preferences stored in localStorage when not logged in
- [ ] System theme detection works
- [ ] Settings page accessible from navigation

---

## Security Considerations

### Authorization

- Only authenticated users can update preferences in database
- Non-authenticated users can only use localStorage
- Server-side validation of all preference values
- Range validation for font size (12-24px)

### Data Validation

- Theme: must be 'light', 'dark', or 'system'
- Language: must be 'en' or 'th'
- Font size: must be between 12 and 24
- Accessibility mode: must be boolean

---

## Accessibility

- Keyboard navigation for all controls
- Screen reader labels for all interactive elements
- High contrast mode support
- Focus indicators visible
- Toggle switches accessible
- Slider accessible with keyboard

---

## Next Steps

After completing Story 2.4:

### Epic 3: Reader Experience

Move to Epic 3 to build the article reading and browsing features.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 2.4, lines 344-373)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`
- **CSS Custom Properties**: MDN Web Docs
- **React Context**: React documentation

---

## Implementation Notes

### Design Principles

1. **Progressive Enhancement**: Works without JavaScript for basic theme
2. **Performance**: Minimal re-renders, efficient state updates
3. **User Control**: Immediate feedback, easy to understand
4. **Persistence**: Preferences survive across sessions
5. **Sync**: Server and local storage stay in sync

### Best Practices

- Use CSS custom properties for dynamic theming
- Debounce font size slider to reduce API calls
- Load theme early to prevent flash of wrong theme
- Provide visual feedback for all changes
- Handle offline scenarios gracefully
- Test with reduced motion preferences

### CSS Custom Properties

```css
:root {
  --base-font-size: 16px;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

.dark {
  --color-background: #111827;
  --color-text: #f9fafb;
}
```

---

🙏 May this feature empower users to create their ideal reading environment for dharma study.
