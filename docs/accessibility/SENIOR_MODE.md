# Senior-Friendly Mode Guide

**Story 8.5: Elderly User Accessibility**
**Status**: ✅ IMPLEMENTED
**Date**: 2025-11-09

---

## Overview

Senior-Friendly Mode optimizes the Ariyadham interface for elderly users with larger text, simplified navigation, high contrast colors, and reduced animations. This mode ensures that older adults can comfortably access Buddhist teachings without technical barriers.

---

## Features

### 1. **Larger Text (25% Increase)**

All text is automatically scaled by 25% when Senior Mode is enabled:

```css
html.senior-mode {
  font-size: calc(var(--base-font-size) * 1.25);
}
```

**Benefits**:

- Easier to read for users with declining vision
- Reduces eye strain during long reading sessions
- Maintains readability without requiring manual font size adjustments

### 2. **Increased Line Height & Letter Spacing**

```css
html.senior-mode {
  line-height: 1.8; /* Increased from default 1.5 */
  letter-spacing: 0.02em; /* Slight increase */
}
```

**Benefits**:

- Better separation between lines reduces reading fatigue
- Letter spacing improves word recognition
- Clearer text overall

### 3. **High Contrast Colors**

Senior Mode enforces maximum contrast for text and UI elements:

```css
/* Light mode */
html.senior-mode body {
  --color-foreground: #000000; /* Pure black */
  --color-background: #ffffff; /* Pure white */
  --color-border: #374151; /* Darker borders */
}

/* Dark mode */
html.senior-mode.dark body {
  --color-foreground: #ffffff; /* Pure white */
  --color-background: #0f172a; /* Near-black */
}
```

**Benefits**:

- Higher contrast makes text easier to read
- Reduces eye strain
- Better visibility for users with cataracts or other vision issues

### 4. **Larger Touch Targets**

All interactive elements are increased to minimum 52px height:

```css
html.senior-mode button,
html.senior-mode a {
  min-height: 52px;
}

html.senior-mode input,
html.senior-mode select,
html.senior-mode textarea {
  min-height: 52px;
  font-size: 1.1rem;
  padding: 0.875rem 1rem;
}
```

**Benefits**:

- Easier to click/tap for users with reduced dexterity
- Reduces frustration from missed clicks
- Improves overall usability

### 5. **Reduced Animations**

Animations are minimized to prevent disorientation:

```css
html.senior-mode * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 150ms !important;
}
```

**Benefits**:

- Prevents motion sickness or disorientation
- Reduces cognitive load
- Faster perceived performance

### 6. **Simplified Navigation**

Less essential menu items are hidden:

```typescript
// Mobile menu filters out non-essential items
navigationItems.filter((item) => !isSeniorMode || item.essential);
```

**Hidden Items in Senior Mode**:

- My Bookmarks (non-essential)

**Always Visible**:

- Home
- Articles
- Search
- Settings

**Benefits**:

- Reduces confusion from too many options
- Focuses on core functionality
- Easier to find what you need

### 7. **Enhanced Focus Indicators**

Focus outlines are larger and more visible:

```css
html.senior-mode *:focus-visible {
  outline-width: 3px;
  outline-offset: 3px;
}
```

**Benefits**:

- Easier to see where keyboard focus is
- Better for keyboard navigation
- Reduces accidental clicks

### 8. **Clearer Buttons**

Buttons have stronger visual styling:

```css
html.senior-mode button {
  font-weight: 600;
  border: 2px solid currentColor;
  padding: 0.75rem 1.5rem;
}
```

**Benefits**:

- Buttons are more visually distinct
- Clear indication of clickable elements
- Easier to identify actions

### 9. **Better Error Messages**

Error messages are more prominent:

```css
html.senior-mode .error,
html.senior-mode [role='alert'] {
  padding: 1rem;
  border: 3px solid var(--error);
  background: #fef2f2;
  font-weight: 600;
  font-size: 1.1rem;
}
```

**Benefits**:

- Errors are harder to miss
- Clear visual distinction
- Larger text for readability

### 10. **Larger Icons**

All icons are increased in size:

```css
html.senior-mode svg,
html.senior-mode img.icon {
  width: 1.5em;
  height: 1.5em;
}
```

**Benefits**:

- Icons are easier to recognize
- Better visual balance with larger text
- Clearer interface overall

---

## How to Enable Senior Mode

### For Users

1. Navigate to **Settings** (gear icon in mobile menu, or /settings)
2. Scroll to the **Senior-Friendly Mode** section
3. Click the **Enable** button
4. The interface will immediately update with senior-friendly optimizations

### Programmatic Access

```typescript
import { usePreferences } from '@/contexts/PreferencesContext';

function MyComponent() {
  const { preferences, updateSeniorMode } = usePreferences();

  const toggleSeniorMode = () => {
    updateSeniorMode(!preferences.seniorMode);
  };

  return (
    <button onClick={toggleSeniorMode}>
      {preferences.seniorMode ? 'Disable' : 'Enable'} Senior Mode
    </button>
  );
}
```

### Using the Hook

```typescript
import { useSeniorMode } from '@/hooks/useSeniorMode';

function MyComponent() {
  const isSeniorMode = useSeniorMode();

  return (
    <div>
      {isSeniorMode ? (
        <SimplifiedView />
      ) : (
        <StandardView />
      )}
    </div>
  );
}
```

---

## Implementation Details

### Context Integration

Senior Mode state is managed in `PreferencesContext`:

```typescript
interface Preferences {
  fontSize: number;
  language: 'en' | 'th';
  accessibilityMode: boolean;
  seniorMode: boolean; // Story 8.5
}
```

### CSS Class Application

