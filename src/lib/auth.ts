import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "~/server/db";
import { users, sessions, authAccounts, verificationTokens, roles, userRoles } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { ROLE_PERMISSIONS } from "~/lib/permissions";
import type { Permission } from "~/lib/permissions";

/**
 * Get user roles from database
 */
export async function getUserRolesFromDB(userId: string, _accountId: number): Promise<string[]> {
  try {
    const userRolesList = await db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.roleId, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true),
        ),
      );

    return userRolesList.map((role) => role.roleName);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
}

/**
 * Get permissions for given roles
 */
export function getPermissionsForRoles(roleNames: string[]): Permission[] {
  const permissionsSet = new Set<Permission>();
  
  roleNames.forEach((roleName) => {
    const rolePermissions = ROLE_PERMISSIONS[roleName] ?? [];
    rolePermissions.forEach((permission) => {
      permissionsSet.add(permission);
    });
  });

  return Array.from(permissionsSet);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // SingleStore is MySQL compatible
    schema: {
      user: users,
      session: sessions,
      account: authAccounts,
      verification: verificationTokens,
    },
  }),

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start with false for development
    autoSignIn: true,
  },

  // Social Providers Configuration (only enable if credentials are provided)
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          accessType: "offline",
          prompt: "select_account",
        },
      }),
    ...(process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_CLIENT_SECRET && {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        },
      }),
    ...(process.env.LINKEDIN_CLIENT_ID &&
      process.env.LINKEDIN_CLIENT_SECRET && {
        linkedin: {
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      }),
  },

  // User schema - now matches Better-Auth expectations exactly
  user: {
    additionalFields: {
      firstName: {
        type: "string", 
        required: true,
        input: true,
      },
      lastName: {
        type: "string", 
        required: true,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      timezone: {
        type: "string", 
        required: false,
        defaultValue: "UTC",
        input: true,
      },
      language: {
        type: "string",
        required: false, 
        defaultValue: "en",
        input: true,
      },
      isVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      lastLogin: {
        type: "date",
        required: false,
        input: false,
      },
      preferences: {
        type: "string", // JSON stored as string
        required: false,
        input: false,
      },
      accountId: {
        type: "number",
        required: false,
        input: true,
      },
    },
  },

  // Next.js integration
  plugins: [nextCookies()],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },


  // Built-in rate limiting
  rateLimit: {
    window: 60, // 1 minute window
    max: 5, // max 5 attempts
  },
});

/**
 * Get session with enriched user data (roles and permissions)
 */
export async function getEnrichedSession() {
  const session = await auth.api.getSession({
    headers: new Headers()
  });
  
  if (!session?.user?.accountId) {
    return session;
  }
  
  // Add roles and permissions to session data
  const userRoles = await getUserRolesFromDB(session.user.id, Number(session.user.accountId));
  const permissions = getPermissionsForRoles(userRoles);
  
  return {
    ...session,
    user: {
      ...session.user,
      roles: userRoles,
      permissions: permissions,
    }
  };
}
