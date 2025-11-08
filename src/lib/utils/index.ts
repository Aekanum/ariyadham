/**
 * Core Utilities Index
 *
 * Central export for all utility functions used across the Ariyadham platform.
 * Import utilities from this file to ensure consistent usage.
 *
 * @example
 * import { formatDate, generateSlug, unique } from '@/lib/utils';
 */

// Date utilities
export * from './date';

// String utilities
export * from './string';

// Array utilities (with renamed exports to avoid conflicts)
export {
  unique,
  uniqueBy,
  chunk,
  groupBy,
  sortBy,
  shuffle,
  randomItem,
  randomItems,
  flatten,
  flattenDeep,
  partition,
  range,
  first,
  last,
  without,
  intersection,
  difference,
  zip,
} from './array';

// Array utilities with renamed exports to avoid conflicts
export { isEmpty as isArrayEmpty } from './array';
export { compact as compactArray } from './array';
export { sum as sumArray } from './array';
export { average as averageArray } from './array';
export { min as minArray } from './array';
export { max as maxArray } from './array';

// Object utilities
export * from './object';

// Number utilities (with renamed exports to avoid conflicts)
export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompact,
  round,
  clamp,
  inRange,
  randomInt,
  randomFloat,
  percentage,
  percentageOf,
  isEven,
  isOdd,
  isPositive,
  isNegative,
  parseNumber,
  ordinal,
  formatFileSize,
} from './number';

// Number utilities with renamed exports to avoid conflicts
export { average as averageNumber } from './number';
export { sum as sumNumber } from './number';
export { min as minNumber } from './number';
export { max as maxNumber } from './number';
