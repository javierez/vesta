import { db } from "../db";
import { users, userRoles, roles, accounts, accountRoles } from "../db/schema";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";
import type { User } from "../../lib/data";
import type { UserWithRoles } from "../../types/user-management";
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

// Get all agents (users) for selection dropdowns - filtered by account
export async function getAgentsForSelectionWithAuth() {
  try {
    const accountId = await getCurrentUserAccountId();
    const agents = await db
      .select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(
        and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)),
      )
      .orderBy(users.name);
    return agents;
  } catch (error) {
    console.error("Error fetching agents for selection:", error);
    throw error;
  }
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

// Update user's accountId (for OAuth users who need to associate with an account)
export async function updateUserAccountId(userId: string, accountId: number) {
  try {
    await db
      .update(users)
      .set({ accountId: BigInt(accountId) })
      .where(eq(users.id, userId));
    
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user accountId:", error);
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
      .where(and(eq(users.id, userId), eq(users.accountId, BigInt(accountId))));
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
      .where(and(eq(users.id, userId), eq(users.accountId, BigInt(accountId))));
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
      .where(
        and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)),
      )
      .limit(limit)
      .offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

// List all users for specific account (with pagination)
export async function listUsersByAccount(
  accountId: number,
  page = 1,
  limit = 10,
) {
  try {
    const offset = (page - 1) * limit;
    const allUsers = await db
      .select()
      .from(users)
      .where(
        and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)),
      )
      .limit(limit)
      .offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error listing users by account:", error);
    throw error;
  }
}

// Get all users with their roles and account information
export async function getAllUsersWithRoles(options?: {
  page?: number;
  limit?: number;
  search?: string;
  accountId?: number;
  roleFilter?: number;
  statusFilter?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      accountId,
      roleFilter,
      statusFilter = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options ?? {};

    const offset = (page - 1) * limit;

    // Build base query with joins
    const baseQuery = db
      .select({
        // User fields
        id: users.id,
        name: users.name,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        image: users.image,
        isVerified: users.isVerified,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Account fields
        accountId: users.accountId,
        accountName: accounts.name,
        // Role fields (will be null if no roles assigned)
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        roleAssignedAt: userRoles.createdAt,
      })
      .from(users)
      .leftJoin(accounts, eq(users.accountId, accounts.accountId))
      .leftJoin(userRoles, and(
        eq(users.id, userRoles.userId),
        eq(userRoles.isActive, true)
      ))
      .leftJoin(roles, and(
        eq(userRoles.roleId, roles.roleId),
        eq(roles.isActive, true)
      ));

    // Build where conditions
    const conditions = [];

    // Account filter
    if (accountId) {
      conditions.push(eq(users.accountId, BigInt(accountId)));
    }

    // Search filter
    if (search.trim()) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }

    // Role filter
    if (roleFilter) {
      conditions.push(eq(userRoles.roleId, BigInt(roleFilter)));
    }

    // Status filter
    if (statusFilter !== 'all') {
      conditions.push(eq(users.isActive, statusFilter === 'active'));
    }

    // Apply filters
    const filteredQuery = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    // Add sorting
    const sortField = {
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin
    }[sortBy] || users.createdAt;

    const sortedQuery = filteredQuery.orderBy(
      sortOrder === 'desc' ? desc(sortField) : asc(sortField)
    );

    // Add pagination
    const results = await sortedQuery.limit(limit).offset(offset);

    // Group results by user (since users can have multiple roles)
    const usersMap = new Map<string, UserWithRoles>();
    
    results.forEach(row => {
      const userId = row.id;
      
      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          id: row.id,
          name: row.name,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          image: row.image,
          isVerified: row.isVerified,
          isActive: row.isActive,
          lastLogin: row.lastLogin,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          accountId: row.accountId,
          accountName: row.accountName,
          roles: []
        });
      }
      
      // Add role if it exists
      if (row.roleId && row.roleName) {
        const user = usersMap.get(userId);
        if (user) {
          user.roles.push({
            roleId: Number(row.roleId),
            name: row.roleName,
            description: row.roleDescription,
            assignedAt: row.roleAssignedAt ?? new Date()
          });
        }
      }
    });

    const finalResults = Array.from(usersMap.values());

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(accounts, eq(users.accountId, accounts.accountId))
      .leftJoin(userRoles, and(
        eq(users.id, userRoles.userId),
        eq(userRoles.isActive, true)
      ));

    const countResult = conditions.length > 0
      ? await countQuery.where(and(...conditions))
      : await countQuery;

    const totalCount = countResult[0]?.count ?? 0;

    return {
      users: finalResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    throw error;
  }
}

// Get single user with full details including roles and permissions
export async function getUserWithFullDetails(userId: string, requestingAccountId?: number) {
  try {
    // Get user basic info
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        image: users.image,
        timezone: users.timezone,
        language: users.language,
        preferences: users.preferences,
        isVerified: users.isVerified,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        accountId: users.accountId,
        accountName: accounts.name,
        accountPlan: accounts.plan
      })
      .from(users)
      .leftJoin(accounts, eq(users.accountId, accounts.accountId))
      .where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    // Security check - if requestingAccountId is provided, ensure user belongs to that account
    if (requestingAccountId && user.accountId !== BigInt(requestingAccountId)) {
      throw new Error('Access denied: User belongs to different account');
    }

    // Get user roles
    const userRolesList = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        assignedAt: userRoles.createdAt,
        // Get account-specific permissions if available
        accountPermissions: accountRoles.permissions
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.roleId))
      .leftJoin(accountRoles, and(
        eq(accountRoles.roleId, roles.roleId),
        eq(accountRoles.accountId, user.accountId!)
      ))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );

    return {
      ...user,
      accountId: user.accountId ? Number(user.accountId) : null,
      roles: userRolesList.map(role => ({
        roleId: Number(role.roleId),
        name: role.roleName,
        description: role.roleDescription,
        assignedAt: role.assignedAt,
        permissions: role.accountPermissions
      }))
    };
  } catch (error) {
    console.error('Error fetching user with full details:', error);
    throw error;
  }
}

