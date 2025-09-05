/**
 * Convert an image URL to base64 string
 * Required by Freepik API for image processing
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString('base64');
    
    return base64;
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw new Error(`Failed to process image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image size - Freepik has size limits
 * @param base64Image - Base64 encoded image string
 * @param maxSizeInMB - Maximum allowed size in MB (default: 10MB)
 * @returns true if valid, false if too large
 */
export function validateImageSize(base64Image: string, maxSizeInMB = 10): boolean {
  try {
    // Calculate the size of the base64 string
    // Base64 encoding increases size by ~33%, so we need to account for that
    const base64SizeInBytes = (base64Image.length * 3) / 4;
    const sizeInMB = base64SizeInBytes / (1024 * 1024);
    
    return sizeInMB <= maxSizeInMB;
  } catch (error) {
    console.error('Error validating image size:', error);
    return false;
  }
}

/**
 * Get the actual size of a base64 encoded image in MB
 */
export function getImageSizeInMB(base64Image: string): number {
  const base64SizeInBytes = (base64Image.length * 3) / 4;
  return base64SizeInBytes / (1024 * 1024);
}

/**
 * Download an image from URL and return it as a Buffer
 * Useful for S3 uploads after Freepik processing
 */
export async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading image as buffer:', error);
    throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a filename for enhanced images
 * Following the existing naming pattern but with "enhanced" prefix
 */
export function generateEnhancedImageFilename(
  referenceNumber: string,
  originalImageOrder: number,
  nanoid: string,
  fileExtension = 'jpg'
): string {
  return `${referenceNumber}/images/enhanced_${originalImageOrder}_${nanoid}.${fileExtension}`;
}

/**
 * Extract file extension from URL or filename
 */
export function getFileExtensionFromUrl(url: string): string {
  try {
    const urlPath = new URL(url).pathname;
    const extension = urlPath.split('.').pop()?.toLowerCase();
    return extension ?? 'jpg'; // Default to jpg if no extension found
  } catch {
    // If URL parsing fails, try to extract from string directly
    const parts = url.split('.');
    return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : 'jpg';
  }
}

/**
 * Check if a URL points to a valid image based on extension
 */
export function isValidImageUrl(url: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const extension = getFileExtensionFromUrl(url);
  return validExtensions.includes(extension);
}

/**
 * Estimate processing time based on image size (for UI progress indicators)
 * Returns estimated time in seconds
 */
export function estimateProcessingTime(imageSizeInMB: number): number {
  // Base time of 30 seconds + 10 seconds per MB
  // This is just an estimate for UI purposes
  const baseTime = 30;
  const additionalTime = imageSizeInMB * 10;
  return Math.min(baseTime + additionalTime, 180); // Cap at 3 minutes
}