/**
 * Date and Time Utility Functions
 *
 * Provides utilities for date formatting, relative time calculation,
 * and date validation for the Ariyadham platform.
 */

/**
 * Format options for date display
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'full';

/**
 * Format a date for display according to the specified format
 *
 * @param date - The date to format (Date object, ISO string, or timestamp)
 * @param format - The format style ('short' | 'medium' | 'long' | 'full')
 * @param locale - The locale for formatting (default: 'th-TH')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'long'); // "7 พฤศจิกายน 2025"
 * formatDate('2025-11-07', 'short', 'en-US'); // "11/7/25"
 */
export function formatDate(
  date: Date | string | number,
  format: DateFormat = 'medium',
  locale: string = 'th-TH'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
    short: { year: '2-digit', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  };

  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(dateObj);
}

/**
 * Format a date with time for display
 *
 * @param date - The date to format
 * @param locale - The locale for formatting (default: 'th-TH')
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date()); // "7 พ.ย. 2025 14:30"
 */
export function formatDateTime(date: Date | string | number, locale: string = 'th-TH'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 *
 * @param date - The date to calculate relative time from
 * @param locale - The locale for formatting (default: 'th-TH')
 * @returns Relative time string
 *
 * @example
 * getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)); // "2 hours ago"
 */
export function getRelativeTime(date: Date | string | number, locale: string = 'th-TH'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // Use Intl.RelativeTimeFormat for proper localization
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffYear > 0) {
    return rtf.format(-diffYear, 'year');
  } else if (diffMonth > 0) {
    return rtf.format(-diffMonth, 'month');
  } else if (diffDay > 0) {
    return rtf.format(-diffDay, 'day');
  } else if (diffHour > 0) {
    return rtf.format(-diffHour, 'hour');
  } else if (diffMin > 0) {
    return rtf.format(-diffMin, 'minute');
  } else {
    return rtf.format(-diffSec, 'second');
  }
}

/**
 * Check if a date is valid
 *
 * @param date - The date to validate
 * @returns true if date is valid, false otherwise
 *
 * @example
 * isValidDate(new Date()); // true
 * isValidDate('invalid'); // false
 */
export function isValidDate(date: Date | string | number | null | undefined): boolean {
  if (date === null || date === undefined) {
    return false;
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return !isNaN(dateObj.getTime());
}

/**
 * Parse ISO date string to Date object
 *
 * @param isoString - ISO 8601 date string
 * @returns Date object or null if invalid
 *
 * @example
 * parseISODate('2025-11-07T14:30:00Z'); // Date object
 */
export function parseISODate(isoString: string): Date | null {
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get start of day for a given date
 *
 * @param date - The date
 * @returns Date object set to start of day (00:00:00)
 *
 * @example
 * startOfDay(new Date('2025-11-07T14:30:00')); // 2025-11-07T00:00:00
 */
export function startOfDay(date: Date | string | number): Date {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);

  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Get end of day for a given date
 *
 * @param date - The date
 * @returns Date object set to end of day (23:59:59.999)
 *
 * @example
 * endOfDay(new Date('2025-11-07T14:30:00')); // 2025-11-07T23:59:59.999
 */
export function endOfDay(date: Date | string | number): Date {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);

  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Add days to a date
 *
 * @param date - The starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 *
 * @example
 * addDays(new Date('2025-11-07'), 7); // 2025-11-14
 */
export function addDays(date: Date | string | number, days: number): Date {
  const dateObj =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);

  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Get difference in days between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days difference (absolute value)
 *
 * @example
 * getDaysDifference('2025-11-01', '2025-11-07'); // 6
 */
export function getDaysDifference(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const d1 = typeof date1 === 'string' || typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' || typeof date2 === 'number' ? new Date(date2) : date2;

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past
 *
 * @param date - The date to check
 * @returns true if date is in the past, false otherwise
 *
 * @example
 * isPast(new Date('2020-01-01')); // true
 */
export function isPast(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 *
 * @param date - The date to check
 * @returns true if date is in the future, false otherwise
 *
 * @example
 * isFuture(new Date('2030-01-01')); // true
 */
export function isFuture(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return dateObj.getTime() > Date.now();
}

/**
 * Format date for API (ISO 8601)
 *
 * @param date - The date to format
 * @returns ISO 8601 formatted string
 *
 * @example
 * formatForAPI(new Date()); // "2025-11-07T14:30:00.000Z"
 */
export function formatForAPI(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return dateObj.toISOString();
}
