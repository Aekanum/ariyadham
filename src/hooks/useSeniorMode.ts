/**
 * useSeniorMode Hook
 * Story 8.5: Elderly User Accessibility (Senior-Friendly Mode)
 *
 * Convenient hook for accessing senior mode state in components
 */

'use client';

import { usePreferences } from '@/contexts/PreferencesContext';

/**
 * Hook to check if senior mode is enabled
 * Returns boolean indicating senior mode state
 *
 * @example
 * const isSeniorMode = useSeniorMode();
 * if (isSeniorMode) {
 *   // Render simplified UI
 * }
 */
export function useSeniorMode(): boolean {
  const { preferences } = usePreferences();
  return preferences.seniorMode;
}
