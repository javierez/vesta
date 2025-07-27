/**
 * Simple utility functions for handling images
 */

/**
 * Handles image loading errors
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
): void {
  const img = e.target as HTMLImageElement;
  img.onerror = null; // Prevent infinite loop
  img.src = "/properties/suburban-dream.png";
}
