# PRP: Comprehensive BetterAuth Authentication Implementation for Vesta CRM

## Overview

Implement comprehensive authentication using BetterAuth across the entire Vesta CRM codebase, including multi-tenant security, role-based access control, and data isolation to ensure users can only access their organization's data.

## Context and Background

### BetterAuth Core Philosophy

**Framework-Agnostic TypeScript Authentication:**
BetterAuth is designed as a "framework-agnostic authentication and authorization framework for TypeScript" that solves complex authentication needs comprehensively. Unlike other libraries requiring extensive additional code, BetterAuth provides comprehensive authentication capabilities out-of-the-box.

**Key Features Available:**
- Secure Email/Password Authentication with built-in validation
- Account and Session Management with automatic database handling
- Built-in Rate Limiting for security
- Social Sign-on Support (Google, Apple, LinkedIn, etc.)
- Organization & Access Control for multi-tenant applications
- Two-Factor Authentication capabilities
- Extensible Plugin Ecosystem
- Advanced enterprise features like SSO

### Current State Analysis

**Existing Infrastructure:**
- **Database**: SingleStore with Drizzle ORM (MySQL-compatible)
- **Users Table**: Complete user schema with `accountId` foreign key for multi-tenancy
- **Roles System**: `roles` and `userRoles` tables with JSON permissions
- **Multi-Tenant**: Account-based isolation via `accountId`
- **No Authentication**: Currently unprotected dashboard routes
- **BetterAuth Installed**: v1.3.4 already in package.json

**Provided Examples Analysis:**
```typescript
// /public/claude/examples/auth-client.ts - Client setup
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// /public/claude/examples/auth.ts - Server configuration with social providers
export const auth = betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
        google: { clientId: process.env.GOOGLE_CLIENT_ID! },
        // ... other providers
    },
});
```

**Critical Security Gap:**
```typescript
// Current unprotected query pattern
export async function listProperties() {
  return await db.select().from(properties); // NO user/account filtering
}
```

### Schema Analysis

**Existing Database Schema:**
```typescript
// Users table - ready for BetterAuth integration
export const users = singlestoreTable("users", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // Multi-tenant key
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  // Missing: password, emailVerified fields for BetterAuth
});

// Roles system ready for implementation
export const roles = singlestoreTable("roles", {
  roleId: bigint("role_id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  permissions: json("permissions").default({}), // Flexible permissions
});
```

## Implementation Blueprint

### Phase 1: Database Schema Enhancement with CLI

**1. BetterAuth CLI Schema Generation**

**Important: Use BetterAuth CLI for automated schema generation**

```bash
# Generate BetterAuth schema (detects Drizzle automatically)
npx @better-auth/cli@latest generate

# Optional: Specify custom config location
npx @better-auth/cli@latest generate --config ./src/lib/auth.ts

# For automated environments
npx @better-auth/cli@latest generate --yes

# Generate Drizzle migration files after BetterAuth schema
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

**CLI Process:**
- Automatically detects Drizzle ORM setup
- Generates `schema.ts` in project root (or custom `--output` location)
- Creates all required BetterAuth tables with proper relationships
- Supports existing schema integration

**2. Manual Schema Additions (if needed)**
```sql
-- Add required authentication fields to users table
ALTER TABLE users ADD COLUMN password VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;

-- BetterAuth CLI will generate these tables:
-- sessions, verification_tokens, accounts (for OAuth)
```

### Phase 2: Core Authentication Setup

**1. Database Adapter Configuration**

**Drizzle Adapter Specifications:**
- Supports MySQL, PostgreSQL, SQLite via `provider` option
- Schema mapping for custom table names if needed
- Automatic compatibility with existing Drizzle setup

**MySQL/SingleStore Compatibility:**
- SingleStore is MySQL-compatible, use `provider: "mysql"`
- Powered by Kysely database adapter for optimal performance
- Supports connection pooling (already configured in Vesta)

**2. Server-Side Auth Configuration**
```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // SingleStore is MySQL compatible
    // Optional: Map existing schema if table names differ
    schema: {
      user: "users", // Map to existing users table
      // Add other mappings if needed
    },
  }),
  
  // Email and Password Authentication (from basic usage docs)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Optional: Disable auto sign-in after registration
    autoSignIn: false,
  },
  
  // Social Providers Configuration (enhanced with Google docs)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Advanced Google configuration
      accessType: "offline", // Ensures refresh token
      prompt: "select_account", // Always prompt account selection
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },
  },
  
  // User schema mapping to existing structure
  user: {
    fields: {
      name: "first_name", // Map to existing schema
      email: "email",
    },
    additionalFields: {
      accountId: {
        type: "number",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
    },
  },
  
  // Next.js integration
  plugins: [nextCookies()],
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Built-in rate limiting (from introduction docs)
  rateLimit: {
    window: 60, // 1 minute window
    max: 5, // max 5 attempts
  },
});
```

**3. Client-Side Auth Setup**
```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export methods for use throughout app (from basic usage)
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
```

### Phase 3: Advanced Authentication Methods

**1. Email/Password Authentication Usage**
```typescript
// Sign up with email/password (enhanced from basic usage docs)
const signUpResult = await authClient.signUp.email({
  email: "user@example.com",
  password: "securePassword123",
  name: `${firstName} ${lastName}`,
  callbackURL: "/dashboard",
});

