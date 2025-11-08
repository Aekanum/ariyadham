/**
 * useOnClickOutside Hook
 *
 * Hook to detect clicks outside a referenced element - useful for dropdowns and modals
 */

import { useEffect, RefObject } from 'react';

/**
 * Hook to detect clicks outside a referenced element
 *
 * @param ref - React ref to the element
 * @param handler - Callback function to execute on outside click
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * useOnClickOutside(dropdownRef, () => setIsOpen(false));
 *
 * return (
 *   <div ref={dropdownRef}>
 *     <DropdownContent />
 *   </div>
 * );
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
