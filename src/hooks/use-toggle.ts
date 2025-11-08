/**
 * useToggle Hook
 *
 * Simple hook for managing boolean state with toggle functionality
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing boolean toggle state
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setValue]
 *
 * @example
 * const [isOpen, toggleOpen, setOpen] = useToggle(false);
 * <button onClick={toggleOpen}>Toggle</button>
 * <button onClick={() => setOpen(true)}>Open</button>
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev: boolean) => !prev);
  }, []);

  return [value, toggle, setValue];
}