// Sign in with email/password
const signInResult = await authClient.signIn.email({
  email: "user@example.com", 
  password: "securePassword123",
  rememberMe: true, // Optional remember functionality
});
```

**2. Google Social Authentication (detailed from Google docs)**
```typescript
// Basic Google sign-in
const googleSignIn = await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});

// Advanced Google sign-in with additional scopes
const advancedGoogleSignIn = await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  // Additional scopes can be requested
  scope: "openid email profile",
});
```

**Google Setup Requirements:**
- **Redirect URLs Configuration**:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://yourdomain.com/api/auth/callback/google`
- **Google Cloud Console Project** with OAuth credentials
- **Environment Variables**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Phase 4: Route Protection & Middleware

**1. Authentication Middleware**
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";

const protectedRoutes = ["/dashboard", "/propiedades", "/contactos", "/calendario", "/ajustes"];
const authRoutes = ["/auth/signin", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;
  
  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Protect dashboard routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

**2. API Route Handler**
```typescript
// src/app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "~/lib/auth";

export const { POST, GET } = toNextJsHandler(auth);
```

### Phase 5: Data Access Layer (DAL) Security

**1. Session-Aware Query Wrapper**
```typescript
// src/lib/dal.ts
import 'server-only';
import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  // Get full user data with accountId for multi-tenant security
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.userId, parseInt(session.user.id)));
    
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

export async function validateAccountAccess(accountId: bigint) {
  const user = await getCurrentUser();
  if (user.accountId !== accountId) {
    throw new Error("Access denied to this account");
  }
  return user;
}
```

**2. Secure Query Patterns with Multi-Tenant Isolation**
```typescript
// src/server/queries/properties.ts - UPDATED with security
import { getCurrentUser } from "~/lib/dal";
import { db } from "../db";
import { properties } from "../db/schema";
import { eq, and } from "drizzle-orm";

export async function listProperties(page = 1, limit = 10) {
  const user = await getCurrentUser(); // Security checkpoint
  
  const offset = (page - 1) * limit;
  
  // SECURE: Filter by user's account (multi-tenant isolation)
  const allProperties = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.accountId, user.accountId), // Account isolation
        eq(properties.isActive, true)
      )
    )
    .limit(limit)
    .offset(offset);
    
  return allProperties;
}
```

### Phase 6: UI Components Implementation

**1. Authentication Pages Structure**
```
src/app/auth/
├── signin/
│   └── page.tsx (use provided sign-in.tsx)
├── signup/
│   └── page.tsx (use provided sign-up.tsx) 
└── layout.tsx (auth-specific layout)
```

**2. Enhanced Sign-In Implementation (from provided examples)**
```typescript
// src/app/auth/signin/page.tsx
"use client";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Email/Password sign-in
  const handleEmailSignIn = async () => {
    await signIn.email(
      { email, password, rememberMe },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => {
          // Redirect handled by middleware
        },
        onError: (error) => {
          console.error("Sign-in failed:", error);
        },
      }
    );
  };

  // Google social sign-in
  const handleGoogleSignIn = async () => {
    await signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard"
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
      }
    );
  };

  // Use provided UI components...
}
```

**3. Protected Layout Enhancement**
```typescript
// src/app/(dashboard)/layout.tsx - UPDATED
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { DashboardLayout } from "~/components/layout/dashboard-layout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}
```

**4. Session Provider for Client Components**
```typescript
// src/components/auth/session-provider.tsx
"use client";
import { useSession } from "~/lib/auth-client";
import { createContext, useContext } from "react";

const UserContext = createContext<any>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }
  
  return (
    <UserContext.Provider value={session?.user}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
```

### Phase 7: Role-Based Access Control (RBAC)

**1. Permission System Integration**
```typescript
// src/lib/permissions.ts
import { getCurrentUser } from "~/lib/dal";
import { db } from "~/server/db";
import { userRoles, roles } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export type Permission = 
  | "properties.view" | "properties.create" | "properties.edit"
  | "contacts.view" | "contacts.create" | "contacts.edit"
  | "users.manage" | "settings.manage"
  | "reports.view" | "billing.manage";

export async function getUserPermissions(): Promise<Permission[]> {
  const user = await getCurrentUser();
  
  const userRolesList = await db
    .select({ permissions: roles.permissions })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.roleId))
    .where(eq(userRoles.userId, user.userId));
    
  const allPermissions = userRolesList.flatMap(role => 
    Object.keys(role.permissions || {})
  ) as Permission[];
  
  return [...new Set(allPermissions)];
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  if (!(await hasPermission(permission))) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
```

**2. Server Action Security with RBAC**
```typescript
// src/app/(dashboard)/propiedades/actions.ts
import { requirePermission } from "~/lib/permissions";
import { getCurrentUser } from "~/lib/dal";

export async function createProperty(data: PropertyData) {
  // Check permissions
  await requirePermission("properties.create");
  
  // Get user context for multi-tenant security
  const user = await getCurrentUser();
  
  // Create property with user's accountId
  return await createPropertyInDB({
    ...data,
    accountId: user.accountId,
    createdByUserId: user.userId,
  });
}

export async function updateProperty(propertyId: string, data: PropertyData) {
  await requirePermission("properties.edit");
  
  const user = await getCurrentUser();
  
  // Ensure property belongs to user's account
  const property = await getPropertyById(propertyId);
  if (property.accountId !== user.accountId) {
    throw new Error("Access denied");
  }
  
  return await updatePropertyInDB(propertyId, data);
}
```

## Environment Variables

```bash
# Add to .env.local

# BetterAuth Core
BETTER_AUTH_SECRET="your-secret-key-here-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Social Authentication (Google setup from docs)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional Social Providers
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Production OAuth Redirect URLs:
# Google: https://yourdomain.com/api/auth/callback/google
# Apple: https://yourdomain.com/api/auth/callback/apple
# LinkedIn: https://yourdomain.com/api/auth/callback/linkedin
```

## Security Standards Implementation

### 1. Multi-Tenant Data Isolation
- **Account-Level Filtering**: All queries MUST include `accountId` filter
- **User Context Validation**: Every server action validates user session
- **Row-Level Security**: Implemented at application level via DAL

### 2. Authentication Security (Built into BetterAuth)
- **Password Requirements**: Configurable complexity rules
- **Session Management**: Secure HTTP-only cookies with CSRF protection
- **Rate Limiting**: Built-in protection against brute force attacks
- **Email Verification**: Optional but recommended for production

### 3. Authorization Patterns
- **Permission-Based**: Use JSON permissions in existing roles table
- **Least Privilege**: Default to minimal permissions
- **Audit Trail**: Log sensitive operations with user context

## Implementation Order

1. **Database Schema Setup** (45 min)
   - Run BetterAuth CLI schema generation
   - Add missing fields to users table
   - Create BetterAuth tables via migration
   - Test schema compatibility

2. **Core Auth Configuration** (60 min)
   - Configure server-side auth with all providers
   - Set up client-side auth hooks
   - Create API route handlers
   - Test authentication flows

3. **Route Protection Implementation** (75 min)
   - Implement middleware for route protection
   - Create protected layouts for dashboard
   - Add session providers and context
   - Test route access patterns

4. **Data Access Layer Security** (90 min)
   - Create secure query wrappers with user context
   - Update ALL existing queries with account filtering
   - Add permission checking to server actions
   - Test multi-tenant data isolation

5. **UI Integration & Enhancement** (90 min)
   - Implement auth pages using provided examples
   - Update dashboard layouts with user session
   - Add user profile and settings UI
   - Test social authentication flows

6. **RBAC System Implementation** (75 min)
   - Create permission checking system using existing roles
   - Update server actions with permission requirements
   - Add role-based UI elements and restrictions
   - Test permission inheritance and updates

7. **Security Hardening & Testing** (60 min)
   - Add comprehensive error handling
   - Implement audit logging for sensitive operations
   - Test security boundaries and access controls
   - Performance testing with rate limiting

Total estimated time: 8.5 hours

## Validation Gates

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# BetterAuth CLI validation
npx @better-auth/cli@latest generate --yes

# Authentication flow testing
echo "✓ Landing page accessible without authentication"
echo "✓ Dashboard redirects to signin when not authenticated"
echo "✓ Email/password signin validates and authenticates users"
echo "✓ Email/password signup creates new users with proper accountId"
echo "✓ Google social auth redirects and authenticates properly"
echo "✓ Apple social auth works correctly"
echo "✓ LinkedIn social auth functions as expected"
echo "✓ Sessions persist across browser refresh"
echo "✓ Logout clears session and redirects to landing"
echo "✓ Remember me functionality works correctly"

# Security validation
echo "✓ Users can only see their account's data (multi-tenant isolation)"
echo "✓ API endpoints require valid authentication"
echo "✓ Cross-account data access is properly blocked"
echo "✓ Role permissions are enforced on server actions"
echo "✓ Rate limiting prevents brute force attacks"
echo "✓ CSRF protection is active"
echo "✓ Session cookies are HTTP-only and secure"

# Google OAuth specific testing
echo "✓ Google OAuth redirect URLs configured correctly"
echo "✓ Google refresh tokens work for offline access"
echo "✓ Google account selection prompt appears"
echo "✓ Google auth callback handling works properly"

# Performance validation
echo "✓ Authentication doesn't impact page load times"
echo "✓ Database queries are optimized with proper indexing"
echo "✓ Session lookup performance is acceptable"
echo "✓ Multi-tenant queries perform well under load"
```

## External Resources

### Core Documentation
- **BetterAuth Main Docs**: https://www.better-auth.com/docs
- **Basic Usage Guide**: https://www.better-auth.com/docs/basic-usage
- **Introduction & Philosophy**: https://www.better-auth.com/docs/introduction
- **CLI Commands**: https://www.better-auth.com/docs/concepts/cli#generate

### Database Integration
- **Drizzle Adapter**: https://www.better-auth.com/docs/adapters/drizzle
- **MySQL Adapter**: https://www.better-auth.com/docs/adapters/mysql
- **Prisma Adapter** (reference): https://www.better-auth.com/docs/adapters/prisma

### Social Authentication
- **Google Authentication**: https://www.better-auth.com/docs/authentication/google
- **Next.js Integration**: https://www.better-auth.com/docs/integrations/next

### Security & Best Practices
- **Next.js Security Guide**: https://nextjs.org/docs/app/guides/data-security
- **Multi-tenant Architecture**: https://www.thenile.dev/blog/multi-tenant-rls
- **Performance Optimization**: Review BetterAuth performance guide

## Success Criteria

1. **Complete Authentication System**: Email/password + Google/Apple/LinkedIn working
2. **Route Protection**: All dashboard routes require valid authentication
3. **Multi-Tenant Security**: Users only access their organization's data
4. **Role-Based Access**: Permissions properly enforced via existing schema
5. **Session Management**: Secure, persistent sessions with proper cleanup
6. **Social Authentication**: All configured providers working correctly
7. **Performance**: No degradation in application performance
8. **User Experience**: Seamless authentication flows with proper error handling
9. **Security Standards**: Rate limiting, CSRF protection, secure cookies active
10. **CLI Integration**: Schema generation and migration workflow established

## Potential Gotchas

1. **BetterAuth CLI Integration**:
   - Run `npx @better-auth/cli@latest generate` before Drizzle migrations
   - Use `--config` flag if auth configuration is in non-standard location
   - Generated schemas may need manual review for existing table compatibility

2. **Google OAuth Configuration**:
   - Redirect URLs must match exactly: `https://yourdomain.com/api/auth/callback/google`
   - Google only issues refresh tokens on first user consent
   - Use `accessType: "offline"` to ensure refresh token availability

3. **Schema Mapping with Drizzle**:
   - Use `schema` mapping in drizzleAdapter if table names differ from defaults
   - Consider `usePlural` option for pluralized table names
   - Ensure foreign key relationships maintained during mapping

4. **MySQL/SingleStore Adapter**:
   - Verify mysql2 library compatibility with SingleStore
   - Test connection pooling with BetterAuth session management
   - Monitor Kysely adapter performance with SingleStore-specific features

5. **Multi-Tenant Security**:
   - ALL queries must include `accountId` filtering - no exceptions
   - New user registration must assign correct `accountId`
   - Test cross-account access prevention thoroughly

6. **Session & Cookie Management**:
   - Configure secure cookie settings for production domains
   - Test session persistence across subdomains if applicable
   - Ensure proper session cleanup on logout

7. **Middleware Placement**:
   - Middleware must run on all protected routes
   - Test route matching patterns thoroughly
   - Handle edge cases like API routes and static assets

8. **Rate Limiting Configuration**:
   - Adjust rate limits based on expected user behavior
   - Consider different limits for different authentication methods
   - Test rate limiting doesn't interfere with legitimate usage

9. **Permission System Integration**:
   - Test role updates and permission inheritance
   - Handle edge cases where users have multiple roles
   - Ensure permission checks don't create performance bottlenecks

10. **Environment Variables**:
    - Ensure all required environment variables are set
    - Use strong secrets for production (minimum 32 characters)
    - Test OAuth callbacks work with production domains

---

**Confidence Score: 9/10**

This comprehensive PRP incorporates detailed information from all BetterAuth documentation sources, providing specific implementation details, security patterns, and thorough testing procedures. The high confidence stems from the detailed research, existing infrastructure compatibility, and comprehensive coverage of authentication patterns. The only minor uncertainty involves SingleStore-specific compatibility with the Kysely adapter and some edge cases in multi-tenant permission handling.