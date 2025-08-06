"use server";

import {
  updatePosterPreferences,
  getPosterPreferences,
  getPosterPreferencesWithDefaults,
  deletePosterPreferences,
  hasPosterPreferences,
} from "~/server/queries/poster-preferences";
import type { PosterPreferences } from "~/types/poster-preferences";
import { defaultPosterPreferences } from "~/types/poster-preferences";

// Standard server action response format
interface ServerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Save poster preferences for an account
 */
export async function savePosterPreferences(
  accountId: number,
  preferences: PosterPreferences,
): Promise<ServerActionResponse<PosterPreferences>> {
  try {
    const result = await updatePosterPreferences(accountId, preferences);

    if (result.success) {
      return {
        success: true,
        data: preferences,
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to save poster preferences",
      };
    }
  } catch (error) {
    console.error("Error saving poster preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save poster preferences",
    };
  }
}

/**
 * Load poster preferences for an account
 */
export async function loadPosterPreferences(
  accountId: number,
): Promise<ServerActionResponse<PosterPreferences | null>> {
  try {
    const preferences = await getPosterPreferences(accountId);

    return {
      success: true,
      data: preferences,
    };
  } catch (error) {
    console.error("Error loading poster preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load poster preferences",
    };
  }
}

/**
 * Load poster preferences with defaults fallback
 */
export async function loadPosterPreferencesWithDefaults(
  accountId: number,
): Promise<ServerActionResponse<PosterPreferences>> {
  try {
    const preferences = await getPosterPreferencesWithDefaults(
      accountId,
      defaultPosterPreferences,
    );

    return {
      success: true,
      data: preferences,
    };
  } catch (error) {
    console.error("Error loading poster preferences with defaults:", error);
    return {
      success: true, // Return success with defaults even if DB fails
      data: defaultPosterPreferences,
    };
  }
}

/**
 * Reset poster preferences to defaults
 */
export async function resetPosterPreferences(
  accountId: number,
): Promise<ServerActionResponse<PosterPreferences>> {
  try {
    // Delete existing preferences
    await deletePosterPreferences(accountId);

    // Save default preferences
    const result = await updatePosterPreferences(
      accountId,
      defaultPosterPreferences,
    );

    if (result.success) {
      return {
        success: true,
        data: defaultPosterPreferences,
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to reset poster preferences",
      };
    }
  } catch (error) {
    console.error("Error resetting poster preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to reset poster preferences",
    };
  }
}

/**
 * Update specific poster preference fields
 */
export async function updatePosterPreferenceFields(
  accountId: number,
  updates: Partial<PosterPreferences>,
): Promise<ServerActionResponse<PosterPreferences>> {
  try {
    // First get current preferences
    const currentPreferences = await getPosterPreferencesWithDefaults(
      accountId,
      defaultPosterPreferences,
    );

    // Merge with updates
    const updatedPreferences = {
      ...currentPreferences,
      ...updates,
    };

    // Save the merged preferences
    const result = await updatePosterPreferences(accountId, updatedPreferences);

    if (result.success) {
      return {
        success: true,
        data: updatedPreferences,
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to update poster preference fields",
      };
    }
  } catch (error) {
    console.error("Error updating poster preference fields:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update poster preference fields",
    };
  }
}

/**
 * Check if account has custom poster preferences
 */
export async function checkPosterPreferencesExist(
  accountId: number,
): Promise<ServerActionResponse<boolean>> {
  try {
    const exists = await hasPosterPreferences(accountId);

    return {
      success: true,
      data: exists,
    };
  } catch (error) {
    console.error("Error checking poster preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check poster preferences",
      data: false,
    };
  }
}

/**
 * Get poster preferences for preview (non-authenticated, returns defaults)
 */
export async function getPreviewPosterPreferences(): Promise<
  ServerActionResponse<PosterPreferences>
> {
  return {
    success: true,
    data: defaultPosterPreferences,
  };
}
