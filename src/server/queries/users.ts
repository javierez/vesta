import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
export async function getUserByIdWithAuth(userId: string) {
  const accountId = await getCurrentUserAccountId();
  return getUserByIdAndAccount(userId, accountId);
}

export async function updateUserWithAuth(
  userId: string,
  data: Omit<Partial<User>, "id">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateUserByAccount(userId, accountId, data);
}

export async function deleteUserWithAuth(userId: string) {
  const accountId = await getCurrentUserAccountId();
  return deleteUserByAccount(userId, accountId);
}

export async function listUsersWithAuth(page = 1, limit = 10) {
  const accountId = await getCurrentUserAccountId();
  return listUsersByAccount(accountId, page, limit);
}

// Create a new user
export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  accountId: bigint;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  isVerified?: boolean;
  isActive?: boolean;
}) {
  try {
    await db.insert(users).values(data);
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.id));
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Get user by ID (without account filtering - for system use)
export async function getUserById(userId: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Get user by ID and account (secure version)
export async function getUserByIdAndAccount(userId: string, accountId: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.accountId, BigInt(accountId)),
          eq(users.isActive, true),
        ),
      );
    return user;
  } catch (error) {
    console.error("Error fetching user by ID and account:", error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

// Update user (without account filtering - for system use)
export async function updateUser(
  userId: string,
  data: Omit<Partial<User>, "id">,
) {
  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Update user by account (secure version)
export async function updateUserByAccount(
  userId: string,
  accountId: number,
  data: Omit<Partial<User>, "id">,
) {
  try {
    await db
      .update(users)
      .set(data)
      .where(
        and(
          eq(users.id, userId),
          eq(users.accountId, BigInt(accountId)),
          eq(users.isActive, true),
        ),
      );
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.accountId, BigInt(accountId)),
        ),
      );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user by account:", error);
    throw error;
  }
}

// Delete user (without account filtering - for system use)
export async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Delete user by account (secure version)
export async function deleteUserByAccount(userId: string, accountId: number) {
  try {
    await db
      .delete(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.accountId, BigInt(accountId)),
        ),
      );
    return { success: true };
  } catch (error) {
    console.error("Error deleting user by account:", error);
    throw error;
  }
}

// List all users (with pagination) - filtered by account
export async function listUsers(page = 1, limit = 10) {
  try {
    const accountId = await getCurrentUserAccountId();
    const offset = (page - 1) * limit;
    const allUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)))
      .limit(limit)
      .offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

// List all users for specific account (with pagination)
export async function listUsersByAccount(accountId: number, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)))
      .limit(limit)
      .offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error listing users by account:", error);
    throw error;
  }
}
