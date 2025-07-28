import { db } from "../db";
import { accounts } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Account } from "../../lib/data";

// Create a new account
export async function createAccount(
  data: Omit<Account, "accountId" | "createdAt" | "updatedAt">,
) {
  try {
    const [result] = await db.insert(accounts).values(data).$returningId();
    if (!result) throw new Error("Failed to create account");
    const [newAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(result.accountId)));
    return newAccount;
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
    const [account] = await db.select().from(accounts).where(eq(accounts.name, name));
    return account;
  } catch (error) {
    console.error("Error fetching account by name:", error);
    throw error;
  }
}

// Update account
export async function updateAccount(
  accountId: number | bigint,
  data: Omit<Partial<Account>, "accountId">,
) {
  try {
    await db
      .update(accounts)
      .set(data)
      .where(eq(accounts.accountId, BigInt(accountId)));
    const [updatedAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)));
    return updatedAccount;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
}

// Delete account
export async function deleteAccount(accountId: number | bigint) {
  try {
    await db.delete(accounts).where(eq(accounts.accountId, BigInt(accountId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

// List all accounts (with pagination)
export async function listAccounts(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allAccounts = await db.select().from(accounts).limit(limit).offset(offset);
    return allAccounts;
  } catch (error) {
    console.error("Error listing accounts:", error);
    throw error;
  }
}

// Get account by email
export async function getAccountByEmail(email: string) {
  try {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email));
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