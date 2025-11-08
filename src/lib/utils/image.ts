/**
 * Image Utilities
 *
 * Functions for image optimization, resizing, and format conversion.
 * Used for avatar uploads, article images, and other user-generated media.
 */

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Optimize an image file for upload
 *
 * Resizes and compresses the image while maintaining aspect ratio.
 * Converts to WebP format by default for better compression.
 *
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Optimized image as Blob
 *
 * @example
 * ```ts
 * const optimized = await optimizeImage(file, {
 *   maxWidth: 400,
 *   maxHeight: 400,
 *   quality: 0.9
 * });
 * ```
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.9, format = 'webp' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with specified format and quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 *
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns New dimensions
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // If image is within bounds, return original dimensions
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Resize based on which dimension exceeds the max
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Validate if a file is a valid image
 *
 * @param file - The file to validate
 * @param allowedTypes - Allowed MIME types
 * @returns True if valid image
 *
 * @example
 * ```ts
 * if (!isValidImage(file)) {
 *   throw new Error('Invalid image file');
 * }
 * ```
 */
export function isValidImage(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file size
 *
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in megabytes
 * @returns True if within size limit
 *
 * @example
 * ```ts
 * if (!isValidFileSize(file, 5)) {
 *   throw new Error('File too large');
 * }
 * ```
 */
export function isValidFileSize(file: File, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Create multiple thumbnail sizes from an image
 *
 * Useful for creating avatar thumbnails in different sizes.
 *
 * @param file - The image file
 * @param sizes - Array of sizes to generate
 * @returns Array of optimized images with their sizes
 *
 * @example
 * ```ts
 * const thumbnails = await createThumbnails(file, [
 *   { width: 200, height: 200 },
 *   { width: 400, height: 400 }
 * ]);
 * ```
 */
export async function createThumbnails(
  file: File,
  sizes: Array<{ width: number; height: number }>
): Promise<Array<{ blob: Blob; width: number; height: number }>> {
  const thumbnails = await Promise.all(
    sizes.map(async (size) => {
      const blob = await optimizeImage(file, {
        maxWidth: size.width,
        maxHeight: size.height,
        quality: 0.9,
      });

      return {
        blob,
        width: size.width,
        height: size.height,
      };
    })
  );

  return thumbnails;
}

/**
 * Generate a unique filename for uploaded images
 *
 * @param userId - User ID for folder organization
 * @param originalFilename - Original filename
 * @param prefix - Optional prefix (e.g., 'avatar', 'article')
 * @returns Unique filename with path
 *
 * @example
 * ```ts
 * const filename = generateImageFilename(userId, 'profile.jpg', 'avatar');
 * // Returns: "user-id/avatar-1699876543210.jpg"
 * ```
 */
export function generateImageFilename(
  userId: string,
  originalFilename: string,
  prefix: string = 'image'
): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop() || 'jpg';
  return `${userId}/${prefix}-${timestamp}.${extension}`;
}

/**
 * Get image dimensions from a file
 *
 * @param file - The image file
 * @returns Promise with image dimensions
 *
 * @example
 * ```ts
 * const { width, height } = await getImageDimensions(file);
 * console.log(`Image is ${width}x${height}`);
 * ```
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert a File or Blob to base64 string
 *
 * Useful for preview images before upload.
 *
 * @param file - The file to convert
 * @returns Base64 string
 *
 * @example
 * ```ts
 * const base64 = await fileToBase64(file);
 * setPreviewImage(base64);
 * ```
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image dimensions
 *
 * @param file - The image file
 * @param minWidth - Minimum width
 * @param minHeight - Minimum height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns True if dimensions are valid
 */
export async function validateImageDimensions(
  file: File,
  minWidth: number = 0,
  minHeight: number = 0,
  maxWidth: number = 10000,
  maxHeight: number = 10000
): Promise<boolean> {
  try {
    const { width, height } = await getImageDimensions(file);

    return width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight;
  } catch {
    return false;
  }
}

/**
 * Format file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 *
 * @example
 * ```ts
 * const sizeStr = formatFileSize(1572864);
 * // Returns: "1.5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
