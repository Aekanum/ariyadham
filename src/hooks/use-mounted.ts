/**
 * useMounted Hook
 *
 * Hook to check if component is currently mounted - prevents state updates on unmounted components
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to check if component is mounted
 *
 * @returns Function that returns true if component is mounted, false otherwise
 *
 * @example
 * const isMounted = useMounted();
 *
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 */
export function useMounted(): () => boolean {
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
