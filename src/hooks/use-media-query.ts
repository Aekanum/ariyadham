/**
 * useMediaQuery Hook
 *
 * Hook for responsive design - matches CSS media queries in React
 */

import { useState, useEffect } from 'react';

/**
 * Hook to match CSS media queries
 *
 * @param query - Media query string
 * @returns true if media query matches, false otherwise
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * );
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    // Use deprecated addListener for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Deprecated but needed for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Deprecated but needed for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common screen sizes
 */

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
