import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Cron job to auto-publish scheduled articles
 * Story 4.2: Article Publishing & Scheduling
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * at regular intervals (e.g., every 5 minutes) to check for and publish scheduled articles.
 *
 * To secure this endpoint in production:
 * 1. Add Authorization header check with a secret token
 * 2. Use Vercel Cron with CRON_SECRET env variable
 * 3. Or use Supabase Edge Functions with cron trigger
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Call the database function to auto-publish scheduled articles
    const { data, error } = await supabase.rpc('auto_publish_scheduled_articles');

    if (error) {
      console.error('Auto-publish error:', error);
      return NextResponse.json(
        { error: 'Failed to auto-publish articles', details: error.message },
        { status: 500 }
      );
    }

    const publishedCount = data as number;

    return NextResponse.json({
      success: true,
      published_count: publishedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support POST for flexibility with different cron services
export async function POST(request: NextRequest) {
  return GET(request);
}
