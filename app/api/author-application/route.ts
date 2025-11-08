import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';

const createApplicationSchema = z.object({
  bio: z.string().min(100).max(1000),
  credentials: z.string().min(50).max(2000),
  writing_samples: z.string().optional(),
  motivation: z.string().min(100).max(1000),
});

/**
 * POST /api/author-application
 * Submit author application
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // Validate request body
  const body = await request.json();
  const validation = createApplicationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid request',
          details: validation.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { bio, credentials, writing_samples, motivation } = validation.data;

  // Check if user already has an application
  const { data: existingApplication } = await supabase
    .from('author_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .single();

  if (existingApplication) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'You already have an application',
          code: 'APPLICATION_EXISTS',
          details: { status: existingApplication.status },
        },
      },
      { status: 409 }
    );
  }

  // Create application
  const { data: application, error: createError } = await supabase
    .from('author_applications')
    .insert({
      user_id: user.id,
      bio,
      credentials,
      writing_samples,
      motivation,
      status: 'pending',
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create application',
          code: 'CREATE_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: application,
  });
}

/**
 * GET /api/author-application
 * Get current user's application
 */
export async function GET(_request: NextRequest) {
  const supabase = createServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // Get user's application
  const { data: application, error: fetchError } = await supabase
    .from('author_applications')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // No application found
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch application',
          code: 'FETCH_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: application,
  });
}
