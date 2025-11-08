/**
 * Common Type Definitions
 *
 * Shared TypeScript types used across the Ariyadham platform
 * for common patterns, forms, pagination, and utility types.
 *
 * Note: PaginationParams, PaginationMeta, and PaginatedResponse are defined in api.ts
 */

import type { PaginationParams } from './api';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams<T extends string = string> {
  sortBy: T;
  order: SortOrder;
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn';

/**
 * Generic filter
 */
export interface Filter<T = any> {
  field: string;
  operator: FilterOperator;
  value: T;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async data state
 */
export interface AsyncState<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  status: LoadingState;
}

/**
 * Form field state
 */
export interface FormFieldState<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Form validation rule
 */
export type ValidationRule<T = any> = (value: T) => string | null | Promise<string | null>;

/**
 * Form field config
 */
export interface FormFieldConfig<T = any> {
  initialValue?: T;
  validationRules?: ValidationRule<T>[];
  required?: boolean;
}

/**
 * Select option type
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Language code
 */
export type LanguageCode = 'en' | 'th';

/**
 * Screen size breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * User preference settings
 */
export interface UserPreferences {
  theme: ThemeMode;
  language: LanguageCode;
  fontSize: number;
  accessibilityMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

/**
 * File upload state
 */
export interface FileUploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error: string | null;
  url: string | null;
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Coordinate position
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rectangle dimensions
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Date range
 */
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

/**
 * Time period
 */
export type TimePeriod =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  filters?: Filter[];
  sort?: SortParams;
  pagination?: PaginationParams;
}

/**
 * API request status
 */
export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper (includes undefined)
 */
export type Optional<T> = T | null | undefined;

/**
 * Modify type - make specific properties optional
 */
export type Modify<T, R> = Omit<T, keyof R> & R;

/**
 * Deep partial - make all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Value of object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Require at least one property
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * Require all properties except specified
 */
export type RequireAllExcept<T, K extends keyof T> = Required<Omit<T, K>> &
  Partial<Pick<T, K>>;

/**
 * Mutable type - remove readonly modifiers
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Promise unwrap - extract type from Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Function type helper
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Async function type helper
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * Event handler type
 */
export type EventHandler<E = Event> = (event: E) => void;

/**
 * Callback type
 */
export type Callback<T = void> = () => T;

/**
 * Change handler type
 */
export type ChangeHandler<T = any> = (value: T) => void;

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

/**
 * Retry options
 */
export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
}

/**
 * Debounce options
 */
export interface DebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Throttle options
 */
export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}
