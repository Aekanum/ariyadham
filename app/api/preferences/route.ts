import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  fontSize: z.number().min(12).max(24).optional(),
  language: z.enum(['en', 'th']).optional(),
  accessibilityMode: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

/**
 * PATCH /api/preferences
 * Update user preferences
 */
export async function PATCH(request: NextRequest) {
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
  const validation = updatePreferencesSchema.safeParse(body);

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

  const { fontSize, language, accessibilityMode, theme } = validation.data;

  // Build update object
  const updates: Record<string, unknown> = {};
  if (fontSize !== undefined) updates.reading_font_size = fontSize;
  if (language !== undefined) updates.language_preference = language;
  if (accessibilityMode !== undefined) updates.accessibility_mode = accessibilityMode;
  if (theme !== undefined) updates.theme_preference = theme;

  // Update preferences
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update preferences',
          code: 'UPDATE_FAILED',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: updates,
  });
}
