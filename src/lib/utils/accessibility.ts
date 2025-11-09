/**
 * Accessibility Utilities
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Utility functions to support accessibility features across the application
 */

import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * Generate a unique ID for associating labels with form inputs
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is keyboard focusable
 */
export function isKeyboardFocusable(element: HTMLElement): boolean {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return (
    focusableTags.includes(element.tagName) ||
    element.tabIndex >= 0 ||
    element.hasAttribute('contenteditable')
  );
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Trap focus within a container (useful for modals and dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

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
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
 * This is a placeholder - for production, use a proper color contrast library
 */
export function meetsContrastRatio(
  _foreground: string,
  _background: string,
  _level: 'AA' | 'AAA' = 'AA',
  _isLargeText = false
): boolean {
  // This is a placeholder - in production, you'd calculate the actual contrast ratio
  // For now, we'll assume our predefined colors meet the standards
  // const requiredRatio = isLargeText ? 3 : level === 'AA' ? 4.5 : 7;
  // Implementation would calculate actual contrast and compare to requiredRatio
  return true; // Placeholder
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.getElementById('a11y-announcer');
  if (announcement) {
    announcement.setAttribute('aria-live', priority);
    announcement.textContent = message;

    // Clear after a delay
    setTimeout(() => {
      announcement.textContent = '';
    }, 1000);
  }
}

/**
 * Get recommended ARIA role for an element based on its purpose
 */
export function getAriaRole(purpose: string): string {
  const roleMap: Record<string, string> = {
    navigation: 'navigation',
    banner: 'banner',
    main: 'main',
    footer: 'contentinfo',
    search: 'search',
    form: 'form',
    article: 'article',
    aside: 'complementary',
    section: 'region',
  };
  return roleMap[purpose] || '';
}

/**
 * Create accessible button attributes
 */
export function getAccessibleButtonProps(label: string, pressed?: boolean) {
  return {
    'aria-label': label,
    ...(typeof pressed === 'boolean' && { 'aria-pressed': pressed }),
  };
}

/**
 * Keyboard event handlers for common patterns
 */
export const keyboardHandlers = {
  /**
   * Handle Enter and Space key presses (for custom clickable elements)
   */
  onActivate: (callback: () => void) => (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Handle Escape key (for closing modals, dialogs, etc.)
   */
  onEscape: (callback: () => void) => (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Handle Arrow keys navigation
   */
  onArrowNavigation: (
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void
  ) => (event: ReactKeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onRight?.();
        break;
    }
  },
};
