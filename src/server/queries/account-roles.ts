"use server";

import { db } from "../db";
import { accountRoles, userRoles, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { AccountRolePermissions } from "~/types/account-roles";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper function that automatically gets accountId from current session
export async function getAccountRolesWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getAccountRoles(BigInt(accountId));
}

// Wrapper function for updating role permissions with auth
export async function updateAccountRolePermissionsWithAuth(
  roleId: number,
  permissions: AccountRolePermissions
) {
  const accountId = await getCurrentUserAccountId();
  return updateAccountRolePermissions(BigInt(accountId), BigInt(roleId), permissions);
}

// Wrapper function for ensuring account roles with auth
export async function ensureAccountRolesWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return ensureAccountRoles(BigInt(accountId));
}

// Get all roles for an account
export async function getAccountRoles(accountId: bigint) {
  try {
    const roles = await db
      .select()
      .from(accountRoles)
      .where(
        and(
          eq(accountRoles.accountId, accountId),
          eq(accountRoles.isActive, true)
        )
      );

    return roles.map(role => ({
      ...role,
      roleId: Number(role.roleId),
      accountId: Number(role.accountId),
      accountRoleId: Number(role.accountRoleId),
      permissions: role.permissions as AccountRolePermissions,
      isSystem: role.isSystem ?? false,
      isActive: role.isActive ?? true,
    }));
  } catch (error) {
    console.error("Error fetching account roles:", error);
    throw error;
  }
}

// Get a specific role for an account
export async function getAccountRole(accountId: bigint, roleId: bigint) {
  try {
    const [role] = await db
      .select()
      .from(accountRoles)
      .where(
        and(
          eq(accountRoles.accountId, accountId),
          eq(accountRoles.roleId, roleId),
          eq(accountRoles.isActive, true)
        )
      );

    if (!role) return null;

    return {
      ...role,
      roleId: Number(role.roleId),
      accountId: Number(role.accountId),
      accountRoleId: Number(role.accountRoleId),
      permissions: role.permissions as AccountRolePermissions,
      isSystem: role.isSystem ?? false,
      isActive: role.isActive ?? true,
    };
  } catch (error) {
    console.error("Error fetching account role:", error);
    throw error;
  }
}

// Update role permissions for an account
export async function updateAccountRolePermissions(
  accountId: bigint,
  roleId: bigint,
  permissions: AccountRolePermissions
) {
  try {
    await db
      .update(accountRoles)
      .set({
        permissions: permissions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(accountRoles.accountId, accountId),
          eq(accountRoles.roleId, roleId)
        )
      );

    console.log(`✅ Updated permissions for role ${roleId} in account ${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to update role permissions:", error);
    throw error;
  }
}

// Initialize default roles for a new account (only Agent and Account Admin)
export async function initializeAccountRoles(accountId: bigint) {
  try {
    const defaultRoles = [
      {
        roleId: BigInt(1), // Agente
        accountId: accountId,
        permissions: {
          tasks: { viewOwn: true, viewAll: false, create: true, edit: true, delete: false },
          properties: { viewOwn: true, viewAll: false, create: true, edit: true, delete: false, publish: false },
          contacts: { viewOwn: true, viewAll: false, create: true, edit: true, delete: false },
          calendar: { viewOwn: true, viewAll: false, create: true, edit: true, delete: true },
          tools: { imageStudio: false, aiTools: true, export: false },
          admin: { manageUsers: false, manageRoles: false, viewReports: false, manageAccount: false, manageBilling: false },
        },
        isSystem: true,
      },
      {
        roleId: BigInt(3), // Admin de Cuenta
        accountId: accountId,
        permissions: {
          tasks: { viewOwn: true, viewAll: true, create: true, edit: true, delete: true },
          properties: { viewOwn: true, viewAll: true, create: true, edit: true, delete: true, publish: true },
          contacts: { viewOwn: true, viewAll: true, create: true, edit: true, delete: true },
          calendar: { viewOwn: true, viewAll: true, create: true, edit: true, delete: true },
          tools: { imageStudio: true, aiTools: true, export: true },
          admin: { manageUsers: true, manageRoles: true, viewReports: true, manageAccount: true, manageBilling: true },
        },
        isSystem: true,
      },
    ];

    await db.insert(accountRoles).values(defaultRoles);
    console.log(`✅ Initialized default roles for account ${accountId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to initialize account roles:", error);
    throw error;
  }
}

// Ensure account has role configurations (creates them if they don't exist)
export async function ensureAccountRoles(accountId: bigint) {
  try {
    // Check if account already has roles configured
    const existingRoles = await db
      .select()
      .from(accountRoles)
      .where(eq(accountRoles.accountId, accountId));

    if (existingRoles.length > 0) {
      console.log(`Account ${accountId} already has ${existingRoles.length} roles configured`);
      return { success: true, created: false };
    }

    // Initialize roles if they don't exist
    await initializeAccountRoles(accountId);
    return { success: true, created: true };
  } catch (error) {
    console.error("❌ Failed to ensure account roles:", error);
    throw error;
  }
}

// Get user permissions based on their role in an account
export async function getUserPermissions(userId: string, accountId: bigint) {
  try {
    // First get the user's role
    const [userRole] = await db
      .select({
        roleId: userRoles.roleId,
      })
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true)
        )
      );

    if (!userRole) {
      return null;
    }

    // Then get the permissions for that role in this account
    const [rolePermissions] = await db
      .select({
        permissions: accountRoles.permissions,
      })
      .from(accountRoles)
      .where(
        and(
          eq(accountRoles.accountId, accountId),
          eq(accountRoles.roleId, userRole.roleId),
          eq(accountRoles.isActive, true)
        )
      );

    return rolePermissions?.permissions || null;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  }
}

// Check if a user has a specific permission
export async function userHasPermission(
  userId: string, 
  accountId: bigint, 
  category: string, 
  permission: string
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId, accountId);
    
    if (!permissions || typeof permissions !== 'object') {
      return false;
    }

    const categoryPermissions = (permissions as any)[category];
    if (!categoryPermissions || typeof categoryPermissions !== 'object') {
      return false;
    }

    return categoryPermissions[permission] === true;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
}