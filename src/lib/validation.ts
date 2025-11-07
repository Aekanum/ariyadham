/**
 * Validation Utilities
 *
 * Utilities for request validation using Zod schemas.
 * Provides a consistent way to validate and parse request data.
 *
 * @see docs/API.md for usage guidelines
 */

import { z, ZodError, ZodSchema } from 'zod';
import { NextRequest } from 'next/server';
import { ApiErrorResponse, ErrorCode } from '@/types/api';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorResponse };

/**
 * Validates request body against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with parsed data or error
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * export async function POST(request: NextRequest) {
 *   const result = await validateRequestBody(request, schema);
 *
 *   if (!result.success) {
 *     return NextResponse.json(result.error, {
 *       status: HttpStatus.BAD_REQUEST
 *     });
 *   }
 *
 *   const { email, password } = result.data;
 *   // ... process valid data
 * }
 * ```
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    // Handle JSON parsing errors
    return {
      success: false,
      error: {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid JSON in request body',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with parsed data or error
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   page: z.coerce.number().int().positive().default(1),
 *   pageSize: z.coerce.number().int().positive().max(100).default(20)
 * });
 *
 * export async function GET(request: NextRequest) {
 *   const result = validateQueryParams(request, schema);
 *
 *   if (!result.success) {
 *     return NextResponse.json(result.error, {
 *       status: HttpStatus.BAD_REQUEST
 *     });
 *   }
 *
 *   const { page, pageSize } = result.data;
 *   // ... process valid params
 * }
 * ```
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid query parameters',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
    };
  }
}

/**
 * Validates route parameters against a Zod schema
 *
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with parsed data or error
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   id: z.string().uuid()
 * });
 *
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   const result = validateRouteParams(params, schema);
 *
 *   if (!result.success) {
 *     return NextResponse.json(result.error, {
 *       status: HttpStatus.BAD_REQUEST
 *     });
 *   }
 *
 *   const { id } = result.data;
 *   // ... process valid params
 * }
 * ```
 */
export function validateRouteParams<T>(params: unknown, schema: ZodSchema<T>): ValidationResult<T> {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid route parameters',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
    };
  }
}

/**
 * Formats Zod validation errors into API error response
 */
function formatZodError(error: ZodError): ApiErrorResponse {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: {
        fields: fieldErrors,
        errors: error.issues,
      },
    },
  };
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  /** UUID validation */
  uuid: z.string().uuid({ message: 'Invalid UUID format' }),

  /** Email validation */
  email: z.string().email({ message: 'Invalid email address' }),

  /** Password validation (min 8 chars, requires uppercase, lowercase, number) */
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),

  /** Pagination parameters */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  /** ISO date string */
  isoDate: z.string().datetime({ message: 'Invalid ISO date format' }),

  /** URL validation */
  url: z.string().url({ message: 'Invalid URL format' }),

  /** Slug validation (lowercase, numbers, hyphens) */
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
};

/**
 * Creates a standardized error response
 *
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional additional details
 * @returns ApiErrorResponse
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   createErrorResponse('NOT_FOUND', 'Article not found'),
 *   { status: HttpStatus.NOT_FOUND }
 * );
 * ```
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
    },
  };
}
