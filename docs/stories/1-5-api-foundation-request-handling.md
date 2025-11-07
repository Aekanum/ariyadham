# Story 1.5: API Foundation & Request Handling

**Epic**: 1 - Foundation & Infrastructure
**Status**: ✅ DONE
**Completed**: 2025-11-07

---

## Story

**As a** backend developer
**I want to** setup core Next.js API routes with error handling, logging, and validation
**So that** all API endpoints follow consistent patterns

---

## Acceptance Criteria

### ✅ Validation & Error Handling

**Given** a request to any API endpoint
**When** invalid data is provided
**Then** a 400 response with clear error message is returned

**When** request is not authenticated (when required)
**Then** 401 Unauthorized is returned

**When** request is authenticated but user lacks permission
**Then** 403 Forbidden is returned

**And** all API responses follow consistent JSON structure
**And** successful responses include data payload
**And** error responses include error code and message

### ✅ Implementation Completed

- ✅ Middleware for auth verification created
- ✅ Standardized request/response types implemented
- ✅ Request validation library (Zod) integrated
- ✅ Request logging utility created
- ✅ Rate limiting placeholder added
- ✅ API conventions documented
- ✅ Example API route demonstrating all patterns

---

## Technical Implementation

### 1. Standardized Types (`src/types/api.ts`)

Created comprehensive TypeScript types for API responses:

```typescript
// Success response
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

// Error response
interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
```

**Features**:

- Type-safe response wrappers
- Standardized error codes
- Pagination metadata support
- HTTP status code enums
- Type guards for response checking

### 2. Validation Utilities (`src/lib/validation.ts`)

Implemented Zod-based validation utilities:

**Key Functions**:

- `validateRequestBody()` - Validates request body against Zod schema
- `validateQueryParams()` - Validates query parameters
- `validateRouteParams()` - Validates route parameters
- `formatZodError()` - Formats Zod errors into API responses
- `createErrorResponse()` - Creates standardized error responses

**Common Schemas**:

- UUID validation
- Email validation
- Password validation (min 8 chars, uppercase, lowercase, number)
- Pagination parameters
- ISO date strings
- URL validation
- Slug validation

### 3. Authentication Middleware (`src/lib/middleware/auth.ts`)

Created comprehensive auth middleware:

**Functions**:

- `requireAuth()` - Requires valid authentication
- `requireRole()` - Requires specific user role
- `requireAdmin()` - Requires admin role
- `requireAuthor()` - Requires author or admin role
- `optionalAuth()` - Optional authentication (returns user or null)
- `requireVerifiedEmail()` - Requires verified email

**Features**:

- Integrates with Supabase Auth
- Role-based access control
- Clear error messages
- Type-safe results

### 4. Logging Utility (`src/lib/logger.ts`)

Implemented structured logging:

**Features**:

- Multiple log levels (debug, info, warn, error)
- Request-scoped loggers
- Contextual information
- Colored output in development
- JSON format in production
- Stack traces in development
- Automatic request/response logging wrapper

**Functions**:

- `createLogger()` - Creates logger instance
- `createRequestLogger()` - Creates request-scoped logger
- `logRequest()` - Logs API request
- `logResponse()` - Logs API response
- `withLogging()` - Automatic logging wrapper

### 5. Rate Limiting Placeholder (`src/lib/middleware/rate-limit.ts`)

Created rate limiting infrastructure:

**Features**:

- Placeholder implementation for development
- In-memory store (development only)
- Common presets (strict, standard, relaxed, write, read, auth)
- Production implementation guide
- Integration ready for Upstash Rate Limit

**Note**: For production, documentation includes complete implementation guide using Upstash Rate Limit with Vercel KV.

### 6. Example API Route (`src/app/api/example/route.ts`)

Created comprehensive example demonstrating:

- GET with optional authentication
- POST with required authentication
- PATCH with partial updates
- DELETE with authentication
- Query parameter validation
- Body validation
- Route parameter validation
- Error handling
- Logging
- Standard response format

### 7. API Documentation (`docs/API.md`)

Created comprehensive API documentation:

**Sections**:

- Response format standards
- Error handling guide
- Request validation patterns
- Authentication & authorization
- Logging best practices
- Rate limiting guide
- Creating new endpoints
- Common patterns (pagination, filtering, resource CRUD)
- Testing APIs
- Best practices
- File structure reference

---

## Files Created

```
src/
├── app/
│   └── api/
│       └── example/
│           └── route.ts          # Example API route (241 lines)
├── lib/
│   ├── validation.ts             # Validation utilities (329 lines)
│   ├── logger.ts                 # Logging utilities (324 lines)
│   └── middleware/
│       ├── auth.ts               # Auth middleware (273 lines)
│       └── rate-limit.ts         # Rate limiting (234 lines)
└── types/
    └── api.ts                    # API types (168 lines)

docs/
└── API.md                        # API documentation (1,054 lines)
```

**Total**: 2,623 lines of code and documentation

---

## Dependencies Added

- **zod** (^3.22.4) - Schema validation library

---

## Quality Checks

### ✅ Type Safety

```bash
npm run type-check
# ✅ No TypeScript errors
```

### ✅ Linting

```bash
npm run lint
# ✅ No ESLint warnings or errors
```

### ✅ Code Quality

- All functions have JSDoc documentation
- Comprehensive inline comments
- Type-safe implementations
- Error handling in all code paths
- Consistent code style