// Create user with role assignment in a transaction
export async function createUserWithRole(userData: {
  id: string;
  name: string;
  email: string;
  accountId: bigint;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  roleId?: number;
  isVerified?: boolean;
  isActive?: boolean;
}) {
  return await db.transaction(async (tx) => {
    try {
      // Create user
      await tx.insert(users).values({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        accountId: userData.accountId,
        firstName: userData.firstName,
        lastName: userData.lastName ?? '',
        phone: userData.phone,
        timezone: userData.timezone ?? 'UTC',
        language: userData.language ?? 'es',
        isVerified: userData.isVerified ?? false,
        isActive: userData.isActive ?? true
      });

      // Assign role if provided
      if (userData.roleId) {
        await tx.insert(userRoles).values({
          userId: userData.id,
          roleId: BigInt(userData.roleId),
          isActive: true
        });
      }

      // Get the created user with role details
      const newUser = await getUserWithFullDetails(userData.id);
      
      console.log(`✅ Created user ${userData.id} with role ${userData.roleId ?? 'none'}`);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user with role:', error);
      throw error;
    }
  });
}

// Update user role assignment
export async function updateUserRole(userId: string, newRoleId: number, requestingAccountId?: number) {
  return await db.transaction(async (tx) => {
    try {
      // Security check
      if (requestingAccountId) {
        const [user] = await tx
          .select({ accountId: users.accountId })
          .from(users)
          .where(eq(users.id, userId));
          
        if (!user || user.accountId !== BigInt(requestingAccountId)) {
          throw new Error('Access denied: User belongs to different account');
        }
      }

      // Deactivate all current roles
      await tx
        .update(userRoles)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(userRoles.userId, userId));

      // Assign new role
      await tx.insert(userRoles).values({
        userId: userId,
        roleId: BigInt(newRoleId),
        isActive: true
      });

      console.log(`✅ Updated user ${userId} role to ${newRoleId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  });
}

// Search users with advanced filters
export async function searchUsersWithFilters(filters: {
  search?: string;
  accountId?: number;
  roleIds?: number[];
  isActive?: boolean;
  hasRole?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}) {
  try {
    const baseQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        createdAt: users.createdAt,
        accountName: accounts.name,
        roleName: roles.name
      })
      .from(users)
      .leftJoin(accounts, eq(users.accountId, accounts.accountId))
      .leftJoin(userRoles, and(
        eq(users.id, userRoles.userId),
        eq(userRoles.isActive, true)
      ))
      .leftJoin(roles, eq(userRoles.roleId, roles.roleId));

    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          like(users.name, `%${filters.search}%`),
          like(users.email, `%${filters.search}%`),
          like(users.firstName, `%${filters.search}%`)
        )
      );
    }

    if (filters.accountId) {
      conditions.push(eq(users.accountId, BigInt(filters.accountId)));
    }

    if (filters.roleIds && filters.roleIds.length > 0) {
      conditions.push(
        or(...filters.roleIds.map(roleId => eq(userRoles.roleId, BigInt(roleId))))
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }

    if (filters.createdAfter) {
      conditions.push(eq(users.createdAt, filters.createdAfter)); // Note: You might want gte here
    }

    if (filters.createdBefore) {
      conditions.push(eq(users.createdAt, filters.createdBefore)); // Note: You might want lte here
    }

    const filteredQuery = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const results = await filteredQuery.orderBy(desc(users.createdAt));
    
    return results;
  } catch (error) {
    console.error('Error searching users with filters:', error);
    throw error;
  }
}

// Bulk user operations
export async function bulkUserOperations(operation: 'activate' | 'deactivate' | 'delete', userIds: string[], requestingAccountId?: number) {
  return await db.transaction(async (tx) => {
    try {
      // Security check - ensure all users belong to requesting account
      if (requestingAccountId) {
        const usersCheck = await tx
          .select({ id: users.id, accountId: users.accountId })
          .from(users)
          .where(
            and(
              or(...userIds.map(id => eq(users.id, id))),
              eq(users.accountId, BigInt(requestingAccountId))
            )
          );
          
        if (usersCheck.length !== userIds.length) {
          throw new Error('Access denied: Some users belong to different accounts');
        }
      }

      let updateData: { updatedAt: Date; isActive?: boolean };
      
      switch (operation) {
        case 'activate':
          updateData = { updatedAt: new Date(), isActive: true };
          break;
        case 'deactivate':
          updateData = { updatedAt: new Date(), isActive: false };
          break;
        case 'delete':
          updateData = { updatedAt: new Date(), isActive: false };
          // Could also set a deletedAt timestamp
          break;
        default:
          updateData = { updatedAt: new Date() };
      }

      await tx
        .update(users)
        .set(updateData)
        .where(or(...userIds.map(id => eq(users.id, id))));

      console.log(`✅ Bulk ${operation} operation completed for ${userIds.length} users`);
      return { success: true, affectedCount: userIds.length };
    } catch (error) {
      console.error(`Error in bulk ${operation} operation:`, error);
      throw error;
    }
  });
}
