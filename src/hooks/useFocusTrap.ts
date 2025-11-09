/**
 * useFocusTrap Hook
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Custom hook for trapping focus within a container (modals, dialogs, dropdowns)
 */

import { useEffect, useRef } from 'react';
import { getFocusableElements } from '@/lib/utils/accessibility';

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean;
}

export function useFocusTrap({
  isActive,
  onEscape,
  initialFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    if (initialFocus) {
      const focusableElements = getFocusableElements(container);
      focusableElements[0]?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus trap
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(container);
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape, initialFocus]);

  return containerRef;
}
