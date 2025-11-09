/**
 * useBreakpoint Hook
 * Story 8.4: Mobile-First Responsive Design
 *
 * Custom hook for detecting current responsive breakpoint
 */

'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Breakpoint definitions matching Tailwind config
 * Story 8.4: 320px, 768px, 1024px, 1440px
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BreakpointState {
  /** Current breakpoint name */
  current: Breakpoint;
  /** Is extra small (mobile small, >= 320px) */
  isXs: boolean;
  /** Is small (mobile large, >= 640px) */
  isSm: boolean;
  /** Is medium (tablet, >= 768px) */
  isMd: boolean;
  /** Is large (desktop, >= 1024px) */
  isLg: boolean;
  /** Is extra large (large desktop, >= 1440px) */
  isXl: boolean;
  /** Is mobile device (< 768px) */
  isMobile: boolean;
  /** Is tablet device (>= 768px and < 1024px) */
  isTablet: boolean;
  /** Is desktop device (>= 1024px) */
  isDesktop: boolean;
}

/**
 * Hook to detect current breakpoint and device type
 * Returns object with current breakpoint and boolean flags
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint();
 *
 * @example
 * const { current } = useBreakpoint();
 * if (current === 'xs') {
 *   // Render mobile-specific UI
 * }
 */
export function useBreakpoint(): BreakpointState {
  // Breakpoint queries (Story 8.4: Custom breakpoints)
  const isXs = useMediaQuery('(min-width: 320px)');
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1440px)');

  // Device type helpers
  const isMobile = !isMd; // < 768px
  const isTablet = isMd && !isLg; // >= 768px and < 1024px
  const isDesktop = isLg; // >= 1024px

  // Determine current breakpoint
  let current: Breakpoint = 'xs';
  if (isXl) current = 'xl';
  else if (isLg) current = 'lg';
  else if (isMd) current = 'md';
  else if (isSm) current = 'sm';

  return {
    current,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
  };
}
