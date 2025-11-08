/**
 * Custom React Hooks Index
 *
 * Central export for all custom React hooks used across the Ariyadham platform.
 * Import hooks from this file to ensure consistent usage.
 *
 * @example
 * import { useToggle, useDebounce, useLocalStorage } from '@/hooks';
 */

// State management hooks
export * from './use-toggle';
export * from './use-local-storage';

// UI hooks
export * from './use-debounce';
export * from './use-media-query';
export * from './use-on-click-outside';
export * from './use-copy-to-clipboard';

// Utility hooks
export * from './use-mounted';
