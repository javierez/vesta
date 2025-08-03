"use server";

import { assignUserRole as assignUserRoleQuery } from "~/server/queries/user-roles";

export async function assignUserRole(userId: string, roleId = 1) {
  try {
    await assignUserRoleQuery(userId, roleId);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to assign user role:", error);
    return { success: false, error: "Failed to assign user role" };
  }
}
