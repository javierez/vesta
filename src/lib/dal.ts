import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { and, eq, type SQL, type SQLWrapper, type Column } from "drizzle-orm";

/**
 * Data Access Layer (DAL) - Provides account-level security for all database operations
 *
 * Authentication Architecture:
 * 1. Users authenticate (they have passwords, not accounts)
 * 2. Users belong to accounts (organizations/companies)
 * 3. Accounts have configurations and settings
 * 4. All data is filtered by the user's accountId
 *
 * This wrapper ensures that:
 * 1. All queries are automatically filtered by the authenticated user's accountId
 * 2. Users can only access data belonging to their account/organization
 * 3. Multi-tenant security is enforced at the application level
 */

export interface SecureSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountId: number; // The account/organization this user belongs to
    phone?: string;
    timezone?: string;
    language?: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Get current authenticated user session with account context
 *
 * Flow: User authenticates -> Session contains user info -> User belongs to account
 * This function verifies the user session and extracts their account context
 */
export async function getSecureSession(): Promise<SecureSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Critical: User must belong to an account (organization)
    if (!session.user.accountId) {
      console.error("Authenticated user missing accountId:", {
        userId: session.user.id,
        email: session.user.email,
      });
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.name ?? "", // BetterAuth uses 'name' field
        lastName: session.user.lastName ?? "",
        accountId: session.user.accountId, // The user's organization/company
        phone: session.user.phone ?? undefined,
        timezone: session.user.timezone ?? undefined,
        language: session.user.language ?? undefined,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch (error) {
    console.error("Failed to get secure session:", error);
    return null;
  }
}

/**
 * Get the account ID of the currently authenticated user
 *
 * Flow: Authenticated User -> User's Account ID -> Used for data filtering
 * Throws error if no valid session exists
 */
export async function getCurrentUserAccountId(): Promise<number> {
  const session = await getSecureSession();

  if (!session) {
    throw new Error("No authenticated user session found");
  }

  return session.user.accountId;
}

/**
 * Get current authenticated user information
 * Throws error if no valid session exists
 */
export async function getCurrentUser() {
  const session = await getSecureSession();

  if (!session) {
    throw new Error("No authenticated user session found");
  }

  return session.user;
}

/**
 * Secure database instance that automatically filters by the authenticated user's account
 *
 * Architecture: User authenticates -> Get user's accountId -> Filter all queries by that accountId
 * This should be used instead of the raw `db` instance for all user-facing queries
 */
export async function getSecureDb() {
  const accountId = await getCurrentUserAccountId();

  return {
    db,
    accountId, // The authenticated user's account/organization ID
    // Helper to add account filtering to any where condition
    withAccountFilter: (table: { accountId: Column }, additionalWhere?: SQL | SQLWrapper) => {
      const accountFilter = eq(table.accountId, accountId);
      return additionalWhere
        ? and(accountFilter, additionalWhere)
        : accountFilter;
    },
  };
}

/**
 * Verify that a resource belongs to the current user's account/organization
 * Used for authorization checks before mutations
 */
export async function verifyAccountAccess(
  resourceAccountId: number,
): Promise<boolean> {
  try {
    const currentAccountId = await getCurrentUserAccountId();
    return currentAccountId === resourceAccountId;
  } catch {
    return false;
  }
}

/**
 * Error classes for DAL operations
 */
export class UnauthorizedError extends Error {
  constructor(message = "Access denied: insufficient permissions") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class AccountMismatchError extends Error {
  constructor(
    message = "Access denied: resource belongs to different account",
  ) {
    super(message);
    this.name = "AccountMismatchError";
  }
}
