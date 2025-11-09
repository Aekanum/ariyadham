/**
 * Web Vitals Analytics API
 * Story 7.2: Core Web Vitals & Performance
 *
 * Endpoint for collecting Web Vitals metrics from clients.
 * Stores metrics for analysis and monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

interface WebVitalsPayload {
  metric: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta: number;
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

/**
 * POST /api/analytics/web-vitals
 *
 * Receive and store Web Vitals metrics from clients.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Supabase not configured - silently return success
      // Web Vitals collection is optional and shouldn't break the app
      console.warn('Web Vitals collection disabled: Supabase credentials not configured');
      return NextResponse.json({
        success: true,
        message: 'Metric received (Supabase not configured)',
      });
    }

    const supabase = createServerClient();

    // Parse request body - handle both JSON (fetch) and form data (sendBeacon)
    let payload: WebVitalsPayload;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Handle JSON from fetch requests
      payload = await request.json();
    } else {
      // Handle form data from sendBeacon (application/x-www-form-urlencoded)
      // sendBeacon sends the body as the first form field
      try {
        const text = await request.text();
        // Try to parse as JSON (sendBeacon often sends JSON as plain text)
        payload = JSON.parse(text);
      } catch {
        // If not JSON, try to parse as form data
        const formData = await request.formData();
        const bodyString = formData.get('') as string;
        payload = JSON.parse(bodyString || '{}');
      }
    }

    // Validate payload
    if (!payload.metric || !payload.value || !payload.rating) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      );
    }

    // Safely attempt to store metric in database
    try {
      // Get authenticated user (optional - metrics can be anonymous)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Store metric in database
      const { error: insertError } = await supabase.from('web_vitals_metrics').insert({
        user_id: user?.id || null,
        metric_name: payload.metric,
        metric_value: payload.value,
        rating: payload.rating,
        metric_id: payload.id,
        delta: payload.delta,
        navigation_type: payload.navigationType,
        page_url: payload.url,
        user_agent: payload.userAgent,
        created_at: new Date(payload.timestamp).toISOString(),
      });

      if (insertError) {
        console.error('Failed to insert Web Vitals metric:', {
          metric: payload.metric,
          value: payload.value,
          error: insertError.message,
          details: insertError,
        });

        // Don't fail the request if we can't insert - just log it
        // This ensures metrics collection doesn't impact user experience
        return NextResponse.json({
          success: true,
          message: 'Metric received but not stored',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Metric stored successfully',
      });
    } catch (supabaseError) {
      // Supabase operations failed (network, auth, etc.)
      const errorMessage = supabaseError instanceof Error ? supabaseError.message : String(supabaseError);
      console.warn('Supabase operation failed for Web Vitals:', {
        metric: payload.metric,
        error: errorMessage,
      });

      // Still return success - metrics collection is optional
      return NextResponse.json({
        success: true,
        message: 'Metric received (storage failed)',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error processing Web Vitals metric:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    // Return success even on error to not impact client performance
    // The error is logged for debugging
    return NextResponse.json({
      success: true,
      message: 'Metric received',
    });
  }
}

/**
 * GET /api/analytics/web-vitals
 *
 * Retrieve aggregated Web Vitals metrics (admin only).
 * Query params:
 * - period: 1h, 24h, 7d, 30d (default: 24h)
 * - metric: CLS, FCP, FID, INP, LCP, TTFB (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required',
          },
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '24h';
    const metricFilter = searchParams.get('metric');

    // Calculate time range
    const now = new Date();
    const startTime = new Date();

    switch (period) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setHours(now.getHours() - 24);
    }

    // Build query
    let query = supabase
      .from('web_vitals_metrics')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false });

    if (metricFilter) {
      query = query.eq('metric_name', metricFilter);
    }

    const { data: metrics, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate aggregates
    const aggregates: Record<
      string,
      {
        count: number;
        average: number;
        p50: number;
        p75: number;
        p95: number;
        good: number;
        needsImprovement: number;
        poor: number;
      }
    > = {};

    const metricsByName: Record<string, number[]> = {};

    metrics?.forEach((m) => {
      if (!metricsByName[m.metric_name]) {
        metricsByName[m.metric_name] = [];
        aggregates[m.metric_name] = {
          count: 0,
          average: 0,
          p50: 0,
          p75: 0,
          p95: 0,
          good: 0,
          needsImprovement: 0,
          poor: 0,
        };
      }

      metricsByName[m.metric_name].push(m.metric_value);

      // Count ratings
      if (m.rating === 'good') {
        aggregates[m.metric_name].good++;
      } else if (m.rating === 'needs-improvement') {
        aggregates[m.metric_name].needsImprovement++;
      } else {
        aggregates[m.metric_name].poor++;
      }
    });

    // Calculate percentiles
    Object.keys(metricsByName).forEach((metricName) => {
      const values = metricsByName[metricName].sort((a, b) => a - b);
      const count = values.length;

      aggregates[metricName].count = count;
      aggregates[metricName].average = values.reduce((sum, v) => sum + v, 0) / count;
      aggregates[metricName].p50 = values[Math.floor(count * 0.5)];
      aggregates[metricName].p75 = values[Math.floor(count * 0.75)];
      aggregates[metricName].p95 = values[Math.floor(count * 0.95)];
    });

    return NextResponse.json({
      success: true,
      data: {
        period,
        metrics: aggregates,
        rawCount: metrics?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error retrieving Web Vitals metrics:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve metrics',
        },
      },
      { status: 500 }
    );
  }
}
