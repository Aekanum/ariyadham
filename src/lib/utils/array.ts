/**
 * Array Utility Functions
 *
 * Provides utilities for array manipulation, filtering, and transformation
 * for the Ariyadham platform.
 */

/**
 * Remove duplicate values from array
 *
 * @param array - The array to deduplicate
 * @returns Array with unique values
 *
 * @example
 * unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]
 * unique(['a', 'b', 'a', 'c']); // ['a', 'b', 'c']
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Remove duplicate objects from array based on a key
 *
 * @param array - The array of objects to deduplicate
 * @param key - The property to use for uniqueness
 * @returns Array with unique objects
 *
 * @example
 * uniqueBy([{id: 1, name: 'A'}, {id: 1, name: 'B'}], 'id');
 * // [{id: 1, name: 'A'}]
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Chunk array into smaller arrays of specified size
 *
 * @param array - The array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunked arrays
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group array items by a key
 *
 * @param array - The array to group
 * @param key - The property to group by
 * @returns Object with grouped arrays
 *
 * @example
 * groupBy([
 *   {category: 'A', value: 1},
 *   {category: 'B', value: 2},
 *   {category: 'A', value: 3}
 * ], 'category');
 * // { A: [{category: 'A', value: 1}, {category: 'A', value: 3}], B: [...] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sort array of objects by a key
 *
 * @param array - The array to sort
 * @param key - The property to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 *
 * @example
 * sortBy([{age: 30}, {age: 20}, {age: 25}], 'age', 'asc');
 * // [{age: 20}, {age: 25}, {age: 30}]
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Shuffle array randomly
 *
 * @param array - The array to shuffle
 * @returns Shuffled array
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4] (random order)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random item from array
 *
 * @param array - The array to pick from
 * @returns Random item from array
 *
 * @example
 * randomItem([1, 2, 3, 4, 5]); // 3 (random)
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random items from array (without duplicates)
 *
 * @param array - The array to pick from
 * @param count - Number of items to pick
 * @returns Array of random items
 *
 * @example
 * randomItems([1, 2, 3, 4, 5], 3); // [2, 5, 1] (random)
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Flatten nested array one level deep
 *
 * @param array - The array to flatten
 * @returns Flattened array
 *
 * @example
 * flatten([[1, 2], [3, 4], [5]]); // [1, 2, 3, 4, 5]
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

/**
 * Deeply flatten nested arrays
 *
 * @param array - The array to flatten
 * @returns Deeply flattened array
 *
 * @example
 * flattenDeep([[1, [2]], [3, [4, [5]]]]); // [1, 2, 3, 4, 5]
 */
export function flattenDeep<T>(array: any[]): T[] {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, []);
}

/**
 * Partition array into two groups based on predicate
 *
 * @param array - The array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [matching, non-matching] arrays
 *
 * @example
 * partition([1, 2, 3, 4, 5], x => x % 2 === 0);
 * // [[2, 4], [1, 3, 5]]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  const matching: T[] = [];
  const nonMatching: T[] = [];

  array.forEach((item, index) => {
    if (predicate(item, index)) {
      matching.push(item);
    } else {
      nonMatching.push(item);
    }
  });

  return [matching, nonMatching];
}

/**
 * Create array with range of numbers
 *
 * @param start - Start number (inclusive)
 * @param end - End number (exclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers in range
 *
 * @example
 * range(1, 5); // [1, 2, 3, 4]
 * range(0, 10, 2); // [0, 2, 4, 6, 8]
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Sum all numbers in array
 *
 * @param array - Array of numbers
 * @returns Sum of all numbers
 *
 * @example
 * sum([1, 2, 3, 4, 5]); // 15
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0);
}

/**
 * Calculate average of numbers in array
 *
 * @param array - Array of numbers
 * @returns Average value
 *
 * @example
 * average([1, 2, 3, 4, 5]); // 3
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Find minimum value in array
 *
 * @param array - Array of numbers
 * @returns Minimum value
 *
 * @example
 * min([3, 1, 4, 1, 5]); // 1
 */
export function min(array: number[]): number {
  return Math.min(...array);
}

/**
 * Find maximum value in array
 *
 * @param array - Array of numbers
 * @returns Maximum value
 *
 * @example
 * max([3, 1, 4, 1, 5]); // 5
 */
export function max(array: number[]): number {
  return Math.max(...array);
}

/**
 * Check if array is empty
 *
 * @param array - The array to check
 * @returns true if array is empty or null/undefined
 *
 * @example
 * isEmpty([]); // true
 * isEmpty([1, 2]); // false
 */
export function isEmpty<T>(array: T[] | null | undefined): boolean {
  return !array || array.length === 0;
}

/**
 * Get first item from array
 *
 * @param array - The array
 * @returns First item or undefined if empty
 *
 * @example
 * first([1, 2, 3]); // 1
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Get last item from array
 *
 * @param array - The array
 * @returns Last item or undefined if empty
 *
 * @example
 * last([1, 2, 3]); // 3
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Compact array by removing falsy values
 *
 * @param array - The array to compact
 * @returns Array without falsy values
 *
 * @example
 * compact([1, 0, 2, false, 3, '', 4, null, 5]); // [1, 2, 3, 4, 5]
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Remove items from array by value
 *
 * @param array - The array to filter
 * @param values - Values to remove
 * @returns Array without specified values
 *
 * @example
 * without([1, 2, 3, 4, 5], 2, 4); // [1, 3, 5]
 */
export function without<T>(array: T[], ...values: T[]): T[] {
  const valueSet = new Set(values);
  return array.filter((item) => !valueSet.has(item));
}

/**
 * Get intersection of two arrays
 *
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of common elements
 *
 * @example
 * intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter((item) => set2.has(item));
}

/**
 * Get difference between two arrays (items in first but not in second)
 *
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of items in array1 but not in array2
 *
 * @example
 * difference([1, 2, 3], [2, 3, 4]); // [1]
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter((item) => !set2.has(item));
}

/**
 * Zip multiple arrays together
 *
 * @param arrays - Arrays to zip
 * @returns Array of tuples
 *
 * @example
 * zip([1, 2], ['a', 'b']); // [[1, 'a'], [2, 'b']]
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const length = Math.max(...arrays.map((arr) => arr.length));
  return range(0, length).map((i) => arrays.map((arr) => arr[i]));
}
