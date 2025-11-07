/**
 * Example API Route
 *
 * This route demonstrates the standard API patterns:
 * - Request validation with Zod
 * - Authentication middleware
 * - Logging
 * - Error handling
 * - Standard response format
 *
 * Use this as a reference when creating new API routes.
 *
 * @route GET /api/example - Public endpoint with optional auth
 * @route POST /api/example - Protected endpoint requiring authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateRequestBody,
  validateQueryParams,
  createErrorResponse,
} from '@/lib/validation';
import { requireAuth, optionalAuth } from '@/lib/middleware/auth';
import { createRequestLogger } from '@/lib/logger';
import { ApiSuccessResponse, HttpStatus } from '@/types/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/example
 *
 * Example of a public endpoint with optional authentication.
 * Demonstrates query parameter validation and optional auth.
 */
export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request);
  logger.info('Processing GET /api/example');

  // Validate query parameters
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  });

  const queryResult = validateQueryParams(request, querySchema);

  if (!queryResult.success) {
    logger.warn('Query validation failed');
    return NextResponse.json(queryResult.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { page, pageSize, search } = queryResult.data;

  // Optional authentication - get user if authenticated
  const user = await optionalAuth(request);

  logger.info('Query validated', {
    page,
    pageSize,
    search,
    authenticated: !!user,
  });

  // Build response
  const response: ApiSuccessResponse<{
    items: string[];
    authenticated: boolean;
    userId?: string;
  }> = {
    success: true,
    data: {
      items: ['Example item 1', 'Example item 2', 'Example item 3'],
      authenticated: !!user,
      ...(user && { userId: user.id }),
    },
    message: 'Data retrieved successfully',
    meta: {
      page,
      pageSize,
      totalItems: 3,
      totalPages: 1,
      hasMore: false,
    },
  };

  logger.info('Request completed successfully');

  return NextResponse.json(response, {
    status: HttpStatus.OK,
  });
}

/**
 * POST /api/example
 *
 * Example of a protected endpoint requiring authentication.
 * Demonstrates body validation, auth middleware, and error handling.
 */
export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request);
  logger.info('Processing POST /api/example');

  // Require authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    logger.warn('Authentication failed');
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  const user = authResult.user;
  logger.info('User authenticated', { userId: user.id });

  // Validate request body
  const bodySchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    tags: z.array(z.string()).max(10).optional(),
    published: z.boolean().default(false),
  });

  const bodyResult = await validateRequestBody(request, bodySchema);

  if (!bodyResult.success) {
    logger.warn('Body validation failed');
    return NextResponse.json(bodyResult.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { title, content, tags, published } = bodyResult.data;

  logger.info('Request validated', { title, published, tagCount: tags?.length || 0 });

  try {
    // Simulate processing (replace with actual business logic)
    const newItem = {
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      published,
      authorId: user.id,
      createdAt: new Date().toISOString(),
    };

    logger.info('Item created successfully', { itemId: newItem.id });

    // Build success response
    const response: ApiSuccessResponse<typeof newItem> = {
      success: true,
      data: newItem,
      message: 'Item created successfully',
    };

    return NextResponse.json(response, {
      status: HttpStatus.CREATED,
    });
  } catch (error) {
    logger.error('Failed to create item', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to create item', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    );
  }
}

/**
 * PATCH /api/example
 *
 * Example of partial update with validation.
 * Demonstrates using .partial() for optional fields.
 */
export async function PATCH(request: NextRequest) {
  const logger = createRequestLogger(request);
  logger.info('Processing PATCH /api/example');

  // Require authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    logger.warn('Authentication failed');
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  // Validate partial update
  const updateSchema = z
    .object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(5000),
      tags: z.array(z.string()).max(10),
      published: z.boolean(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    });

  const bodyResult = await validateRequestBody(request, updateSchema);

  if (!bodyResult.success) {
    logger.warn('Body validation failed');
    return NextResponse.json(bodyResult.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const updates = bodyResult.data;

  logger.info('Update validated', { fields: Object.keys(updates) });

  const response: ApiSuccessResponse<{ updated: boolean; fields: string[] }> = {
    success: true,
    data: {
      updated: true,
      fields: Object.keys(updates),
    },
    message: 'Item updated successfully',
  };

  return NextResponse.json(response, {
    status: HttpStatus.OK,
  });
}

/**
 * DELETE /api/example
 *
 * Example of deletion with authentication.
 */
export async function DELETE(request: NextRequest) {
  const logger = createRequestLogger(request);
  logger.info('Processing DELETE /api/example');

  // Require authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    logger.warn('Authentication failed');
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  logger.info('Item deleted successfully');

  // 204 No Content is the standard for successful DELETE
  return new NextResponse(null, {
    status: HttpStatus.NO_CONTENT,
  });
}
