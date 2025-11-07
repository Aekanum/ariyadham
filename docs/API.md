# API Conventions & Guidelines

**Ariyadham API Documentation**

This document defines the standard patterns, conventions, and best practices for all API endpoints in the Ariyadham platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Request Validation](#request-validation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Logging](#logging)
7. [Rate Limiting](#rate-limiting)
8. [Creating New Endpoints](#creating-new-endpoints)
9. [Common Patterns](#common-patterns)
10. [Testing APIs](#testing-apis)

---

## Overview

### API Design Principles

The Ariyadham API follows these core principles:

1. **Consistency**: All endpoints use the same response format and patterns
2. **Type Safety**: Full TypeScript types for requests and responses
3. **Validation**: All inputs validated with Zod schemas
4. **Security**: Authentication and authorization built-in
5. **Observability**: Comprehensive logging for debugging
6. **RESTful**: Standard HTTP methods and resource-based URLs

### Technology Stack

- **Framework**: Next.js 14 API Routes
- **Validation**: Zod
- **Authentication**: Supabase Auth
- **Logging**: Custom structured logger
- **Rate Limiting**: Placeholder (Vercel + future Upstash)

---

## Response Format

All API responses follow a consistent structure.

### Success Response

```typescript
{
  success: true,
  data: {
    // Your response data
  },
  message?: "Optional success message",
  meta?: {
    // Optional metadata (pagination, etc.)
    page: 1,
    pageSize: 20,
    totalItems: 100,
    totalPages: 5,
    hasMore: true
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "User-friendly error message",
    details?: {
      // Optional additional context
    },
    stack?: "..." // Only in development
  }
}
```

### HTTP Status Codes

Use standard HTTP status codes:

| Code | Usage                                               |
| ---- | --------------------------------------------------- |
| 200  | Success (GET, PATCH, DELETE with body)              |
| 201  | Created (POST)                                      |
| 204  | No Content (DELETE without body)                    |
| 400  | Bad Request (validation errors, invalid input)      |
| 401  | Unauthorized (not authenticated)                    |
| 403  | Forbidden (authenticated but lacks permission)      |
| 404  | Not Found (resource doesn't exist)                  |
| 409  | Conflict (duplicate entry, resource already exists) |
| 422  | Unprocessable Entity (semantic validation errors)   |
| 429  | Too Many Requests (rate limit exceeded)             |
| 500  | Internal Server Error                               |
| 503  | Service Unavailable                                 |

---

## Error Handling

### Standard Error Codes

All errors use standardized error codes defined in `src/types/api.ts`:

**Authentication Errors (401)**

- `UNAUTHORIZED` - Not authenticated
- `INVALID_TOKEN` - Token is invalid
- `TOKEN_EXPIRED` - Token has expired
- `SESSION_EXPIRED` - Session has expired

**Authorization Errors (403)**

- `FORBIDDEN` - Generic authorization failure
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `ACCOUNT_SUSPENDED` - Account is suspended
- `EMAIL_NOT_VERIFIED` - Email not verified

**Validation Errors (400)**

- `VALIDATION_ERROR` - Input validation failed
- `INVALID_INPUT` - Invalid input format
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Data format invalid

**Resource Errors (404)**

- `NOT_FOUND` - Generic not found
- `RESOURCE_NOT_FOUND` - Specific resource not found
- `ENDPOINT_NOT_FOUND` - API endpoint doesn't exist

**Conflict Errors (409)**

- `CONFLICT` - Generic conflict
- `DUPLICATE_ENTRY` - Resource already exists
- `RESOURCE_ALREADY_EXISTS` - Duplicate resource

**Rate Limiting (429)**

- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `TOO_MANY_REQUESTS` - Too many requests

**Server Errors (500)**

- `INTERNAL_SERVER_ERROR` - Generic server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service failed

**Business Logic Errors (400-499)**

- `ARTICLE_NOT_PUBLISHED` - Article not published
- `ARTICLE_ALREADY_PUBLISHED` - Article already published
- `AUTHOR_NOT_APPROVED` - Author not approved
- `COMMENT_NOT_ALLOWED` - Comments not allowed
- `INVALID_OPERATION` - Invalid operation

### Creating Error Responses

```typescript
import { createErrorResponse } from '@/lib/validation';
import { HttpStatus } from '@/types/api';

// Simple error
return NextResponse.json(createErrorResponse('NOT_FOUND', 'Article not found'), {
  status: HttpStatus.NOT_FOUND,
});

// Error with details
return NextResponse.json(
  createErrorResponse('VALIDATION_ERROR', 'Invalid input', {
    field: 'email',
    expected: 'valid email address',
  }),
  { status: HttpStatus.BAD_REQUEST }
);
```

---

## Request Validation

All request data should be validated using Zod schemas.

### Validating Request Body

```typescript
import { z } from 'zod';
import { validateRequestBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  // Define schema
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  // Validate
  const result = await validateRequestBody(request, schema);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { email, password } = result.data;
  // ... use validated data
}
```

### Validating Query Parameters

```typescript
import { validateQueryParams, commonSchemas } from '@/lib/validation';

export async function GET(request: NextRequest) {
  // Use common pagination schema
  const result = validateQueryParams(request, commonSchemas.pagination);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { page, pageSize, sortBy, sortOrder } = result.data;
  // ... use validated params
}
```

### Validating Route Parameters

```typescript
import { validateRouteParams } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const schema = z.object({
    id: z.string().uuid(),
  });

  const result = validateRouteParams(params, schema);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { id } = result.data;
  // ... use validated id
}
```

### Common Validation Schemas

Reusable schemas are available in `commonSchemas`:

```typescript
import { commonSchemas } from '@/lib/validation';

// UUID
commonSchemas.uuid;

// Email
commonSchemas.email;

// Password (min 8, uppercase, lowercase, number)
commonSchemas.password;

// Pagination parameters
commonSchemas.pagination;

// ISO date
commonSchemas.isoDate;

// URL
commonSchemas.url;

// Slug (lowercase, numbers, hyphens)
commonSchemas.slug;
```

---

## Authentication & Authorization

### Require Authentication

```typescript
import { requireAuth } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  const user = authResult.user;
  // ... user is authenticated
}
```

### Require Specific Role

```typescript
import { requireRole, requireAuthor, requireAdmin } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  // Require author or admin role
  const authResult = await requireAuthor(request);

  if (!authResult.success) {
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  // ... user has author/admin role
}

// Or require admin only
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request);
  // ...
}
```

### Optional Authentication

```typescript
import { optionalAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  // Get user if authenticated, null otherwise
  const user = await optionalAuth(request);

  if (user) {
    // Personalize response for authenticated user
  } else {
    // Return public data
  }
}
```

### Require Verified Email

```typescript
import { requireVerifiedEmail } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  const authResult = await requireVerifiedEmail(request);

  if (!authResult.success) {
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  // ... user is authenticated and email is verified
}
```

---

## Logging

### Request Logger

```typescript
import { createRequestLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request);

  logger.info('Processing article creation');

  try {
    // ... create article
    logger.info('Article created successfully', { articleId: article.id });
  } catch (error) {
    logger.error('Failed to create article', error);
  }
}
```

### Log Levels

```typescript
logger.debug('Debug message', { context }); // Development only
logger.info('Info message', { context }); // General information
logger.warn('Warning message', { context }); // Warnings
logger.error('Error message', error, { context }); // Errors
```

### Automatic Logging Wrapper

```typescript
import { withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
  // Request and response automatically logged
  return NextResponse.json({ data: 'example' });
});
```

---

## Rate Limiting

### Basic Rate Limiting

```typescript
import { checkRateLimit, rateLimitPresets } from '@/lib/middleware/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(request, rateLimitPresets.write);

  if (!rateLimitResult.success) {
    return NextResponse.json(rateLimitResult.error, {
      status: rateLimitResult.status,
    });
  }

  // ... continue with request
}
```

### Rate Limit Presets

```typescript
import { rateLimitPresets } from '@/lib/middleware/rate-limit';

rateLimitPresets.strict; // 5 req/min
rateLimitPresets.standard; // 30 req/min
rateLimitPresets.relaxed; // 100 req/min
rateLimitPresets.write; // 10 req/min
rateLimitPresets.read; // 60 req/min
rateLimitPresets.auth; // 5 req/5min
```

### Custom Rate Limit

```typescript
const rateLimitResult = await checkRateLimit(request, {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
});
```

### Automatic Rate Limiting Wrapper

```typescript
import { withRateLimit, rateLimitPresets } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  // ... your handler logic
}, rateLimitPresets.write);
```

**Note**: Current implementation is a placeholder. For production, implement proper rate limiting with Redis or Upstash. See `src/lib/middleware/rate-limit.ts` for details.

---

## Creating New Endpoints

### Step-by-Step Guide

1. **Create the route file**

   ```
   src/app/api/[your-endpoint]/route.ts
   ```

2. **Import required utilities**

   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { z } from 'zod';
   import { validateRequestBody, createErrorResponse } from '@/lib/validation';
   import { requireAuth } from '@/lib/middleware/auth';
   import { createRequestLogger } from '@/lib/logger';
   import { ApiSuccessResponse, HttpStatus } from '@/types/api';
   ```

3. **Force dynamic rendering**

   ```typescript
   export const dynamic = 'force-dynamic';
   ```

4. **Implement handler**

   ```typescript
   export async function POST(request: NextRequest) {
     const logger = createRequestLogger(request);

     // 1. Authentication (if needed)
     const authResult = await requireAuth(request);
     if (!authResult.success) {
       return NextResponse.json(authResult.error, {
         status: authResult.status,
       });
     }

     // 2. Validation
     const schema = z.object({
       // ... your schema
     });

     const bodyResult = await validateRequestBody(request, schema);
     if (!bodyResult.success) {
       return NextResponse.json(bodyResult.error, {
         status: HttpStatus.BAD_REQUEST,
       });
     }

     // 3. Business logic
     try {
       // ... process request
       logger.info('Operation successful');

       const response: ApiSuccessResponse<YourDataType> = {
         success: true,
         data: yourData,
         message: 'Success message',
       };

       return NextResponse.json(response, {
         status: HttpStatus.CREATED,
       });
     } catch (error) {
       logger.error('Operation failed', error);
       return NextResponse.json(createErrorResponse('INTERNAL_SERVER_ERROR', 'Operation failed'), {
         status: HttpStatus.INTERNAL_SERVER_ERROR,
       });
     }
   }
   ```

### Complete Example

See `src/app/api/example/route.ts` for a complete working example demonstrating:

- GET with optional auth
- POST with required auth
- PATCH with partial updates
- DELETE with authentication
- Query parameter validation
- Body validation
- Error handling
- Logging

---

## Common Patterns

### Pagination

```typescript
import { commonSchemas } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const result = validateQueryParams(request, commonSchemas.pagination);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { page, pageSize, sortBy, sortOrder } = result.data;

  // Fetch data with pagination
  const items = await fetchItems({ page, pageSize, sortBy, sortOrder });
  const totalItems = await countItems();

  const response: ApiSuccessResponse<typeof items> = {
    success: true,
    data: items,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      hasMore: page * pageSize < totalItems,
    },
  };

  return NextResponse.json(response);
}
```

### Filtering & Search

```typescript
const querySchema = commonSchemas.pagination.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  dateFrom: commonSchemas.isoDate.optional(),
  dateTo: commonSchemas.isoDate.optional(),
});

const result = validateQueryParams(request, querySchema);
// ... use filters in query
```

### Resource by ID

```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Validate ID
  const schema = z.object({
    id: z.string().uuid(),
  });

  const result = validateRouteParams(params, schema);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  // Fetch resource
  const resource = await fetchById(result.data.id);

  if (!resource) {
    return NextResponse.json(createErrorResponse('NOT_FOUND', 'Resource not found'), {
      status: HttpStatus.NOT_FOUND,
    });
  }

  return NextResponse.json({
    success: true,
    data: resource,
  });
}
```

### Partial Updates (PATCH)

```typescript
const updateSchema = z
  .object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    status: z.enum(['draft', 'published']),
  })
  .partial() // Make all fields optional
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
```

### Batch Operations

```typescript
const batchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['delete', 'archive', 'publish']),
});

