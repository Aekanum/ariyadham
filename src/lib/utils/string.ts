/**
 * String Utility Functions
 *
 * Provides utilities for string manipulation, formatting, and validation
 * for the Ariyadham platform.
 */

/**
 * Generate URL-friendly slug from text
 *
 * @param text - The text to convert to slug
 * @param maxLength - Maximum length of slug (default: 100)
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug('Building Mindfulness Through Dharma Practice');
 * // "building-mindfulness-through-dharma-practice"
 *
 * generateSlug('การปฏิบัติธรรม'); // "การปฏ-บัต-ธรรม"
 */
export function generateSlug(text: string, maxLength: number = 100): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens and Thai/English characters
    .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .slice(0, maxLength);
}

/**
 * Truncate text with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text with suffix
 *
 * @example
 * truncate('This is a long text that needs truncation', 20);
 * // "This is a long text..."
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncate text at word boundary
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text at word boundary with suffix
 *
 * @example
 * truncateWords('This is a very long sentence', 15);
 * // "This is a very..."
 */
export function truncateWords(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim() + suffix;
  }

  return truncated.trim() + suffix;
}

/**
 * Capitalize first letter of text
 *
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 *
 * @example
 * capitalize('hello world'); // "Hello world"
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert text to title case
 *
 * @param text - The text to convert
 * @returns Text in title case
 *
 * @example
 * titleCase('hello world from dharma'); // "Hello World From Dharma"
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Remove HTML tags from text
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 *
 * @example
 * stripHtml('<p>Hello <strong>world</strong></p>'); // "Hello world"
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Extract excerpt from HTML or text content
 *
 * @param content - HTML or plain text content
 * @param maxLength - Maximum length of excerpt (default: 200)
 * @returns Excerpt without HTML tags
 *
 * @example
 * extractExcerpt('<p>Long article content...</p>', 50);
 * // "Long article content..."
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  const plainText = stripHtml(content);
  return truncateWords(plainText, maxLength);
}

/**
 * Count words in text
 *
 * @param text - The text to count words in
 * @returns Number of words
 *
 * @example
 * countWords('Hello world from Ariyadham'); // 4
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading time in minutes
 *
 * @param text - The text to estimate reading time for
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 *
 * @example
 * estimateReadingTime('Long article content...'); // 5
 */
export function estimateReadingTime(
  text: string,
  wordsPerMinute: number = 200
): number {
  const words = countWords(stripHtml(text));
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Check if string is empty or contains only whitespace
 *
 * @param text - The text to check
 * @returns true if empty or whitespace only, false otherwise
 *
 * @example
 * isEmpty('   '); // true
 * isEmpty('hello'); // false
 */
export function isEmpty(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Replace multiple spaces with single space
 *
 * @param text - The text to normalize
 * @returns Text with single spaces
 *
 * @example
 * normalizeSpaces('hello    world'); // "hello world"
 */
export function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * URL encode text safely
 *
 * @param text - The text to encode
 * @returns URL-encoded text
 *
 * @example
 * urlEncode('hello world'); // "hello%20world"
 */
export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

/**
 * URL decode text safely
 *
 * @param text - The text to decode
 * @returns URL-decoded text
 *
 * @example
 * urlDecode('hello%20world'); // "hello world"
 */
export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/**
 * Convert camelCase to kebab-case
 *
 * @param text - camelCase text
 * @returns kebab-case text
 *
 * @example
 * camelToKebab('myVariableName'); // "my-variable-name"
 */
export function camelToKebab(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 *
 * @param text - kebab-case text
 * @returns camelCase text
 *
 * @example
 * kebabToCamel('my-variable-name'); // "myVariableName"
 */
export function kebabToCamel(text: string): string {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Generate random string
 *
 * @param length - Length of random string
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 *
 * @example
 * randomString(10); // "aB3xY9kL2m"
 */
export function randomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Mask sensitive information (email, phone, etc.)
 *
 * @param text - The text to mask
 * @param visibleStart - Number of visible characters at start (default: 2)
 * @param visibleEnd - Number of visible characters at end (default: 2)
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked text
 *
 * @example
 * maskString('user@example.com', 4, 4); // "user*****com"
 * maskString('0812345678', 3, 2); // "081*****78"
 */
export function maskString(
  text: string,
  visibleStart: number = 2,
  visibleEnd: number = 2,
  maskChar: string = '*'
): string {
  if (text.length <= visibleStart + visibleEnd) {
    return text;
  }

  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const maskLength = text.length - visibleStart - visibleEnd;

  return start + maskChar.repeat(maskLength) + end;
}

/**
 * Pluralize word based on count
 *
 * @param count - The count
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string with count
 *
 * @example
 * pluralize(1, 'article'); // "1 article"
 * pluralize(5, 'article'); // "5 articles"
 * pluralize(2, 'category', 'categories'); // "2 categories"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Compare two strings case-insensitively
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns true if strings are equal (case-insensitive), false otherwise
 *
 * @example
 * equalsIgnoreCase('Hello', 'hello'); // true
 */
export function equalsIgnoreCase(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase();
}

/**
 * Check if string contains substring (case-insensitive)
 *
 * @param text - The text to search in
 * @param search - The substring to search for
 * @returns true if text contains search (case-insensitive), false otherwise
 *
 * @example
 * containsIgnoreCase('Hello World', 'world'); // true
 */
export function containsIgnoreCase(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}
