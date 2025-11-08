/**
 * Avatar Upload API Route
 *
 * Handles avatar image upload to Supabase Storage.
 * Endpoint: POST /api/profile/avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { createErrorResponse } from '@/lib/validation';
import { HttpStatus } from '@/types/api';

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed MIME types for avatars
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * POST /api/profile/avatar
 *
 * Uploads a new avatar image for the authenticated user.
 * The image is stored in Supabase Storage and the user's profile is updated.
 *
 * @param request - FormData request with 'avatar' file field
 * @returns Object with avatar URL
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('avatar', file);
 *
 * const response = await fetch('/api/profile/avatar', {
 *   method: 'POST',
 *   body: formData
 * });
 *
 * const { data } = await response.json();
 * console.log(data.avatarUrl); // New avatar URL
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', 'Authentication required'), {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'No file uploaded', {
          field: 'avatar',
        }),
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
          {
            field: 'avatar',
            allowedTypes: ALLOWED_MIME_TYPES,
          }
        ),
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'File size exceeds the 5MB limit.', {
          field: 'avatar',
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        }),
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const supabase = createServerClient();

    // Delete old avatar if exists
    if (user.avatar_url) {
      try {
        const oldFileName = user.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldFileName]);
      } catch (error) {
        // Log but don't fail if deletion fails
        console.warn('Failed to delete old avatar:', error);
      }
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);

      return NextResponse.json(
        createErrorResponse('EXTERNAL_SERVICE_ERROR', 'Failed to upload avatar', {
          error: uploadError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);

    // Update user profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError);

      // Try to clean up uploaded file
      await supabase.storage.from('avatars').remove([fileName]);

      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', 'Failed to update profile with avatar', {
          error: updateError.message,
        }),
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: publicUrl,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error('Error in avatar upload:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while uploading avatar', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 *
 * Removes the user's current avatar.
 *
 * @returns Success response
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(createErrorResponse('UNAUTHORIZED', 'Authentication required'), {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!user.avatar_url) {
      return NextResponse.json(createErrorResponse('NOT_FOUND', 'No avatar to delete'), {
        status: HttpStatus.NOT_FOUND,
      });
    }

    const supabase = createServerClient();

    // Extract filename from URL
    const fileName = user.avatar_url.split('/').slice(-2).join('/');

    // Delete from storage
    const { error: deleteError } = await supabase.storage.from('avatars').remove([fileName]);

    if (deleteError) {
      console.error('Error deleting avatar:', deleteError);
      // Continue to update profile even if deletion fails
    }

    // Update user profile to remove avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
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

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'An error occurred while deleting avatar', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
