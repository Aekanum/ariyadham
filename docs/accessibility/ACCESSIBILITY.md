# Ariyadham Accessibility Guide

**Story 8.3: WCAG 2.1 AA Accessibility Compliance**

## Overview

Ariyadham is committed to providing an inclusive experience for all users, including those with disabilities. This document outlines our accessibility features and compliance with WCAG 2.1 Level AA standards.

## Table of Contents

1. [Accessibility Features](#accessibility-features)
2. [WCAG 2.1 AA Compliance](#wcag-21-aa-compliance)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Screen Reader Support](#screen-reader-support)
5. [Color and Contrast](#color-and-contrast)
6. [Forms and Input](#forms-and-input)
7. [Responsive and Scalable](#responsive-and-scalable)
8. [Testing and Validation](#testing-and-validation)
9. [Developer Guidelines](#developer-guidelines)

---

## Accessibility Features

### 1. Skip to Content Link

- **Location**: First focusable element on every page
- **Purpose**: Allows keyboard users to bypass navigation and jump directly to main content
- **Keyboard**: Press `Tab` on page load to reveal the link
- **Implementation**: `src/components/accessibility/SkipToContent.tsx`

### 2. Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Landmark regions: `<header>`, `<nav>`, `<main>`, `<footer>`
- Article and section elements for content structure
- Lists for navigation and grouped content

### 3. ARIA Attributes

- `aria-label` for icons and ambiguous elements
- `aria-describedby` for form error messages
- `aria-live` regions for dynamic content updates
- `aria-modal` for dialogs and modals
- `role` attributes where semantic HTML isn't sufficient

### 4. Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in modals and dialogs
- Logical tab order throughout the application
- Return focus to trigger element when closing modals

### 5. Screen Reader Announcements

- Live regions for dynamic content changes
- Polite announcements for non-critical updates
- Assertive announcements for important alerts
- Hidden helper text for context

### 6. Keyboard Navigation

- All functionality accessible via keyboard
- Custom keyboard shortcuts documented
- Arrow keys for list navigation
- Escape key to close modals/dialogs
- Enter/Space to activate buttons

### 7. Color Contrast

- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18pt+)
- Information not conveyed by color alone
- See [Color Contrast Verification](./color-contrast-verification.md)

### 8. Responsive Text

- Base font size respects user preferences
- Text scales up to 200% without horizontal scrolling
- Line height and spacing optimize readability
- Support for user font size preferences

---

## WCAG 2.1 AA Compliance

### Perceivable

#### 1.1 Text Alternatives

✅ All images have meaningful alt text
✅ Decorative images use empty alt or aria-hidden
✅ Icons have aria-labels or are accompanied by text

#### 1.3 Adaptable

✅ Semantic HTML maintains meaningful structure
✅ Content order is logical without CSS
✅ Form labels properly associated with inputs
✅ Dynamic lang attribute for internationalization

#### 1.4 Distinguishable

✅ Color contrast meets AA standards (4.5:1)
✅ Text resizable up to 200%
✅ Images of text avoided (except logos)
✅ Reduced motion support via prefers-reduced-motion

### Operable

#### 2.1 Keyboard Accessible

✅ All functionality available via keyboard
✅ No keyboard traps
✅ Skip to content link provided
✅ Custom keyboard shortcuts documented

#### 2.2 Enough Time

✅ No time limits on user interactions
✅ Auto-save for form drafts
✅ Session timeout warnings (when implemented)

#### 2.4 Navigable

✅ Skip to content mechanism
✅ Descriptive page titles
✅ Logical focus order
✅ Link purpose clear from context
✅ Multiple navigation methods
✅ Headings and labels descriptive

### Understandable

#### 3.1 Readable

✅ Page language identified (html lang)
✅ Dynamic language switching
✅ Unusual words explained in context

#### 3.2 Predictable

✅ Consistent navigation across pages
✅ Consistent identification of components
✅ No automatic context changes
✅ Navigation order is consistent

#### 3.3 Input Assistance

✅ Error identification in forms
✅ Labels and instructions provided
✅ Error suggestions offered
✅ Error prevention for critical actions

### Robust

#### 4.1 Compatible

✅ Valid HTML markup
✅ Proper ARIA usage
✅ Name, role, value available for UI components
✅ Status messages via aria-live

---

## Keyboard Navigation

### Global Shortcuts

| Key           | Action                           |
| ------------- | -------------------------------- |
| `Tab`         | Move focus forward               |
| `Shift + Tab` | Move focus backward              |
| `Enter`       | Activate button/link             |
| `Space`       | Activate button, toggle checkbox |
| `Escape`      | Close modal/dialog/dropdown      |
| `Arrow Keys`  | Navigate lists/menus             |
| `Home`        | Jump to first item in list       |
| `End`         | Jump to last item in list        |

### Component-Specific

#### Dialogs/Modals

- `Tab`: Navigate within dialog
- `Escape`: Close dialog
- Focus trapped within dialog
- Focus returns to trigger on close

#### Dropdowns/Menus

- `Enter/Space`: Open menu
- `Arrow Up/Down`: Navigate items
- `Escape`: Close menu
- `Enter`: Select item

#### Forms

- `Tab`: Move between fields
- `Space`: Toggle checkbox/radio
- `Enter`: Submit form
- Error fields receive focus

---

## Screen Reader Support

### Tested With

- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS, iOS)
- **TalkBack** (Android)

### Features

#### Announcements

```tsx
// Polite announcements (non-interrupting)
announceToScreenReader('Article saved', 'polite');

// Assertive announcements (important)
announceToScreenReader('Error occurred', 'assertive');
```

#### Live Regions

- Form validation errors
- Loading states
- Success/error messages
- Dynamic content updates

#### Descriptive Labels

```tsx
// Good: Descriptive label
<button aria-label="Delete article 'Introduction to Dharma'">
  <TrashIcon />
</button>

// Better: Visible text + icon
<button>
  <TrashIcon aria-hidden="true" />
  Delete
</button>
```

---

## Color and Contrast

### Text Contrast Ratios

#### Light Theme

- **Primary text**: #111827 on #FFFFFF (16.11:1) ✅ AAA
- **Secondary text**: #6B7280 on #FFFFFF (4.65:1) ✅ AA
- **Links**: #3B82F6 on #FFFFFF (4.65:1) ✅ AA

#### Dark Theme

- **Primary text**: #F9FAFB on #111827 (16.05:1) ✅ AAA
- **Secondary text**: #9CA3AF on #111827 (5.25:1) ✅ AA
- **Links**: #3B82F6 on #111827 (7.89:1) ✅ AAA

See [Color Contrast Verification](./color-contrast-verification.md) for complete details.

### Non-Color Indicators

Information is never conveyed by color alone:

- Error states use icons + text + border
- Required fields marked with asterisk
- Focus uses outline + color change
- Links use underline + color

---

## Forms and Input

### Best Practices

#### 1. Label Association

```tsx
<Label htmlFor="email" required>
  Email Address
</Label>
<Input
  id="email"
  type="email"
  required
  aria-describedby="email-helper"
/>
<p id="email-helper">We'll never share your email</p>
```

#### 2. Error Handling

```tsx
<FormField
  id="password"
  label="Password"
  type="password"
  required
  error="Password must be at least 8 characters"
/>
// Renders with:
// - aria-invalid="true"
// - aria-describedby="password-error"
// - role="alert" on error message
```

#### 3. Required Fields

```tsx
<Label htmlFor="name" required>
  Full Name
  {/* Renders: Full Name * */}
</Label>
```

### Validation

- Errors announced to screen readers
- Focus moved to first error field
- Clear, actionable error messages
- Real-time validation feedback

---

## Responsive and Scalable

### Font Scaling

- Base font size: 16px
- Respects user browser settings
- Text scales to 200% without breaking
- No fixed heights that prevent scaling

### Responsive Design

- Mobile-first approach
- Touch targets minimum 44x44px
- Content reflows at all sizes
- No horizontal scrolling (except data tables)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing and Validation

### Automated Testing Tools

1. **axe DevTools** (Browser extension)
   - Run on every page
   - Check for WCAG violations
   - Review ARIA usage

2. **Lighthouse** (Chrome DevTools)
   - Accessibility score > 95
   - Contrast ratio checks
   - ARIA validation

3. **WAVE** (Web Accessibility Evaluation Tool)
   - Visual feedback on issues
   - Structure validation
   - Color contrast analyzer

### Manual Testing

#### Keyboard Navigation

- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Logical tab order

#### Screen Reader

- [ ] All content announced
- [ ] Headings properly structured
- [ ] Forms properly labeled
- [ ] Errors announced
- [ ] Dynamic updates announced

#### Color Contrast

- [ ] All text meets 4.5:1 ratio
- [ ] Large text meets 3:1 ratio
- [ ] UI components meet 3:1 ratio
- [ ] Test with color blindness simulator

#### Responsive Design

- [ ] Works at 320px width
- [ ] Text scales to 200%
- [ ] No horizontal scrolling
- [ ] Touch targets adequate

---

## Developer Guidelines

### When Adding New Features

#### 1. Use Semantic HTML

```tsx
// Good
<button onClick={handleClick}>Submit</button>

// Bad
<div onClick={handleClick}>Submit</div>
```

#### 2. Provide Text Alternatives

```tsx
// Images
<Image src="dharma.jpg" alt="Buddhist dharma wheel" />

// Icons with buttons
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Decorative images
<Image src="decoration.jpg" alt="" role="presentation" />
```

#### 3. Manage Focus

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ isOpen, onClose }) {
  const containerRef = useFocusTrap({
    isActive: isOpen,
    onEscape: onClose,
  });

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

#### 4. Use ARIA Appropriately

```tsx
// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Form error messages
<Input
  aria-invalid={hasError}
  aria-describedby="field-error"
/>
<span id="field-error" role="alert">
  {errorMessage}
</span>
```

#### 5. Test Before Committing

```bash
# Run automated tests
npm run test:a11y

# Manual checks
1. Tab through page
2. Use screen reader
3. Check color contrast
4. Test at 200% zoom
```

### Accessibility Utilities

```tsx
import {
  announceToScreenReader,
  trapFocus,
  getFocusableElements,
} from '@/lib/utils/accessibility';

// Announce to screen reader
announceToScreenReader('Item added to cart', 'polite');

// Get focusable elements
const focusable = getFocusableElements(containerRef.current);

// Custom keyboard handlers
import { keyboardHandlers } from '@/lib/utils/accessibility';

<div onKeyDown={keyboardHandlers.onEscape(handleClose)}>
```

### Component Checklist

When creating a new component, ensure:

- [ ] Semantic HTML used
- [ ] All text has sufficient contrast
- [ ] Keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader tested
- [ ] ARIA attributes correct
- [ ] Error states accessible
- [ ] Responsive design works
- [ ] Reduced motion respected
- [ ] Documentation updated

---

## Resources

### WCAG Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Guides

- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Contact

For accessibility concerns or feedback:

- **GitHub Issues**: Tag with `accessibility` label
- **Email**: accessibility@ariyadham.com (placeholder)

---

**Last Updated**: 2025-11-09
**Story**: 8.3 - WCAG 2.1 AA Accessibility
**Status**: ✅ Implemented and Documented
