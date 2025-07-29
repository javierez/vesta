import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../../lib/data";

// Create a new user
export async function createUser(
  data: { 
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
  },
) {
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

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
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

// Update user
export async function updateUser(
  userId: string,
  data: Omit<Partial<User>, "id">,
) {
  try {
    await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId));
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

// Delete user
export async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// List all users (with pagination)
export async function listUsers(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allUsers = await db.select().from(users).limit(limit).offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}
