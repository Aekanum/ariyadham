import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

/**
 * Health Check Endpoint
 *
 * This endpoint provides system health status including:
 * - API availability
 * - Database connectivity
 * - Environment configuration
 * - Build information
 *
 * @route GET /api/health
 * @returns {Object} Health status information
 */
export async function GET() {
  const startTime = Date.now();

  // Basic health information
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      api: true,
      database: false,
      environment: false,
    },
    errors: [] as string[],
  };

  // Check environment variables
  try {
    const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length === 0) {
      health.checks.environment = true;
    } else {
      health.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }
  } catch (error) {
    health.errors.push('Environment check failed');
  }

  // Check database connectivity
  try {
    const supabase = createClient();

    // Simple query to check database connection
    const { error } = await supabase.from('users').select('id').limit(1);

    if (!error) {
      health.checks.database = true;
    } else {
      health.errors.push(`Database error: ${error.message}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    health.errors.push(`Database connection failed: ${errorMessage}`);
  }

  // Determine overall health status
  const allChecksPass = Object.values(health.checks).every((check) => check === true);
  health.status = allChecksPass ? 'healthy' : 'degraded';

  // Add response time
  const responseTime = Date.now() - startTime;
  const healthWithMetrics = {
    ...health,
    responseTime: `${responseTime}ms`,
  };

  // Return appropriate status code
  const statusCode = allChecksPass ? 200 : 503;

  return NextResponse.json(healthWithMetrics, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * HEAD method for simple availability checks
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
