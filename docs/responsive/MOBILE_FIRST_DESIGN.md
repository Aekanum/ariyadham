# Mobile-First Responsive Design Guide

**Story 8.4: Mobile-First Responsive Design**
**Status**: ✅ IMPLEMENTED
**Date**: 2025-11-09

---

## Overview

This guide documents the mobile-first responsive design strategy implemented for Ariyadham. All components and layouts are designed with mobile devices as the primary target, progressively enhancing for larger screens.

---

## Responsive Breakpoints

### Custom Tailwind Breakpoints

Story 8.4 introduces custom breakpoints aligned with common device sizes:

```javascript
// tailwind.config.mjs
screens: {
  xs: '320px',  // Mobile small (iPhone SE, small Android)
  sm: '640px',  // Mobile large (standard mobile phones)
  md: '768px',  // Tablet (iPad, Android tablets)
  lg: '1024px', // Desktop (laptops, small desktops)
  xl: '1440px', // Large desktop (large monitors)
}
```

### Breakpoint Usage

```tsx
// Mobile-first: Base styles apply to all sizes, then override for larger
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  {/* Padding: 16px mobile → 24px sm → 32px md → 48px lg */}
</div>

// Typography scaling
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  {/* Font size progressively increases */}
</h1>

// Grid layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 columns tablet, 3 columns desktop */}
</div>
```

---

## Touch Target Requirements

### Minimum Size Standards

All interactive elements meet **WCAG 2.1 Success Criterion 2.5.5** and iOS/Android guidelines:

- **Minimum**: 44x44px (iOS Human Interface Guidelines)
- **Recommended**: 48x48px or larger for primary actions
- **Spacing**: At least 8px between adjacent touch targets

### Implementation

#### Buttons

```tsx
// src/components/ui/Button.tsx
const sizes = {
  sm: 'px-3 py-2 text-sm min-h-touch-min min-w-[44px]', // 44px minimum
  md: 'px-4 py-2.5 text-base min-h-touch-min min-w-[56px]', // 44px+ comfortable
  lg: 'px-6 py-3 text-lg min-h-[52px] min-w-[80px]', // Large touch target
};
```

#### Inputs

```tsx
// src/components/ui/Input.tsx
const baseStyles = 'w-full min-h-touch-min px-3 py-2.5 ...';
// Ensures all inputs are at least 44px tall
```

#### Links and Navigation

```tsx
// Mobile menu items
<Link className="min-h-touch-min flex items-center gap-4 px-4 py-3 ...">
  {/* Link text */}
</Link>

// Touch-friendly hamburger menu button
<button className="h-touch-min w-touch-min inline-flex items-center justify-center ...">
  <Menu className="h-6 w-6" />
</button>
```

---

## Mobile Navigation

### Header Component

**Location**: `src/components/layout/Header.tsx`

Features:

- Sticky header that stays visible while scrolling
- Responsive logo (icon-only on mobile, full text on desktop)
- Desktop navigation menu (hidden on mobile)
- Touch-friendly hamburger menu button (44x44px)
- Language switcher accessible on all screen sizes

```tsx
<Header />
// Automatically switches between mobile and desktop navigation
```

### Mobile Menu Overlay

**Location**: `src/components/layout/MobileMenu.tsx`

Features:

- Full-screen overlay for mobile (< 768px)
- Touch-friendly menu items with icons
- Body scroll lock when open
- Escape key to close
- Backdrop click to dismiss
- Slide-in animation from right

```tsx
<MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

---

## Responsive Utilities

### useMediaQuery Hook

**Location**: `src/hooks/useMediaQuery.ts`

Custom hook for detecting media query matches in React components:

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return <div>{isMobile ? <MobileView /> : <DesktopView />}</div>;
}
```

### useBreakpoint Hook

**Location**: `src/hooks/useBreakpoint.ts`

Comprehensive hook for detecting current breakpoint and device type:

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, current } = useBreakpoint();

  // Device type helpers
  if (isMobile) {
    // < 768px
  }

  if (isTablet) {
    // >= 768px and < 1024px
  }

  if (isDesktop) {
    // >= 1024px
  }

  // Specific breakpoint
  if (current === 'lg') {
    // Exactly at lg breakpoint
  }
}
```

---

## Mobile-First Component Patterns

### Layout Containers

```tsx
// Mobile-first padding that grows with screen size
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{/* Content */}</div>
```

### Typography Scaling

```tsx
// Headings scale progressively
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Main Heading
</h1>

<h2 className="text-xl sm:text-2xl md:text-3xl">
  Section Heading
</h2>

<p className="text-sm sm:text-base md:text-lg">
  Body text scales from small to comfortable reading size
</p>
```

### Spacing Utilities

```tsx
// Margins and padding scale with breakpoints
<section className="mb-8 sm:mb-10 md:mb-12 lg:mb-16">
  {/* Section content */}
</section>

// Gap in flex/grid layouts
<div className="flex gap-3 sm:gap-4 md:gap-6">
  {/* Items */}
