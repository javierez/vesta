import { db } from "../db";
import { accounts } from "../db/schema";
import { eq, like, or } from "drizzle-orm";

// Create a new account
export async function createAccount(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  plan?: string | null;
  subscriptionStatus?: string | null;
  isActive?: boolean | null;
}) {
  try {
    await db.insert(accounts).values({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      address: data.address ?? null,
      plan: data.plan ?? "basic",
      subscriptionStatus: data.subscriptionStatus ?? "active",
      isActive: data.isActive ?? true,
    });

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

// Get account by ID
export async function getAccountById(accountId: number | bigint) {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)));
    return account;
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
}

// Get account by name
export async function getAccountByName(name: string) {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.name, name));
    return account;
  } catch (error) {
    console.error("Error fetching account by name:", error);
    throw error;
  }
}

// Search accounts
export async function searchAccounts(searchTerm = "") {
  try {
    const baseQuery = db.select().from(accounts);

    let results;
    if (searchTerm.trim()) {
      results = await baseQuery
        .where(
          or(
            like(accounts.name, `%${searchTerm}%`),
            like(accounts.email, `%${searchTerm}%`),
            like(accounts.phone, `%${searchTerm}%`),
          ),
        )
        .orderBy(accounts.createdAt);
    } else {
      results = await baseQuery.orderBy(accounts.createdAt);
    }

    return results;
  } catch (error) {
    console.error("Error searching accounts:", error);
    throw error;
  }
}

// Update account
export async function updateAccount(
  accountId: number | bigint,
  data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    plan?: string | null;
    subscriptionStatus?: string | null;
    isActive?: boolean | null;
  },
) {
  try {
    await db
      .update(accounts)
      .set({
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        address: data.address ?? null,
        plan: data.plan ?? "basic",
        subscriptionStatus: data.subscriptionStatus ?? "active",
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    return { success: true, message: "Account updated successfully" };
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
}

// Delete account (soft delete by setting isActive to false)
export async function deleteAccount(accountId: number | bigint) {
  try {
    await db
      .update(accounts)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

// List all accounts (with pagination)
export async function listAccounts(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allAccounts = await db
      .select()
      .from(accounts)
      .limit(limit)
      .offset(offset);
    return allAccounts;
  } catch (error) {
    console.error("Error listing accounts:", error);
    throw error;
  }
}

// Get account by email
export async function getAccountByEmail(email: string) {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email));
    return account;
  } catch (error) {
    console.error("Error fetching account by email:", error);
    throw error;
  }
}

// Get accounts by subscription status
export async function getAccountsBySubscriptionStatus(status: string) {
  try {
    const accountsList = await db
      .select()
      .from(accounts)
      .where(eq(accounts.subscriptionStatus, status));
    return accountsList;
  } catch (error) {
    console.error("Error fetching accounts by subscription status:", error);
    throw error;
  }
}

// Get active accounts
export async function getActiveAccounts() {
  try {
    const activeAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.isActive, true));
    return activeAccounts;
  } catch (error) {
    console.error("Error fetching active accounts:", error);
    throw error;
  }
}

// Validate invitation code (check if account exists and is active)
export async function validateInvitationCode(accountId: number) {
  try {
    const account = await getAccountById(accountId);

    if (!account) {
      return { isValid: false, message: "Código de invitación inválido" };
    }

    if (!account.isActive) {
      return { isValid: false, message: "La cuenta asociada no está activa" };
    }

    return { isValid: true, message: "Código de invitación válido", account };
  } catch (error) {
    console.error("Error validating invitation code:", error);
    return {
      isValid: false,
      message: "Error al validar el código de invitación",
    };
  }
}

// Get account watermark configuration from portal settings and preferences
export async function getAccountWatermarkConfig(accountId: number | bigint) {
  try {
    const account = await getAccountById(accountId);

    if (!account) {
      console.warn(`Account not found for ID: ${accountId}`);
      return {
        watermarkEnabled: false,
        logoTransparent: null,
        watermarkPosition: "center" as const,
      };
    }

    // Extract portal settings and preferences with proper type casting
    const portalSettings =
      (account.portalSettings as Record<string, unknown>) ?? {};
    const preferences = (account.preferences as Record<string, unknown>) ?? {};

    // Get watermark settings from general portal configuration
    const general = (portalSettings.general as Record<string, unknown>) ?? {};
    const watermarkEnabled = Boolean(general.watermarkEnabled);
    const watermarkPosition = (general.watermarkPosition as string) || "center";

    // Get transparent logo URL from preferences
    const logoTransparent = preferences.logoTransparent as string;

    console.log("Retrieved watermark config for account:", {
      accountId: accountId.toString(),
      watermarkEnabled,
      hasLogo: !!logoTransparent,
      position: watermarkPosition,
    });

    return {
      watermarkEnabled,
      logoTransparent,
      watermarkPosition: watermarkPosition as
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center",
    };
  } catch (error) {
    console.error("Error getting account watermark config:", error);

    // Return safe defaults on error
    return {
      watermarkEnabled: false,
      logoTransparent: null,
      watermarkPosition: "center" as const,
    };
  }
}

