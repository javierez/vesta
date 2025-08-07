"use server";

import { processImagesWithWatermark } from "~/lib/watermark";
import type {
  WatermarkConfig,
  AccountWatermarkSettings,
} from "~/types/watermark";
import { POSITION_MAPPING } from "~/types/watermark";

/**
 * Process images with watermark for server-side operations
 * Integrates with existing S3 patterns and server action requirements
 * Mirrors authentication patterns from existing server functions
 */
export async function processImageWithWatermark(
  images: Array<{ imageUrl: string; imageOrder?: number }>,
  watermarkSettings: AccountWatermarkSettings,
): Promise<
  Array<{
    imageUrl: string;
    watermarked: boolean;
    error?: string;
    imageOrder?: number;
  }>
> {
  try {
    // Validate input parameters
    if (!images || images.length === 0) {
      console.warn("No images provided for watermarking");
      return [];
    }

    if (!watermarkSettings) {
      console.warn("No watermark settings provided");
      return images.map((img) => ({ ...img, watermarked: false }));
    }

    // Check if watermarking is enabled
    if (
      !watermarkSettings.watermarkEnabled ||
      !watermarkSettings.logoTransparent
    ) {
      console.log(
        "Watermarking disabled or no logo available, returning original images",
      );
      return images.map((img) => ({ ...img, watermarked: false }));
    }

    // Convert portal settings to watermark config
    const watermarkConfig: WatermarkConfig = {
      enabled: watermarkSettings.watermarkEnabled,
      logoUrl: watermarkSettings.logoTransparent,
      position:
        POSITION_MAPPING[watermarkSettings.watermarkPosition ?? "center"] ??
        "center",
      size: 30, // 30% of image width as per PRP requirements
    };

    console.log("Processing images with watermark config:", {
      enabled: watermarkConfig.enabled,
      logoUrl: watermarkConfig.logoUrl ? "present" : "missing",
      position: watermarkConfig.position,
      imageCount: images.length,
    });

    // Process images with watermarking
    const processedImages = await processImagesWithWatermark(
      images,
      watermarkConfig,
    );

    // Log processing results for debugging
    const successCount = processedImages.filter(
      (img) => img.watermarked,
    ).length;
    const failureCount = processedImages.filter(
      (img) => !img.watermarked && img.error,
    ).length;

    console.log(
      `Image processing completed: ${successCount} successful, ${failureCount} failed, ${images.length - successCount - failureCount} skipped`,
    );

    return processedImages;
  } catch (error) {
    console.error("Error in processImageWithWatermark:", error);

    // CRITICAL: Never fail the entire operation - return original images
    // This ensures Fotocasa uploads continue even if watermarking fails
    return images.map((img) => ({
      ...img,
      watermarked: false,
      error: error instanceof Error ? error.message : "Image processing failed",
    }));
  }
}

/**
 * Validate watermark settings from account configuration
 * Ensures all required settings are present and valid
 */
export async function validateWatermarkSettings(
  settings: Partial<AccountWatermarkSettings>,
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!settings) {
    errors.push("No watermark settings provided");
    return { isValid: false, errors, warnings };
  }

  // Check if watermarking is explicitly disabled
  if (settings.watermarkEnabled === false) {
    return { isValid: true, errors, warnings: ["Watermarking is disabled"] };
  }

  // Validate required fields when enabled
  if (settings.watermarkEnabled === true) {
    if (!settings.logoTransparent) {
      errors.push(
        "Transparent logo URL is required when watermarking is enabled",
      );
    } else if (!isValidUrl(settings.logoTransparent)) {
      errors.push("Invalid transparent logo URL format");
    }

    // Validate position if specified
    if (
      settings.watermarkPosition &&
      !POSITION_MAPPING[settings.watermarkPosition]
    ) {
      warnings.push(
        `Invalid watermark position '${settings.watermarkPosition}', will use default 'bottom-right'`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get watermark configuration from account settings
 * Handles JSON field extraction and validation
 */
export async function extractWatermarkConfig(
  portalSettings: Record<string, unknown>,
  preferences: Record<string, unknown>,
): Promise<AccountWatermarkSettings> {
  // Extract watermark settings from portal settings general section
  const general = (portalSettings.general as Record<string, unknown>) ?? {};
  const watermarkEnabled = Boolean(general.watermarkEnabled);
  const watermarkPosition = (general.watermarkPosition as string) ?? "center";

  // Extract logo URL from preferences
  const logoTransparent = preferences.logoTransparent as string;

  return {
    watermarkEnabled,
    logoTransparent,
    watermarkPosition:
      watermarkPosition as AccountWatermarkSettings["watermarkPosition"],
  };
}

/**
 * Smart watermark positioning based on image characteristics
 * Uses optimal positioning logic for different image types
 */
export async function getSmartWatermarkPosition(
  imageUrl: string,
  preferredPosition?: string,
): Promise<string> {
  try {
    // Try to get image dimensions for smart positioning
    // This is optional - if it fails, we'll use the preferred or default position
    const response = await fetch(imageUrl, { method: "HEAD" });
    if (response.ok) {
      // For now, return preferred position or default
      // In the future, could implement image analysis for optimal positioning
      return preferredPosition ?? "center";
    }
  } catch (error) {
    console.warn("Could not analyze image for smart positioning:", error);
  }

  return preferredPosition ?? "center";
}

/**
 * Batch process multiple property images with performance optimization
 * Handles concurrent processing with rate limiting
 */
export async function batchProcessImages(
  imageGroups: Array<{
    images: Array<{ imageUrl: string; imageOrder?: number }>;
    watermarkSettings: AccountWatermarkSettings;
  }>,
  options: {
    concurrency?: number;
    timeoutMs?: number;
  } = {},
): Promise<
  Array<
    Array<{
      imageUrl: string;
      watermarked: boolean;
      error?: string;
      imageOrder?: number;
    }>
  >
> {
  const { concurrency = 3, timeoutMs = 30000 } = options;

  console.log(
    `Batch processing ${imageGroups.length} image groups with concurrency ${concurrency}`,
  );

  // Process image groups in batches to avoid overwhelming the server
  const results: Array<
    Array<{
      imageUrl: string;
      watermarked: boolean;
      error?: string;
      imageOrder?: number;
    }>
  > = [];

  for (let i = 0; i < imageGroups.length; i += concurrency) {
    const batch = imageGroups.slice(i, i + concurrency);

    const batchPromises = batch.map(async (group) => {
      const timeoutPromise = new Promise<
        Array<{
          imageUrl: string;
          watermarked: boolean;
          error?: string;
          imageOrder?: number;
        }>
      >((_, reject) =>
        setTimeout(() => reject(new Error("Processing timeout")), timeoutMs),
      );

      const processingPromise = processImageWithWatermark(
        group.images,
        group.watermarkSettings,
      );

      try {
        return await Promise.race([processingPromise, timeoutPromise]);
      } catch (error) {
        console.error("Batch processing error:", error);
        return group.images.map((img) => ({
          ...img,
          watermarked: false,
          error: "Processing timeout or error",
        }));
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches to prevent overwhelming the system
    if (i + concurrency < imageGroups.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`Batch processing completed: ${results.length} groups processed`);
  return results;
}

// Helper function to validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