</div>
```

### Grid Layouts

```tsx
// Single column on mobile, adaptive grid on larger screens
<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

### Images and Media

```tsx
// Responsive image sizing with Next.js Image
<Image
  src={imageSrc}
  alt={altText}
  width={600}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto"
  loading="lazy"
/>
```

---

## Testing Guidelines

### Device Testing

Test on real devices when possible:

**Mobile**:

- iPhone SE (320px width - smallest common device)
- iPhone 14/15 (390px width - standard iPhone)
- Android (360px-400px width - most common)

**Tablet**:

- iPad (768px width - md breakpoint)
- iPad Pro (1024px width - lg breakpoint)

**Desktop**:

- Laptop (1280px-1440px - standard)
- Large desktop (1920px+ - xl breakpoint)

### Browser DevTools Testing

Chrome DevTools responsive mode:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl/Cmd + Shift + M)
3. Test at key breakpoints:
   - 320px (xs)
   - 640px (sm)
   - 768px (md)
   - 1024px (lg)
   - 1440px (xl)

### Orientation Testing

Test both portrait and landscape orientations:

- Mobile portrait (most common)
- Mobile landscape (video viewing, gaming)
- Tablet portrait (reading)
- Tablet landscape (productivity)

---

## Performance Considerations

### Mobile-Specific Optimizations

1. **Smaller images on mobile**

   ```tsx
   sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
   ```

2. **Lazy loading**

   ```tsx
   loading = 'lazy'; // For images below the fold
   ```

3. **Code splitting**
   - Use dynamic imports for mobile-specific features
   - Avoid loading desktop components on mobile

4. **Touch event optimization**
   - Use `passive` event listeners for scroll
   - Debounce/throttle expensive handlers

### 4G Connection Optimization

- Total page size target: < 1MB on initial load
- Critical CSS inlined
- Fonts subset and preloaded
- Images optimized with WebP/AVIF
- ISR caching for frequently accessed pages

---

## Common Patterns

### Hide/Show Elements by Breakpoint

```tsx
// Show only on mobile
<div className="block md:hidden">
  Mobile-only content
</div>

// Show only on tablet and up
<div className="hidden md:block">
  Tablet and desktop content
</div>

// Show only on desktop
<div className="hidden lg:block">
  Desktop-only content
</div>
```

### Conditional Rendering with Hooks

```tsx
const { isMobile } = useBreakpoint();

return <>{isMobile ? <MobileNavigation /> : <DesktopNavigation />}</>;
```

### Responsive Flex Direction

```tsx
// Stack on mobile, horizontal on tablet+
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Column 1</div>
  <div className="flex-1">Column 2</div>
</div>
```

### Responsive Text Alignment

```tsx
// Center on mobile, left-align on desktop
<div className="text-center lg:text-left">Content</div>
```

---

## Accessibility Integration

Mobile-first design complements Story 8.3 accessibility features:

1. **Touch targets meet WCAG 2.5.5** (44x44px minimum)
2. **Focus indicators visible** on all screen sizes
3. **Keyboard navigation** works on tablets with keyboards
4. **Screen readers** work seamlessly on mobile devices
5. **Color contrast** maintained across all breakpoints

---

## Best Practices

### DO ✅

- **Start with mobile styles first**, then add breakpoint modifiers
- **Use semantic HTML** that works well on mobile readers
- **Test on real devices** regularly
- **Optimize images** with appropriate sizes for each breakpoint
- **Use touch-friendly spacing** (minimum 44x44px)
- **Avoid hover-only interactions** (use `:active` for mobile)
- **Keep navigation simple** on mobile
- **Minimize horizontal scrolling**

### DON'T ❌

- **Don't assume desktop-first design**
- **Don't use fixed widths** that break on small screens
- **Don't rely on hover states** for critical functionality
- **Don't hide critical content** on mobile
- **Don't use tiny touch targets** (< 44px)
- **Don't forget landscape orientation**
- **Don't load desktop-size images** on mobile
- **Don't use desktop-only features** without mobile alternatives

---

## Component Checklist

When creating new components, ensure:

- [ ] Designed mobile-first (base styles for mobile)
- [ ] Touch targets ≥ 44x44px for all interactive elements
- [ ] Responsive typography (scales with breakpoints)
- [ ] Responsive spacing (margins, padding scale)
- [ ] Works in portrait and landscape
- [ ] No horizontal scrolling on any breakpoint
- [ ] Images use responsive sizes
- [ ] Navigation works on touch devices
- [ ] Tested on real mobile devices
- [ ] Meets WCAG 2.1 AA standards

---

## Resources

- [iOS Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design - Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [WCAG 2.1 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

## Support

For questions or issues with mobile-first responsive design:

1. Check this documentation
2. Review component examples in `src/components/`
3. Test with browser DevTools responsive mode
4. Verify on real devices

---

**Last Updated**: 2025-11-09
**Story**: 8.4 - Mobile-First Responsive Design
**Status**: ✅ Complete
