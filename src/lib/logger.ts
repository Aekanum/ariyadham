/**
 * Logging Utility
 *
 * Provides structured logging for API requests and application events.
 * Logs are formatted for easy parsing and include contextual information.
 *
 * @see docs/API.md for usage guidelines
 */

import { NextRequest } from 'next/server';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * Logger class for structured logging
 */
class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  /**
   * Creates a child logger with additional context
   */
  child(additionalContext: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Logs a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorInfo =
      error instanceof Error
        ? {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : undefined;

    this.log(LogLevel.ERROR, message, context, errorInfo);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: { message: string; stack?: string }
  ): void {
    // Skip debug logs in production
    if (level === LogLevel.DEBUG && process.env.NODE_ENV === 'production') {
      return;
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context: { ...this.context, ...context },
      ...(error && { error }),
    };

    // Format output based on environment
    if (process.env.NODE_ENV === 'development') {
      this.logFormatted(entry);
    } else {
      // JSON format for production (easier to parse with log aggregators)
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Formats log entry for development (human-readable)
   */
  private logFormatted(entry: LogEntry): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',
    };

    const color = colors[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${colors.reset}`;
    const timestamp = entry.timestamp;

    console.log(`${prefix} ${timestamp} - ${entry.message}`);

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('  Context:', entry.context);
    }

    if (entry.error) {
      console.log('  Error:', entry.error.message);
      if (entry.error.stack) {
        console.log('  Stack:', entry.error.stack);
      }
    }
  }
}

/**
 * Creates a logger instance
 *
 * @param context - Initial context for the logger
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger({ module: 'articles' });
 * logger.info('Article created', { articleId: '123' });
 * ```
 */
export function createLogger(context?: Record<string, unknown>): Logger {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Logs API request information
 *
 * @param request - Next.js request object
 * @param additionalContext - Additional context to log
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   logRequest(request, { handler: 'getArticles' });
 *   // ... rest of handler
 * }
 * ```
 */
export function logRequest(
  request: NextRequest,
  additionalContext?: Record<string, unknown>
): void {
  const url = new URL(request.url);

  logger.info('API Request', {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    ...additionalContext,
  });
}

/**
 * Logs API response information
 *
 * @param request - Next.js request object
 * @param status - HTTP status code
 * @param duration - Request duration in milliseconds
 * @param additionalContext - Additional context to log
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const startTime = Date.now();
 *
 *   // ... process request
 *
 *   const duration = Date.now() - startTime;
 *   logResponse(request, 200, duration);
 *
 *   return NextResponse.json(data);
 * }
 * ```
 */
export function logResponse(
  request: NextRequest,
  status: number,
  duration: number,
  additionalContext?: Record<string, unknown>
): void {
  const url = new URL(request.url);
  const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;

  logger[level]('API Response', {
    method: request.method,
    path: url.pathname,
    status,
    duration: `${duration}ms`,
    ...additionalContext,
  });
}

/**
 * Creates a request-scoped logger with request context
 *
 * @param request - Next.js request object
 * @returns Logger instance with request context
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const logger = createRequestLogger(request);
 *
 *   logger.info('Processing article creation');
 *
 *   try {
 *     // ... create article
 *     logger.info('Article created successfully', { articleId: article.id });
 *   } catch (error) {
 *     logger.error('Failed to create article', error);
 *   }
 * }
 * ```
 */
export function createRequestLogger(request: NextRequest): Logger {
  const url = new URL(request.url);
  const requestId = request.headers.get('x-request-id') || generateRequestId();

  return createLogger({
    requestId,
    method: request.method,
    path: url.pathname,
  });
}

/**
 * Generates a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Middleware wrapper for automatic request/response logging
 *
 * @param handler - API route handler function
 * @returns Wrapped handler with logging
 *
 * @example
 * ```typescript
 * export const GET = withLogging(async (request: NextRequest) => {
 *   // ... your handler logic
 *   return NextResponse.json({ data: 'example' });
 * });
 * ```
 */
export function withLogging<T>(handler: (request: NextRequest, ...args: T[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: T[]): Promise<Response> => {
    const startTime = Date.now();
    const requestLogger = createRequestLogger(request);

    requestLogger.info('Request received');

    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      requestLogger.info('Request completed', {
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      requestLogger.error('Request failed', error, {
        duration: `${duration}ms`,
      });

      throw error;
    }
  };
}