---

## Usage Examples

### Protected Endpoint with Validation

```typescript
export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request);

  // 1. Authentication
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json(authResult.error, {
      status: authResult.status,
    });
  }

  // 2. Validation
  const schema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
  });

  const bodyResult = await validateRequestBody(request, schema);
  if (!bodyResult.success) {
    return NextResponse.json(bodyResult.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  // 3. Business logic
  const { title, content } = bodyResult.data;
  logger.info('Creating article', { title });

  // 4. Response
  const response: ApiSuccessResponse = {
    success: true,
    data: { id: '...', title, content },
    message: 'Article created successfully',
  };

  return NextResponse.json(response, {
    status: HttpStatus.CREATED,
  });
}
```

### Public Endpoint with Pagination

```typescript
export async function GET(request: NextRequest) {
  // Validate pagination params
  const result = validateQueryParams(request, commonSchemas.pagination);

  if (!result.success) {
    return NextResponse.json(result.error, {
      status: HttpStatus.BAD_REQUEST,
    });
  }

  const { page, pageSize } = result.data;

  // Fetch data
  const items = await fetchItems({ page, pageSize });

  // Return with metadata
  return NextResponse.json({
    success: true,
    data: items,
    meta: {
      page,
      pageSize,
      totalItems: 100,
      totalPages: 5,
      hasMore: true,
    },
  });
}
```

---

## Testing

### Manual Testing

Tested using curl:

```bash
# GET endpoint
curl http://localhost:3000/api/example

# POST with validation error
curl -X POST http://localhost:3000/api/example \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'

# Successful response format verified
```

### Type Checking

All TypeScript types compile successfully with no errors.

### Linting

All code follows ESLint rules with no warnings.

---

## Benefits

### For Developers

1. **Consistency**: All endpoints follow the same patterns
2. **Type Safety**: Full TypeScript coverage prevents runtime errors
3. **Less Boilerplate**: Reusable utilities reduce code duplication
4. **Better DX**: Clear error messages and validation feedback
5. **Easy Onboarding**: Example route and comprehensive docs

### For API Consumers

1. **Predictable Responses**: Consistent format across all endpoints
2. **Clear Errors**: Detailed error codes and messages
3. **Type Definitions**: Can generate TypeScript types from responses
4. **Standard HTTP**: Follows REST conventions

### For Operations

1. **Observability**: Structured logging for debugging
2. **Security**: Built-in authentication and authorization
3. **Rate Limiting**: Infrastructure ready for production
4. **Error Tracking**: Consistent error format for monitoring

---

## Next Steps

### Story 1.6: Core Utilities & Shared Infrastructure

Now that API foundation is complete, the next story will implement:

- Date/time utilities
- String formatting helpers
- Array/object utilities
- Constants and configuration
- Environment variable validation
- Error boundary components
- Loading states
- Toast notifications

### Future API Enhancements

**When needed (Epic 2+)**:

1. Implement production rate limiting with Upstash
2. Add API versioning (v1, v2)
3. Implement API documentation generation (OpenAPI/Swagger)
4. Add request tracing for distributed debugging
5. Implement API response caching
6. Add GraphQL support (if needed)
7. Implement webhook infrastructure

---

## Lessons Learned

### What Went Well

1. **Comprehensive Planning**: Clear acceptance criteria made implementation straightforward
2. **Type Safety First**: TypeScript caught many potential bugs during development
3. **Documentation**: Writing docs alongside code ensured nothing was missed
4. **Example Route**: Having a working example helps future development

### Challenges Overcome

1. **Zod Error Format**: Initially used `errors` instead of `issues` property
2. **Unused Imports**: Fixed TypeScript warnings about unused imports
3. **Middleware Design**: Balanced flexibility with ease of use

### Best Practices Established

1. Always validate inputs with Zod schemas
2. Use TypeScript types for all request/response
3. Log important events and errors
4. Return consistent response format
5. Use appropriate HTTP status codes
6. Handle errors gracefully
7. Document patterns as you build

---

## References

- **API Documentation**: `docs/API.md`
- **Example Route**: `src/app/api/example/route.ts`
- **Architecture**: `docs/architecture.md` (API Design section)
- **Epic Definition**: `docs/epics.md` (Story 1.5)
- **Zod Documentation**: https://zod.dev
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## Commit Message

```
feat(story-1.5): Complete API foundation and request handling

Implemented comprehensive API infrastructure:

- Added Zod validation with request/query/route validators
- Created standardized API response types (success/error)
- Implemented auth middleware (requireAuth, requireRole, etc.)
- Added structured logging with request-scoped loggers
- Created rate limiting placeholder (production-ready guide included)
- Built example API route demonstrating all patterns
- Documented API conventions in docs/API.md

All acceptance criteria met:
✅ Consistent JSON response format
✅ Standardized error handling with codes
✅ Authentication middleware (401/403)
✅ Input validation with clear errors (400)
✅ Request logging for observability
✅ Comprehensive documentation

Quality checks:
✅ TypeScript: No errors
✅ ESLint: No warnings
✅ All code documented

Story 1.5 complete. Ready for Story 1.6.
```

---

**Completion Date**: 2025-11-07
**Developer**: Claude
**Review Status**: Self-reviewed
**Deployment Status**: Ready for deployment

🙏 May this foundation serve the dharma platform well.
