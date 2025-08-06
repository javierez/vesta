import { db } from "../db";
import { accounts } from "../db/schema";
import { eq } from "drizzle-orm";
import type { PosterPreferences } from "~/types/poster-preferences";

// Update poster preferences for an account
export async function updatePosterPreferences(
  accountId: number | bigint,
  posterPreferences: PosterPreferences,
) {
  try {
    // PATTERN: Always fetch current preferences first to avoid overwriting other settings
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)));

    if (!account) {
      throw new Error("Account not found");
    }

    // Get current preferences and cast to record to handle dynamic JSON structure
    const currentPreferences =
      (account.preferences as Record<string, unknown>) ?? {};

    // CRITICAL: Merge with existing preferences
    const updatedPreferences = {
      ...currentPreferences,
      poster_preferences: posterPreferences,
    };

    // Update database with merged preferences
    await db
      .update(accounts)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    return {
      success: true,
      message: "Poster preferences updated successfully",
      data: posterPreferences,
    };
  } catch (error) {
    console.error("Error updating poster preferences:", error);
    throw error;
  }
}

// Get poster preferences for an account
export async function getPosterPreferences(accountId: number | bigint) {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)));

    if (!account) {
      throw new Error("Account not found");
    }

    const preferences = account.preferences as Record<string, unknown>;
    const posterPreferences =
      preferences?.poster_preferences as PosterPreferences | null;

    return posterPreferences;
  } catch (error) {
    console.error("Error fetching poster preferences:", error);
    throw error;
  }
}

// Get poster preferences for an account with fallback to defaults
export async function getPosterPreferencesWithDefaults(
  accountId: number | bigint,
  defaultPreferences: PosterPreferences,
) {
  try {
    const savedPreferences = await getPosterPreferences(accountId);

    // Merge saved preferences with defaults to ensure all keys exist
    return {
      ...defaultPreferences,
      ...(savedPreferences ?? {}),
    };
  } catch (error) {
    console.error("Error fetching poster preferences with defaults:", error);
    // Return defaults if there's an error
    return defaultPreferences;
  }
}

// Delete poster preferences for an account (reset to null)
export async function deletePosterPreferences(accountId: number | bigint) {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)));

    if (!account) {
      throw new Error("Account not found");
    }

    const currentPreferences =
      (account.preferences as Record<string, unknown>) ?? {};

    // Remove poster_preferences key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { poster_preferences, ...updatedPreferences } = currentPreferences;

    await db
      .update(accounts)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    return {
      success: true,
      message: "Poster preferences deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting poster preferences:", error);
    throw error;
  }
}

// Check if account has poster preferences set
export async function hasPosterPreferences(
  accountId: number | bigint,
): Promise<boolean> {
  try {
    const preferences = await getPosterPreferences(accountId);
    return preferences !== null && Object.keys(preferences).length > 0;
  } catch (error) {
    console.error("Error checking poster preferences:", error);
    return false;
  }
}
