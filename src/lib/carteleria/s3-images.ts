// AWS S3 image utilities for template system
// CRITICAL: AWS S3 bucket: vesta-configuration-files, region: us-east-1

// Base S3 URL for template images
const S3_BASE_URL =
  "https://vesta-configuration-files.s3.amazonaws.com/templates/";

// Available template images from vesta-configuration-files bucket
const AVAILABLE_TEMPLATE_IMAGES = [
  "IMG_0744.JPG",
  "IMG_0745.JPG",
  "IMG_0749.JPG",
];

/**
 * Get template images for specified count (3 or 4)
 * @param count - Number of images to return (3 or 4)
 * @returns Array of AWS S3 URLs
 */
export const getTemplateImages = (count: 3 | 4): string[] => {
  const images = AVAILABLE_TEMPLATE_IMAGES.slice(0, count);

  // For 4 images, duplicate first image if we don't have enough
  if (count === 4 && images.length < 4) {
    const remainingCount = 4 - images.length;
    for (let i = 0; i < remainingCount; i++) {
      images.push(AVAILABLE_TEMPLATE_IMAGES[0]!);
    }
  }

  return images.map((img) => `${S3_BASE_URL}${img}`);
};

/**
 * Get all available template images
 * @returns Array of all AWS S3 URLs
 */
export const getAllTemplateImages = (): string[] => {
  return AVAILABLE_TEMPLATE_IMAGES.map((img) => `${S3_BASE_URL}${img}`);
};

/**
 * Get a specific template image by filename
 * @param filename - Image filename (e.g., "IMG_0744.JPG")
 * @returns AWS S3 URL or null if not found
 */
export const getTemplateImageByFilename = (filename: string): string | null => {
  if (!AVAILABLE_TEMPLATE_IMAGES.includes(filename)) {
    return null;
  }
  return `${S3_BASE_URL}${filename}`;
};

/**
 * Validate if an image count is supported
 * @param count - Number to validate
 * @returns true if count is 3 or 4
 */
export const isValidImageCount = (count: number): count is 3 | 4 => {
  return count === 3 || count === 4;
};

/**
 * Get random template images
 * @param count - Number of images to return (3 or 4)
 * @returns Array of AWS S3 URLs in random order
 */
export const getRandomTemplateImages = (count: 3 | 4): string[] => {
  const shuffled = [...AVAILABLE_TEMPLATE_IMAGES].sort(
    () => Math.random() - 0.5,
  );
  const images = shuffled.slice(0, count);

  // For 4 images, duplicate if needed
  if (count === 4 && images.length < 4) {
    const remainingCount = 4 - images.length;
    for (let i = 0; i < remainingCount; i++) {
      images.push(shuffled[0]!);
    }
  }

  return images.map((img) => `${S3_BASE_URL}${img}`);
};

// Export constants for use in other modules
export { S3_BASE_URL, AVAILABLE_TEMPLATE_IMAGES };
