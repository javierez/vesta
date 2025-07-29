import { headers } from "next/headers";
import { cache } from "react";
import { db } from "~/server/db";
import { userRoles } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Server-side utility to get user context from middleware headers
 * and fetch user roles from database (cached per request)
 */
export const getServerUser = cache(async () => {
  const headersList = await headers();
  
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");
  const userAccountId = headersList.get("x-user-account-id");
  const userName = headersList.get("x-user-name");
  
  if (!userId) {
    return null;
  }

  // Fetch user roles using the user ID from headers
  let roleIds: number[] = [];
  try {
    const userRolesList = await db
      .select({
        roleId: userRoles.roleId,
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true)
      ));
    
    roleIds = userRolesList.map(role => Number(role.roleId));
    console.log(`👤 User ${userEmail} has roles: [${roleIds.join(', ')}] (${roleIds.length === 0 ? 'cached' : 'fresh query'})`);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    // Continue without roles rather than failing
  }
  
  return {
    id: userId,
    email: userEmail,
    accountId: userAccountId ? BigInt(userAccountId) : null,
    name: userName,
    roles: roleIds,
    hasRole: (roleId: number) => roleIds.includes(roleId),
    isSuperAdmin: () => roleIds.includes(2), // Assuming role_id 2 is superadmin
  };
});

/**
 * Cached function to get user roles by user ID
 * Useful for admin features where you need to check other users' roles
 */
export const getUserRoles = cache(async (userId: string) => {
  try {
    const userRolesList = await db
      .select({
        roleId: userRoles.roleId,
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true)
      ));
    
    const roleIds = userRolesList.map(role => Number(role.roleId));
    console.log(`🔍 Looked up roles for user ${userId}: [${roleIds.join(', ')}]`);
    
    return {
      roles: roleIds,
      hasRole: (roleId: number) => roleIds.includes(roleId),
      isSuperAdmin: () => roleIds.includes(2),
    };
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return {
      roles: [],
      hasRole: () => false,
      isSuperAdmin: () => false,
    };
  }
});

/**
 * Type definition for server user context
 */
export type ServerUser = Awaited<ReturnType<typeof getServerUser>>;