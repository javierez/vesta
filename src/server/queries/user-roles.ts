import { db } from "../db";
import { userRoles, roles, users } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Assign a role to a user
export async function assignUserRole(userId: string, roleId: number) {
  try {
    await db.insert(userRoles).values({
      userId: userId,
      roleId: BigInt(roleId),
      isActive: true,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to assign user role:", error);
    throw error;
  }
}

// Get all roles for a user
export async function getUserRoles(userId: string) {
  try {
    const userRolesList = await db
      .select({
        userRoleId: userRoles.userRoleId,
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        permissions: roles.permissions,
        isActive: userRoles.isActive,
        createdAt: userRoles.createdAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.roleId))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true),
        ),
      );

    return userRolesList;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
}

// Check if user has a specific role
export async function userHasRole(
  userId: string,
  roleId: number,
): Promise<boolean> {
  try {
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, BigInt(roleId)),
          eq(userRoles.isActive, true),
        ),
      );

    return !!userRole;
  } catch (error) {
    console.error("Error checking user role:", error);
    throw error;
  }
}

// Remove a role from a user (soft delete)
export async function removeUserRole(userId: string, roleId: number) {
  try {
    await db
      .update(userRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(eq(userRoles.userId, userId), eq(userRoles.roleId, BigInt(roleId))),
      );

    console.log(`✅ Removed role ${roleId} from user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to remove user role:", error);
    throw error;
  }
}

// Get all users with a specific role
export async function getUsersWithRole(roleId: number) {
  try {
    const usersWithRole = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        assignedAt: userRoles.createdAt,
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .where(
        and(
          eq(userRoles.roleId, BigInt(roleId)),
          eq(userRoles.isActive, true),
          eq(users.isActive, true),
        ),
      );

    return usersWithRole;
  } catch (error) {
    console.error("Error fetching users with role:", error);
    throw error;
  }
}
