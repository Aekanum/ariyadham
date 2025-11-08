import { useEffect, useRef } from 'react';

export function useAutoSave(
  callback: () => void | Promise<void>,
  deps: unknown[],
  delay: number = 30000
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // We intentionally use deps array as provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, deps as any[]);
}
