/**
 * Profile API Route
 *
 * Handles user profile management operations.
 * Endpoints: GET (fetch profile), PUT (update profile)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase-server';
import { validateRequestBody, createErrorResponse } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import type { User, UpdateUserProfileInput } from '@/types/database';
import { HttpStatus } from '@/types/api';

/**
 * Validation schema for profile updates
 */
const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url('Invalid URL format').optional().nullable(),
  language_preference: z.enum(['en', 'th']).optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional(),
  reading_font_size: z
    .number()
    .int()
    .min(12, 'Font size must be at least 12')
    .max(24, 'Font size must be at most 24')
    .optional(),
  accessibility_mode: z.boolean().optional(),
});

/**
 * GET /api/profile
 *
 * Fetches the current user's profile information
 *
 * @returns User profile data
 *
 * @example
 * ```ts
 * const response = await fetch('/api/profile');
 * const { data } = await response.json();
 * console.log(data); // User profile
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', 'Authentication required'), {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Return user profile
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while fetching profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PUT /api/profile
 *
 * Updates the current user's profile information
 *
 * @param request - Request with profile update data
 * @returns Updated user profile
 *
 * @example
 * ```ts
 * const response = await fetch('/api/profile', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     full_name: 'John Doe',
 *     bio: 'Meditation practitioner',
 *     language_preference: 'th'
 *   })
 * });
 * const { data } = await response.json();
 * ```
 */
export async function PUT(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', 'Authentication required'), {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Validate request body
    const validation = await validateRequestBody(request, updateProfileSchema);

    if (!validation.success) {
      return NextResponse.json(validation.error, {
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const updateData = validation.data as UpdateUserProfileInput;

    // Update user profile in database
    const supabase = createServerClient();

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to update profile', {
          error: updateError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', 'Profile not found'), {
        status: HttpStatus.NOT_FOUND,
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile as User,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while updating profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/profile
 *
 * Partially updates the current user's profile (alias for PUT)
 */
export const PATCH = PUT;
