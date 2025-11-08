/**
 * Number Utility Functions
 *
 * Provides utilities for number formatting, calculations, and validation
 * for the Ariyadham platform.
 */

/**
 * Format number with thousands separators
 *
 * @param num - The number to format
 * @param locale - The locale for formatting (default: 'th-TH')
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567); // "1,234,567" (en-US)
 * formatNumber(1234567, 'th-TH'); // "1,234,567"
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format number as currency
 *
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'THB')
 * @param locale - The locale for formatting (default: 'th-TH')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56); // "฿1,234.56"
 * formatCurrency(1234.56, 'USD', 'en-US'); // "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'THB',
  locale: string = 'th-TH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number as percentage
 *
 * @param value - The value to format (0-1 for decimal, 0-100 for percentage)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether value is decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.856, 2, true); // "85.60%"
 * formatPercentage(85.6, 1, false); // "85.6%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  isDecimal: boolean = true
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format number as compact notation (K, M, B, etc.)
 *
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Compact formatted string
 *
 * @example
 * formatCompact(1234); // "1.2K"
 * formatCompact(1234567); // "1.2M"
 * formatCompact(1234567890); // "1.2B"
 */
export function formatCompact(num: number, decimals: number = 1, locale: string = 'en-US'): string {
  if (num < 1000) {
    return num.toString();
  }

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Fallback for older browsers
    const units = ['', 'K', 'M', 'B', 'T'];
    const order = Math.floor(Math.log10(Math.abs(num)) / 3);
    const unit = units[order] || '';
    const value = num / Math.pow(1000, order);
    return value.toFixed(decimals) + unit;
  }
}

/**
 * Round number to specified decimal places
 *
 * @param num - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 *
 * @example
 * round(3.14159, 2); // 3.14
 * round(3.5); // 4 (default 2 decimals)
 */
export function round(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp number between min and max values
 *
 * @param num - The number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 *
 * @example
 * clamp(5, 0, 10); // 5
 * clamp(-5, 0, 10); // 0
 * clamp(15, 0, 10); // 10
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Check if number is in range (inclusive)
 *
 * @param num - The number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns true if number is in range, false otherwise
 *
 * @example
 * inRange(5, 0, 10); // true
 * inRange(15, 0, 10); // false
 */
export function inRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Generate random integer between min and max (inclusive)
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 *
 * @example
 * randomInt(1, 10); // Random integer between 1 and 10
 */
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param decimals - Number of decimal places (optional)
 * @returns Random float
 *
 * @example
 * randomFloat(0, 1); // Random float between 0 and 1
 * randomFloat(0, 10, 2); // Random float with 2 decimals
 */
export function randomFloat(min: number, max: number, decimals?: number): number {
  const random = Math.random() * (max - min) + min;
  return decimals !== undefined ? round(random, decimals) : random;
}

/**
 * Calculate percentage of a value
 *
 * @param value - The value
 * @param total - The total
 * @param decimals - Number of decimal places (default: 2)
 * @returns Percentage (0-100)
 *
 * @example
 * percentage(25, 100); // 25
 * percentage(1, 3, 2); // 33.33
 */
export function percentage(value: number, total: number, decimals: number = 2): number {
  if (total === 0) return 0;
  return round((value / total) * 100, decimals);
}

/**
 * Calculate value from percentage
 *
 * @param percentage - The percentage (0-100)
 * @param total - The total value
 * @returns Calculated value
 *
 * @example
 * percentageOf(25, 100); // 25
 * percentageOf(33.33, 300); // 99.99
 */
export function percentageOf(percentage: number, total: number): number {
  return (percentage / 100) * total;
}

/**
 * Check if number is even
 *
 * @param num - The number to check
 * @returns true if even, false otherwise
 *
 * @example
 * isEven(4); // true
 * isEven(5); // false
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Check if number is odd
 *
 * @param num - The number to check
 * @returns true if odd, false otherwise
 *
 * @example
 * isOdd(5); // true
 * isOdd(4); // false
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

/**
 * Check if number is positive
 *
 * @param num - The number to check
 * @returns true if positive, false otherwise
 *
 * @example
 * isPositive(5); // true
 * isPositive(-5); // false
 */
export function isPositive(num: number): boolean {
  return num > 0;
}

/**
 * Check if number is negative
 *
 * @param num - The number to check
 * @returns true if negative, false otherwise
 *
 * @example
 * isNegative(-5); // true
 * isNegative(5); // false
 */
export function isNegative(num: number): boolean {
  return num < 0;
}

/**
 * Parse number from string safely
 *
 * @param value - The string to parse
 * @param defaultValue - Default value if parse fails (default: 0)
 * @returns Parsed number or default value
 *
 * @example
 * parseNumber('123'); // 123
 * parseNumber('abc', 0); // 0
 */
export function parseNumber(value: string, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 *
 * @param num - The number
 * @returns Number with ordinal suffix
 *
 * @example
 * ordinal(1); // "1st"
 * ordinal(2); // "2nd"
 * ordinal(3); // "3rd"
 * ordinal(21); // "21st"
 */
export function ordinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  return num + suffix;
}

/**
 * Calculate average of numbers
 *
 * @param numbers - Array of numbers or individual numbers
 * @returns Average value
 *
 * @example
 * average(1, 2, 3, 4, 5); // 3
 * average(...[1, 2, 3]); // 2
 */
export function average(...numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate sum of numbers
 *
 * @param numbers - Array of numbers or individual numbers
 * @returns Sum of all numbers
 *
 * @example
 * sum(1, 2, 3, 4, 5); // 15
 */
export function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Find minimum of numbers
 *
 * @param numbers - Array of numbers or individual numbers
 * @returns Minimum value
 *
 * @example
 * min(3, 1, 4, 1, 5); // 1
 */
export function min(...numbers: number[]): number {
  return Math.min(...numbers);
}

/**
 * Find maximum of numbers
 *
 * @param numbers - Array of numbers or individual numbers
 * @returns Maximum value
 *
 * @example
 * max(3, 1, 4, 1, 5); // 5
 */
export function max(...numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024); // "1.00 KB"
 * formatFileSize(1536000); // "1.46 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}
