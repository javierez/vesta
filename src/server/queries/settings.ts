"use server";

import { db } from "../db";
import { accounts, users } from "../db/schema";
import { eq } from "drizzle-orm";
import type {
  AccountSettings,
  AccountInput,
  UserSettings,
  UserInput,
} from "../../types/settings";

// Account Settings Queries
export async function getAccountSettings(
  accountId: bigint,
): Promise<AccountSettings | null> {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, accountId))
      .limit(1);

    if (!account) {
      return null;
    }

    return {
      accountId: account.accountId,
      name: account.name,
      logo: account.logo ?? undefined,
      address: account.address ?? undefined,
      phone: account.phone ?? undefined,
      email: account.email ?? undefined,
      website: account.website ?? undefined,
      portalSettings: (account.portalSettings as Record<string, unknown>) ?? {},
      paymentSettings:
        (account.paymentSettings as Record<string, unknown>) ?? {},
      preferences: (account.preferences as Record<string, unknown>) ?? {},
      plan: account.plan ?? "basic",
      subscriptionStatus: account.subscriptionStatus ?? "active",
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      isActive: account.isActive ?? true,
    };
  } catch (error) {
    console.error("Error fetching account settings:", error);
    throw new Error("Failed to fetch account settings");
  }
}

export async function updateAccountSettings(
  accountId: bigint,
  data: Partial<AccountInput> & { logo?: string }, // logo as URL string from S3
): Promise<AccountSettings> {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logo !== undefined) updateData.logo = data.logo;

    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.accountId, accountId));

    const updatedAccount = await getAccountSettings(accountId);
    if (!updatedAccount) {
      throw new Error("Failed to fetch updated account settings");
    }

    return updatedAccount;
  } catch (error) {
    console.error("Error updating account settings:", error);
    throw new Error("Failed to update account settings");
  }
}

export async function updateAccountLogo(
  accountId: bigint,
  logoUrl: string,
): Promise<AccountSettings> {
  try {
    await db
      .update(accounts)
      .set({ logo: logoUrl })
      .where(eq(accounts.accountId, accountId));

    const updatedAccount = await getAccountSettings(accountId);
    if (!updatedAccount) {
      throw new Error("Failed to fetch updated account settings");
    }

    return updatedAccount;
  } catch (error) {
    console.error("Error updating account logo:", error);
    throw new Error("Failed to update account logo");
  }
}

export async function updateAccountPortalSettings(
  accountId: bigint,
  portalSettings: Record<string, unknown>,
): Promise<AccountSettings> {
  try {
    await db
      .update(accounts)
      .set({ portalSettings })
      .where(eq(accounts.accountId, accountId));

    const updatedAccount = await getAccountSettings(accountId);
    if (!updatedAccount) {
      throw new Error("Failed to fetch updated account settings");
    }

    return updatedAccount;
  } catch (error) {
    console.error("Error updating portal settings:", error);
    throw new Error("Failed to update portal settings");
  }
}

export async function updateAccountPaymentSettings(
  accountId: bigint,
  paymentSettings: Record<string, unknown>,
): Promise<AccountSettings> {
  try {
    await db
      .update(accounts)
      .set({ paymentSettings })
      .where(eq(accounts.accountId, accountId));

    const updatedAccount = await getAccountSettings(accountId);
    if (!updatedAccount) {
      throw new Error("Failed to fetch updated account settings");
    }

    return updatedAccount;
  } catch (error) {
    console.error("Error updating payment settings:", error);
    throw new Error("Failed to update payment settings");
  }
}

// User Settings Queries
export async function getUserSettings(
  userId: bigint,
): Promise<UserSettings | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      language: (user.language as "es" | "en") ?? "es",
      theme: "system", // Default, can be expanded when added to schema
      notifications: true, // Default, can be expanded when added to schema
      emailNotifications: true, // Default, can be expanded when added to schema
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw new Error("Failed to fetch user settings");
  }
}

export async function updateUserSettings(
  userId: bigint,
  data: Partial<UserInput>,
): Promise<UserSettings> {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.language !== undefined) updateData.language = data.language;
    // Add other user settings fields when they exist in the schema

    await db.update(users).set(updateData).where(eq(users.userId, userId));

    const updatedUser = await getUserSettings(userId);
    if (!updatedUser) {
      throw new Error("Failed to fetch updated user settings");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw new Error("Failed to update user settings");
  }
}

// Helper function to get account ID for a user
export async function getAccountIdForUser(
  userId: bigint,
): Promise<bigint | null> {
  try {
    const [user] = await db
      .select({ accountId: users.accountId })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    return user?.accountId ?? null;
  } catch (error) {
    console.error("Error fetching account ID for user:", error);
    return null;
  }
}
