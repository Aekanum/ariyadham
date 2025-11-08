/**
 * Object Utility Functions
 *
 * Provides utilities for object manipulation, deep operations, and safe property access
 * for the Ariyadham platform.
 */

/**
 * Deep clone an object
 *
 * @param obj - The object to clone
 * @returns Deep cloned object
 *
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(obj);
 * cloned.b.c = 3; // Original obj.b.c remains 2
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (obj instanceof Object) {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Safely get nested property value
 *
 * @param obj - The object to access
 * @param path - Property path (dot notation or array)
 * @param defaultValue - Default value if property not found
 * @returns Property value or default value
 *
 * @example
 * const obj = { user: { profile: { name: 'John' } } };
 * get(obj, 'user.profile.name'); // 'John'
 * get(obj, 'user.profile.age', 30); // 30 (default)
 * get(obj, ['user', 'profile', 'name']); // 'John'
 */
export function get<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T;
    }
    result = result[key];
  }

  return result === undefined ? (defaultValue as T) : result;
}

/**
 * Safely set nested property value
 *
 * @param obj - The object to modify
 * @param path - Property path (dot notation or array)
 * @param value - Value to set
 * @returns Modified object
 *
 * @example
 * const obj = { user: { profile: {} } };
 * set(obj, 'user.profile.name', 'John');
 * // obj.user.profile.name === 'John'
 */
export function set<T extends object>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop()!;
  let current: any = obj;

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}

/**
 * Check if object has nested property
 *
 * @param obj - The object to check
 * @param path - Property path (dot notation or array)
 * @returns true if property exists, false otherwise
 *
 * @example
 * const obj = { user: { profile: { name: 'John' } } };
 * has(obj, 'user.profile.name'); // true
 * has(obj, 'user.profile.age'); // false
 */
export function has(obj: any, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Pick specific properties from object
 *
 * @param obj - The source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, 'a', 'c'); // { a: 1, c: 3 }
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific properties from object
 *
 * @param obj - The source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 *
 * @example
 * omit({ a: 1, b: 2, c: 3 }, 'b'); // { a: 1, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Merge objects deeply
 *
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 *
 * @example
 * merge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
 * // { a: 1, b: { c: 2, d: 3 } }
 */
export function merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const result = deepClone(target);

  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = merge(targetValue, sourceValue) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = deepClone(sourceValue) as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Check if object is empty
 *
 * @param obj - The object to check
 * @returns true if object has no own properties, false otherwise
 *
 * @example
 * isEmpty({}); // true
 * isEmpty({ a: 1 }); // false
 */
export function isEmpty(obj: object | null | undefined): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

/**
 * Get all keys of object (typed)
 *
 * @param obj - The object
 * @returns Array of keys
 *
 * @example
 * keys({ a: 1, b: 2 }); // ['a', 'b']
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Get all values of object
 *
 * @param obj - The object
 * @returns Array of values
 *
 * @example
 * values({ a: 1, b: 2 }); // [1, 2]
 */
export function values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj);
}

/**
 * Get all entries of object (typed)
 *
 * @param obj - The object
 * @returns Array of [key, value] tuples
 *
 * @example
 * entries({ a: 1, b: 2 }); // [['a', 1], ['b', 2]]
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Create object from entries
 *
 * @param entries - Array of [key, value] tuples
 * @returns Object created from entries
 *
 * @example
 * fromEntries([['a', 1], ['b', 2]]); // { a: 1, b: 2 }
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Map object values while preserving keys
 *
 * @param obj - The object to map
 * @param fn - Mapping function
 * @returns Object with mapped values
 *
 * @example
 * mapValues({ a: 1, b: 2 }, v => v * 2); // { a: 2, b: 4 }
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key);
    }
  }
  return result;
}

/**
 * Map object keys while preserving values
 *
 * @param obj - The object to map
 * @param fn - Mapping function for keys
 * @returns Object with mapped keys
 *
 * @example
 * mapKeys({ a: 1, b: 2 }, k => k.toUpperCase()); // { A: 1, B: 2 }
 */
export function mapKeys<T extends object, K extends string | number | symbol>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => K
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = fn(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  return result;
}

/**
 * Compare two objects for deep equality
 *
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns true if objects are deeply equal, false otherwise
 *
 * @example
 * isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Get differences between two objects
 *
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns Object containing only different properties
 *
 * @example
 * diff({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
 * // { b: 3, c: 4 }
 */
export function diff<T extends object>(obj1: T, obj2: Partial<T>): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!isEqual(obj1[key], obj2[key])) {
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

/**
 * Freeze object deeply (immutable)
 *
 * @param obj - The object to freeze
 * @returns Frozen object
 *
 * @example
 * const obj = deepFreeze({ a: 1, b: { c: 2 } });
 * obj.a = 2; // Error: Cannot assign to read only property
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);

  for (const key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      obj[key] !== null &&
      typeof obj[key] === 'object'
    ) {
      deepFreeze(obj[key]);
    }
  }

  return obj;
}

/**
 * Compact object by removing null/undefined values
 *
 * @param obj - The object to compact
 * @returns Object without null/undefined values
 *
 * @example
 * compact({ a: 1, b: null, c: undefined, d: 2 }); // { a: 1, d: 2 }
 */
export function compact<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}
