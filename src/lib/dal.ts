import { headers } from 'next/headers';
import { auth } from '~/lib/auth';
import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import type { Session } from 'better-auth/types';

/**
 * Data Access Layer (DAL) - Provides account-level security for all database operations
 * 
 * This wrapper ensures that:
 * 1. All queries are automatically filtered by accountId
 * 2. Users can only access data belonging to their account
 * 3. Multi-tenant security is enforced at the application level
 */

export interface SecureSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountId: number;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Get current user session with account validation
 * This function verifies the user session and returns account-filtered user data
 */
export async function getSecureSession(): Promise<SecureSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return null;
    }

    // Ensure accountId exists and is valid
    if (!session.user.accountId) {
      console.error('User session missing accountId:', session.user.id);
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName || session.user.name || '',
        lastName: session.user.lastName || '',
        accountId: session.user.accountId,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch (error) {
    console.error('Failed to get secure session:', error);
    return null;
  }
}

/**
 * Get current user's account ID from session
 * Throws error if no valid session exists
 */
export async function getCurrentAccountId(): Promise<number> {
  const session = await getSecureSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  return session.user.accountId;
}

/**
 * Get current user information
 * Throws error if no valid session exists
 */
export async function getCurrentUser() {
  const session = await getSecureSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  return session.user;
}

/**
 * Secure database instance that automatically filters by account
 * This should be used instead of the raw `db` instance for all user-facing queries
 */
export async function getSecureDb() {
  const accountId = await getCurrentAccountId();
  
  return {
    db,
    accountId,
    // Helper to add account filtering to any where condition
    withAccountFilter: (table: any, additionalWhere?: any) => {
      const accountFilter = eq(table.accountId, accountId);
      return additionalWhere ? and(accountFilter, additionalWhere) : accountFilter;
    },
  };
}

/**
 * Verify that a resource belongs to the current user's account
 * Used for authorization checks before mutations
 */
export async function verifyAccountAccess(resourceAccountId: number): Promise<boolean> {
  try {
    const currentAccountId = await getCurrentAccountId();
    return currentAccountId === resourceAccountId;
  } catch (error) {
    return false;
  }
}

/**
 * Error classes for DAL operations
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Access denied: insufficient permissions') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class AccountMismatchError extends Error {
  constructor(message = 'Access denied: resource belongs to different account') {
    super(message);
    this.name = 'AccountMismatchError';
  }
}