const result = await validateRequestBody(request, batchSchema);

// Process in batches
const results = await Promise.allSettled(
  result.data.ids.map((id) => performAction(id, result.data.action))
);

const successful = results.filter((r) => r.status === 'fulfilled').length;
const failed = results.filter((r) => r.status === 'rejected').length;

return NextResponse.json({
  success: true,
  data: {
    successful,
    failed,
    total: result.data.ids.length,
  },
});
```

---

## Testing APIs

### Manual Testing

Use curl, Postman, or Thunder Client to test APIs:

```bash
# GET request
curl http://localhost:3000/api/example

# POST request with authentication
curl -X POST http://localhost:3000/api/example \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","content":"Test content"}'

# GET with query parameters
curl "http://localhost:3000/api/example?page=1&pageSize=20"
```

### Integration Tests

```typescript
// tests/api/example.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/example', () => {
  it('should return paginated data', async () => {
    const response = await fetch('http://localhost:3000/api/example?page=1');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.meta).toHaveProperty('page', 1);
  });

  it('should validate query parameters', async () => {
    const response = await fetch('http://localhost:3000/api/example?page=-1');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## Best Practices

### DO ✅

- Always validate all inputs (body, query, params)
- Use TypeScript types for request/response
- Log important events and errors
- Return consistent response format
- Use appropriate HTTP status codes
- Handle errors gracefully
- Add authentication where needed
- Use common schemas for reusable validations
- Force dynamic rendering with `export const dynamic = 'force-dynamic'`
- Follow RESTful conventions

### DON'T ❌

- Don't skip input validation
- Don't return different response formats
- Don't expose internal error details in production
- Don't forget to log errors
- Don't use wrong HTTP status codes
- Don't implement business logic in validation
- Don't use arbitrary error codes
- Don't forget authentication on protected routes
- Don't hardcode magic values
- Don't skip TypeScript types

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── health/          # Health check endpoint
│       ├── example/         # Example endpoint (reference)
│       └── [your-api]/      # Your API endpoints
├── lib/
│   ├── validation.ts        # Validation utilities
│   ├── logger.ts            # Logging utilities
│   ├── supabase-server.ts   # Supabase server client
│   └── middleware/
│       ├── auth.ts          # Auth middleware
│       └── rate-limit.ts    # Rate limiting (placeholder)
└── types/
    ├── api.ts               # API response types
    └── database.ts          # Database types
```

---

## References

- **Architecture**: See `docs/architecture.md` for system architecture
- **Example Route**: See `src/app/api/example/route.ts` for complete example
- **Database Schema**: See `docs/SCHEMA.md` for database structure
- **Deployment**: See `docs/DEPLOYMENT.md` for deployment guide

---

## Support

For questions or issues:

1. Check this documentation
2. Review the example route: `src/app/api/example/route.ts`
3. Check the architecture document: `docs/architecture.md`
4. Review implementation files in `src/lib/`

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
**Story**: 1.5 - API Foundation & Request Handling
