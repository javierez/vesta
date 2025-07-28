import { getSecureDb, getCurrentUser } from "~/lib/dal";
import { users, roles, userRoles } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Permission System for Role-Based Access Control (RBAC)
 * 
 * This system provides:
 * 1. User role checking
 * 2. Permission validation
 * 3. Account-level security enforcement
 */

// Standard permissions for the CRM system
export const PERMISSIONS = {
  // Property management
  PROPERTY_VIEW: 'property:view',
  PROPERTY_CREATE: 'property:create',
  PROPERTY_EDIT: 'property:edit',
  PROPERTY_DELETE: 'property:delete',
  
  // Listing management
  LISTING_VIEW: 'listing:view',
  LISTING_CREATE: 'listing:create',
  LISTING_EDIT: 'listing:edit',
  LISTING_DELETE: 'listing:delete',
  LISTING_PUBLISH: 'listing:publish',
  
  // Contact management
  CONTACT_VIEW: 'contact:view',
  CONTACT_CREATE: 'contact:create',
  CONTACT_EDIT: 'contact:edit',
  CONTACT_DELETE: 'contact:delete',
  
  // Lead management
  LEAD_VIEW: 'lead:view',
  LEAD_CREATE: 'lead:create',
  LEAD_EDIT: 'lead:edit',
  LEAD_DELETE: 'lead:delete',
  LEAD_ASSIGN: 'lead:assign',
  
  // Deal management
  DEAL_VIEW: 'deal:view',
  DEAL_CREATE: 'deal:create',
  DEAL_EDIT: 'deal:edit',
  DEAL_DELETE: 'deal:delete',
  
  // User management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Settings and configuration
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_INTEGRATION: 'settings:integration',
  
  // Reports and analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // System administration
  ADMIN_FULL_ACCESS: 'admin:full_access',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Standard roles with their permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'admin': [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.PROPERTY_DELETE,
    PERMISSIONS.LISTING_VIEW,
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT,
    PERMISSIONS.LISTING_DELETE,
    PERMISSIONS.LISTING_PUBLISH,
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    PERMISSIONS.CONTACT_DELETE,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.LEAD_DELETE,
    PERMISSIONS.LEAD_ASSIGN,
    PERMISSIONS.DEAL_VIEW,
    PERMISSIONS.DEAL_CREATE,
    PERMISSIONS.DEAL_EDIT,
    PERMISSIONS.DEAL_DELETE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_INTEGRATION,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ADMIN_FULL_ACCESS,
  ],
  'agent': [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.LISTING_VIEW,
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT,
    PERMISSIONS.LISTING_PUBLISH,
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.DEAL_VIEW,
    PERMISSIONS.DEAL_CREATE,
    PERMISSIONS.DEAL_EDIT,
    PERMISSIONS.REPORTS_VIEW,
  ],
  'viewer': [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.LISTING_VIEW,
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.DEAL_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

/**
 * Get all roles for the current user
 */
export async function getCurrentUserRoles(): Promise<string[]> {
  try {
    const { db, accountId } = await getSecureDb();
    const currentUser = await getCurrentUser();

    const userRolesList = await db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.roleId, userRoles.roleId))
      .innerJoin(users, eq(users.userId, userRoles.userId))
      .where(
        and(
          eq(userRoles.userId, BigInt(currentUser.id)),
          eq(users.accountId, BigInt(accountId)),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true),
        )
      );

    return userRolesList.map(role => role.roleName);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Get all permissions for the current user based on their roles
 */
export async function getCurrentUserPermissions(): Promise<Permission[]> {
  try {
    const roles = await getCurrentUserRoles();
    const permissionsSet = new Set<Permission>();

    // Aggregate permissions from all roles
    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => {
        permissionsSet.add(permission);
      });
    });

    return Array.from(permissionsSet);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const userPermissions = await getCurrentUserPermissions();
    return userPermissions.includes(permission) || userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if the current user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  try {
    const userPermissions = await getCurrentUserPermissions();
    const hasAdminAccess = userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS);
    
    if (hasAdminAccess) return true;
    
    return permissions.some(permission => userPermissions.includes(permission));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Check if the current user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  try {
    const userPermissions = await getCurrentUserPermissions();
    const hasAdminAccess = userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS);
    
    if (hasAdminAccess) return true;
    
    return permissions.every(permission => userPermissions.includes(permission));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(roleName: string): Promise<boolean> {
  try {
    const roles = await getCurrentUserRoles();
    return roles.includes(roleName);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Require a specific permission (throws error if not authorized)
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const authorized = await hasPermission(permission);
  if (!authorized) {
    throw new Error(`Access denied: ${permission} permission required`);
  }
}

/**
 * Require admin access (throws error if not admin)
 */
export async function requireAdmin(): Promise<void> {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error('Access denied: admin privileges required');
  }
}