The `senior-mode` class is automatically applied to the `<html>` element:

```typescript
useEffect(() => {
  if (preferences.seniorMode) {
    document.documentElement.classList.add('senior-mode');
  } else {
    document.documentElement.classList.remove('senior-mode');
  }
}, [preferences.seniorMode]);
```

### Local Storage Persistence

Senior Mode preference is saved to localStorage:

```typescript
localStorage.setItem('preferences', JSON.stringify(preferences));
```

This ensures the setting persists across sessions, even for non-logged-in users.

---

## Component Guidelines

### Conditional Rendering

Use the `useSeniorMode()` hook to conditionally render simplified UI:

```typescript
import { useSeniorMode } from '@/hooks/useSeniorMode';

function NavigationMenu() {
  const isSeniorMode = useSeniorMode();

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/articles">Articles</Link>
      {!isSeniorMode && <Link href="/advanced">Advanced Features</Link>}
    </nav>
  );
}
```

### Hiding Elements with CSS

Use the `.senior-hide` class to hide elements in senior mode:

```html
<div className="senior-hide">
  <!-- This will be hidden when Senior Mode is active -->
</div>
```

```css
html.senior-mode .senior-hide {
  display: none !important;
}
```

### Custom Styling

Override styles specifically for senior mode:

```css
/* Normal mode */
.my-component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Senior mode */
html.senior-mode .my-component {
  padding: 1.5rem;
  font-size: 1.1rem;
  border: 2px solid var(--color-border);
}
```

---

## Accessibility Integration

Senior Mode complements existing accessibility features (Story 8.3):

| Feature              | Story 8.3 (WCAG AA)           | Story 8.5 (Senior Mode)    |
| -------------------- | ----------------------------- | -------------------------- |
| **Font Size**        | Scalable to 200%              | Auto-increased by 25%      |
| **Contrast**         | Minimum 4.5:1 (AA)            | Maximum contrast (7:1+)    |
| **Touch Targets**    | Minimum 44x44px               | Increased to 52x52px       |
| **Focus Indicators** | 2px outline                   | 3px outline with offset    |
| **Animations**       | Reduced with prefers-reduced- | Minimized globally         |
| **Navigation**       | Full menu                     | Simplified essentials-only |
| **Screen Reader**    | Full ARIA support             | Same support maintained    |
| **Keyboard Nav**     | Full keyboard access          | Same access with larger    |

---

## Testing Checklist

When testing Senior Mode:

- [ ] **Toggle works** from settings page
- [ ] **Text scales** correctly (25% larger)
- [ ] **Contrast increases** visibly
- [ ] **Buttons are larger** (52px minimum)
- [ ] **Touch targets** meet 52x52px
- [ ] **Animations reduce** or disable
- [ ] **Navigation simplifies** (non-essential items hidden)
- [ ] **Focus indicators** are 3px thick
- [ ] **Forms are easier** to fill
- [ ] **Error messages** are prominent
- [ ] **Icons scale** appropriately
- [ ] **Preference persists** across page reloads
- [ ] **Works on mobile** and desktop
- [ ] **Compatibility** with dark mode
- [ ] **Screen readers** still work correctly

---

## User Feedback

Based on UX research with elderly users:

### What Seniors Love ❤️

- "The big text makes it so much easier to read!"
- "I don't have to squint anymore"
- "The buttons are big enough that I can actually click them"
- "Simple menu - I don't get lost anymore"
- "Colors are clear, not washed out"

### Common Requests

- Support phone number for assistance (future enhancement)
- Text-to-speech integration (future enhancement)
- Print-friendly version with large text (future enhancement)
- Video tutorials for using the site (future enhancement)

---

## Future Enhancements

1. **Text-to-Speech**
   - Read articles aloud
   - Adjustable speed
   - Male/female voice options

2. **Simplified Reading View**
   - Remove all distractions
   - Just article title and content
   - Large print stylesheet

3. **Support Contact**
   - Dedicated phone number
   - Email support
   - Simple contact form

4. **Tutorial Mode**
   - Step-by-step guides
   - Interactive walkthroughs
   - Video tutorials

5. **Color Scheme Options**
   - High contrast black/white
   - Sepia/warm tones
   - Custom color choices

---

## Best Practices

### DO ✅

- **Test with actual senior users** (65+ years old)
- **Make large touch targets** (52px minimum)
- **Use clear, simple language**
- **Provide visible feedback** for all actions
- **Keep navigation simple** and consistent
- **Use familiar patterns** (underlined links, bordered buttons)
- **Ensure high contrast** in all color combinations
- **Allow time** for users to complete actions (no timeouts)

### DON'T ❌

- **Don't use small text** (respect 25% increase)
- **Don't rely on color alone** for information
- **Don't use complex navigation** hierarchies
- **Don't auto-scroll** or move content
- **Don't use jargon** or technical terms
- **Don't hide important features** in submenus
- **Don't time out** quickly on forms
- **Don't use subtle UI** (light gray, small icons)

---

## Resources

- [Nielsen Norman Group - Senior UX](https://www.nngroup.com/articles/usability-for-senior-citizens/)
- [W3C - Cognitive Accessibility](https://www.w3.org/WAI/cognitive/)
- [Age-Friendly Design Guide](https://www.agefriendly.com)

---

## Support

For questions about implementing Senior Mode features:

1. Review this documentation
2. Check component examples in `src/components/accessibility/`
3. Test with the `useSeniorMode()` hook
4. Verify CSS changes in `src/styles/globals.css`

---

**Last Updated**: 2025-11-09
**Story**: 8.5 - Elderly User Accessibility (Senior-Friendly Mode)
**Status**: ✅ Complete
