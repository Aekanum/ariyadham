/**
 * API Types
 *
 * Standardized request/response types for the Ariyadham API.
 * All API endpoints should use these types for consistency.
 *
 * @see docs/API.md for usage guidelines
 */

/**
 * Standard success response wrapper
 *
 * @example
 * ```typescript
 * return NextResponse.json<ApiSuccessResponse<User>>({
 *   success: true,
 *   data: user,
 *   message: 'User retrieved successfully'
 * });
 * ```
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

/**
 * Standard error response wrapper
 *
 * @example
 * ```typescript
 * return NextResponse.json<ApiErrorResponse>({
 *   success: false,
 *   error: {
 *     code: 'VALIDATION_ERROR',
 *     message: 'Invalid email address',
 *     details: { field: 'email' }
 *   }
 * }, { status: 400 });
 * ```
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * API Error details
 */
export interface ApiError {
  /** Machine-readable error code */
  code: ErrorCode;
  /** User-friendly error message */
  message: string;
  /** Additional error context (optional) */
  details?: Record<string, unknown>;
  /** Stack trace (only in development) */
  stack?: string;
}

/**
 * Response metadata (for pagination, etc.)
 */
export interface ResponseMeta {
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items */
  totalItems?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Indicates if there are more items */
  hasMore?: boolean;
}

/**
 * Standard error codes used across the API
 */
export type ErrorCode =
  // Authentication errors (401)
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'SESSION_EXPIRED'
  // Authorization errors (403)
  | 'FORBIDDEN'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'ACCOUNT_SUSPENDED'
  | 'EMAIL_NOT_VERIFIED'
  // Validation errors (400)
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_FORMAT'
  // Resource errors (404)
  | 'NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'ENDPOINT_NOT_FOUND'
  // Conflict errors (409)
  | 'CONFLICT'
  | 'DUPLICATE_ENTRY'
  | 'RESOURCE_ALREADY_EXISTS'
  // Rate limiting (429)
  | 'RATE_LIMIT_EXCEEDED'
  | 'TOO_MANY_REQUESTS'
  // Server errors (500)
  | 'INTERNAL_SERVER_ERROR'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  // Business logic errors (400-499)
  | 'ARTICLE_NOT_PUBLISHED'
  | 'ARTICLE_ALREADY_PUBLISHED'
  | 'AUTHOR_NOT_APPROVED'
  | 'COMMENT_NOT_ALLOWED'
  | 'INVALID_OPERATION';

/**
 * API Response type (union of success and error)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Common query parameters for filtering
 */
export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  tag?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * HTTP Status codes used in the API
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Type guard to check if a response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if a response is a success
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}
