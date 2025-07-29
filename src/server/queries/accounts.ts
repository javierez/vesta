import { db } from "../db";
import { accounts } from "../db/schema";
import { eq, like, or } from "drizzle-orm";
import type { Account } from "../../lib/data";

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
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      address: data.address || null,
      plan: data.plan || "basic",
      subscriptionStatus: data.subscriptionStatus || "active",
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
export async function searchAccounts(searchTerm: string = "") {
  try {
    const baseQuery = db.select().from(accounts);

    let results;
    if (searchTerm.trim()) {
      results = await baseQuery
        .where(
          or(
            like(accounts.name, `%${searchTerm}%`),
            like(accounts.email, `%${searchTerm}%`),
            like(accounts.phone, `%${searchTerm}%`)
          )
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
export async function updateAccount(accountId: number | bigint, data: {
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
    await db
      .update(accounts)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        plan: data.plan || "basic",
        subscriptionStatus: data.subscriptionStatus || "active",
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
