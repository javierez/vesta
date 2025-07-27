import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../../lib/data";

// Create a new user
export async function createUser(
  data: Omit<User, "userId" | "createdAt" | "updatedAt">,
) {
  try {
    const [result] = await db.insert(users).values(data).$returningId();
    if (!result) throw new Error("Failed to create user");
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.userId, BigInt(result.userId)));
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, BigInt(userId)));
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
  userId: number,
  data: Omit<Partial<User>, "userId">,
) {
  try {
    await db
      .update(users)
      .set(data)
      .where(eq(users.userId, BigInt(userId)));
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.userId, BigInt(userId)));
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: number) {
  try {
    await db.delete(users).where(eq(users.userId, BigInt(userId)));
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
