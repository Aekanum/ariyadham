/**
 * useKeyboardNavigation Hook
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Custom hook for managing keyboard navigation in lists and grids
 */

import { useEffect, useRef, useState } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  loop?: boolean; // Whether to loop back to start/end
  orientation?: 'vertical' | 'horizontal' | 'grid';
  gridColumns?: number;
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
  loop = true,
  orientation = 'vertical',
  gridColumns = 1,
}: UseKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const moveFocus = (newIndex: number) => {
    if (newIndex < 0) {
      setFocusedIndex(loop ? itemCount - 1 : 0);
    } else if (newIndex >= itemCount) {
      setFocusedIndex(loop ? 0 : itemCount - 1);
    } else {
      setFocusedIndex(newIndex);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(focusedIndex + 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex + gridColumns);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(focusedIndex - 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex - gridColumns);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          moveFocus(focusedIndex + 1);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          moveFocus(focusedIndex - 1);
        }
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(focusedIndex);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    tabIndex: index === focusedIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
    'aria-selected': index === focusedIndex,
  });

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
  };
}