// Get account ID for a given listing (helper function for Fotocasa integration)
export async function getAccountIdForListing(
  listingId: number,
): Promise<bigint | null> {
  try {
    // This would typically join with listings/properties table to get account ID
    // For now, implementing a simplified version based on existing patterns

    // Import at the top level would be better, but avoiding circular dependencies
    const { db } = await import("../db");
    const { listings, properties } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    // Get listing and associated property to find account ID
    const [listing] = await db
      .select({
        accountId: properties.accountId,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(eq(listings.listingId, BigInt(listingId)))
      .limit(1);

    if (!listing) {
      console.warn(`No account found for listing ID: ${listingId}`);
      return null;
    }

    return listing.accountId;
  } catch (error) {
    console.error("Error getting account ID for listing:", error);
    return null;
  }
}

// Update account portal settings (helper for watermark configuration updates)
export async function updateAccountPortalSettings(
  accountId: number | bigint,
  portalSettings: Record<string, unknown>,
) {
  try {
    const currentAccount = await getAccountById(accountId);

    if (!currentAccount) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Merge with existing portal settings to avoid data loss
    const currentPortalSettings =
      (currentAccount.portalSettings as Record<string, unknown>) ?? {};
    const updatedPortalSettings = {
      ...currentPortalSettings,
      ...portalSettings,
    };

    await db
      .update(accounts)
      .set({
        portalSettings: updatedPortalSettings,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    console.log("Updated portal settings for account:", accountId);

    return { success: true, message: "Portal settings updated successfully" };
  } catch (error) {
    console.error("Error updating account portal settings:", error);
    throw error;
  }
}

// Update account preferences (helper for logo updates)
export async function updateAccountPreferences(
  accountId: number | bigint,
  preferences: Record<string, unknown>,
) {
  try {
    const currentAccount = await getAccountById(accountId);

    if (!currentAccount) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Merge with existing preferences to avoid data loss
    const currentPreferences =
      (currentAccount.preferences as Record<string, unknown>) ?? {};
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };

    await db
      .update(accounts)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, BigInt(accountId)));

    console.log("Updated preferences for account:", accountId);

    return {
      success: true,
      message: "Account preferences updated successfully",
    };
  } catch (error) {
    console.error("Error updating account preferences:", error);
    throw error;
  }
}

// Get account transparent logo URL
export async function getAccountTransparentLogo(accountId: number | bigint): Promise<string | null> {
  try {
    const account = await getAccountById(accountId);
    
    if (!account) {
      console.warn(`Account not found for ID: ${accountId}`);
      return null;
    }

    // Extract transparent logo URL from preferences
    const preferences = (account.preferences as Record<string, unknown>) ?? {};
    const logoTransparent = preferences.logoTransparent as string | null;
    
    console.log("Retrieved transparent logo for account:", {
      accountId: accountId.toString(),
      hasLogo: !!logoTransparent,
      logoUrl: logoTransparent,
    });

    return logoTransparent ?? null;
  } catch (error) {
    console.error("Error getting account transparent logo:", error);
    return null;
  }
}

// Get account color palette from preferences
export async function getAccountColorPalette(accountId: number | bigint) {
  try {
    const account = await getAccountById(accountId);

    if (!account) {
      console.warn(`Account not found for ID: ${accountId}`);
      return [];
    }

    // Extract color palette from preferences
    const preferences = (account.preferences as Record<string, unknown>) ?? {};
    const colorPalette = preferences.colorPalette as string[];

    console.log("Retrieved color palette for account:", {
      accountId: accountId.toString(),
      colors: colorPalette?.length || 0,
    });

    return colorPalette || [];
  } catch (error) {
    console.error("Error getting account color palette:", error);
    return [];
  }
}
