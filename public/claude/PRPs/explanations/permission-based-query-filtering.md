# Permission-Based Query Filtering - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Permission Model Deep Dive](#permission-model-deep-dive)
5. [Real-World Examples](#real-world-examples)
6. [Implementation Guide](#implementation-guide)
7. [Helper Functions Reference](#helper-functions-reference)
8. [Query Integration Patterns](#query-integration-patterns)
9. [Testing & Verification](#testing--verification)
10. [Migration Guide](#migration-guide)
11. [Best Practices & Security](#best-practices--security)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
Implement **multi-layer permission-based security** that enforces access control at the database query level, ensuring users only see and modify data they have explicit permissions to access.

### What This Solves
- ✅ **Data Isolation**: Users with `viewOwn` only see their own records
- ✅ **Role-Based Access**: Different roles have different permissions per account
- ✅ **Defense in Depth**: Route protection + query filtering + account isolation
- ✅ **Flexible Security**: Permission-based (not just role-based)
- ✅ **Audit Trail**: Clear permission checks throughout codebase

### Key Concepts
```
User → Assigned Role → Role Has Permissions → Permissions Control Queries
```

**Example:**
- **User**: María (user_789)
- **Role**: Agent (role_id: 2)
- **Permissions**: `tasks.viewAll: false`, `tasks.viewOwn: true`
- **Query Result**: Only María's own tasks

---

## Problem Statement

### The Challenge

You have a multi-tenant real estate CRM with **3 different roles** per account:

| Role ID | Name | Description |
|---------|------|-------------|
| 1 | Comercial | Basic sales agent |
| 2 | Agent | Standard agent (hypothetical) |
| 3 | Administrador de Cuenta | Full account admin |
| 4 | Gestor de Oficina | Office manager |
| 5 | Inactivo | Disabled user |

Each role has **different permissions** defined in the `account_roles` table:

```json
// Role 1 - Comercial (from your actual DB)
{
  "tasks": {
    "viewAll": true,
    "editOwn": true,
    "editAll": true
  },
  "admin": {
    "manageAccount": false,
    "manageUsers": false
  }
}

// Role 3 - Administrador de Cuenta
{
  "tasks": {
    "viewAll": true,
    "edit": true,
    "delete": true
  },
  "admin": {
    "manageAccount": true,
    "manageUsers": true,
    "manageRoles": true
  }
}

// Role 4 - Gestor de Oficina
{
  "tasks": {
    "viewAll": true,
    "edit": true,
    "delete": true
  },
  "admin": {
    "manageAccount": false,  // ← Cannot access /account-admin
    "manageUsers": true,
    "manageRoles": false
  }
}
```

### The Problem

**WITHOUT permission-based query filtering:**

```typescript
// ❌ INSECURE - All users see all tasks in their account
export async function listTasks(accountId: number) {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.accountId, BigInt(accountId)));

  // Problem: Even users with viewAll: false see everything!
}
```

**WITH permission-based query filtering:**

```typescript
// ✅ SECURE - Query respects permissions
export async function listTasks(accountId: number) {
  const { canViewAll, userId } = await getTaskViewScope();

  const whereConditions = [
    eq(tasks.accountId, BigInt(accountId))
  ];

  // Add user filter if they can't view all
  if (!canViewAll) {
    whereConditions.push(eq(tasks.userId, userId));
  }

  return await db
    .select()
    .from(tasks)
    .where(and(...whereConditions));

  // ✅ Users with viewAll: false only see their own tasks
}
```

---

## System Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Route Protection (Middleware & Layouts)           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Blocks unauthorized access to entire pages/sections      │
│  • Example: Only role 3 can access /account-admin           │
│  • Files: layout.tsx, middleware.ts                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Permission Checks (Helper Functions)              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Checks if user has required permissions                  │
│  • Example: canEditTask(), canDeleteTask()                  │
│  • Files: permission-helpers.ts                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Query-Level Filtering (This Implementation)       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Automatically filters database results                   │
│  • Example: WHERE userId = currentUser (if !viewAll)        │
│  • Files: task.ts, property.ts, contact.ts                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Account Isolation (Existing)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Ensures users only see their account's data              │
│  • Example: WHERE accountId = currentUserAccountId          │
│  • Files: dal.ts, all query files                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Request: "Show me all tasks"
        ↓
┌───────────────────────────────────────────┐
│ 1. Authentication Check                   │
│    ✓ getSecureSession()                   │
│    ✓ Has valid session?                   │
│    ✓ Has accountId?                       │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ 2. Get User Permissions                   │
│    ✓ getUserPermissions(userId, accountId)│
│    ✓ Returns permission object            │
│    ✓ Cached for performance               │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ 3. Permission Decision                    │
│    ✓ Check tasks.viewAll                  │
│    ✓ TRUE  → Can see all tasks            │
│    ✓ FALSE → Only own tasks               │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ 4. Build Query Filters                    │
│    ✓ Base: WHERE accountId = X            │
│    ✓ If !viewAll: AND userId = Y          │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│ 5. Execute Database Query                 │
│    ✓ Filtered by account + permissions    │
│    ✓ Return only authorized records       │
└───────────────────────────────────────────┘
```

---

## Permission Model Deep Dive

### Database Schema

**Table: `account_roles`**
```sql
CREATE TABLE account_roles (
  account_role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL,           -- 1=Comercial, 3=Admin, 4=Gestor, 5=Inactive
  account_id BIGINT NOT NULL,        -- FK to accounts table
  permissions JSON NOT NULL,          -- Permission object (see below)
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  is_active BOOLEAN DEFAULT true
);
```

**Table: `user_roles`** (junction table)
```sql
CREATE TABLE user_roles (
  user_role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,      -- FK to users table
  role_id BIGINT NOT NULL,           -- FK to roles table
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### Permission Object Structure

```typescript
interface AccountRolePermissions {
  tasks?: {
    viewAll: boolean;      // Can view all tasks in account
    editOwn: boolean;      // Can edit own tasks
    editAll: boolean;      // Can edit any task
    deleteOwn: boolean;    // Can delete own tasks
    deleteAll: boolean;    // Can delete any task
  };
  properties?: {
    viewOwn: boolean;      // Can view own properties
    viewAll: boolean;      // Can view all properties
    create: boolean;       // Can create properties
    edit: boolean;         // Can edit properties
    delete: boolean;       // Can delete properties
    publish: boolean;      // Can publish to portals
  };
  contacts?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  calendar?: {
    viewOwn: boolean;
    viewAll: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  tools?: {
    imageStudio: boolean;  // Can use image editor
    aiTools: boolean;      // Can use AI features
    export: boolean;       // Can export data
  };
  admin?: {
    manageUsers: boolean;  // Can manage users
    manageRoles: boolean;  // Can edit role permissions
    viewReports: boolean;  // Can view analytics
    manageAccount: boolean;// Can access /account-admin
    manageBilling: boolean;// Can manage subscription
  };
}
```

### Real Data Example

**From your database (account_id: 1125899906842625):**

```json
// account_role_id: 1125899906842626 (Role 3 - Admin)
{
  "admin": {
    "manageAccount": true,
    "manageBilling": true,
    "manageRoles": true,
    "manageUsers": true,
    "viewReports": true
  },
  "calendar": {
    "create": true,
    "delete": true,
    "edit": true,
    "viewAll": true,
    "viewOwn": true
  },
  "contacts": {
    "create": true,
    "delete": true,
    "edit": true,
    "viewAll": true,
    "viewOwn": true
  },
  "properties": {
    "create": true,
    "delete": true,
    "edit": true,
    "publish": true,
    "viewAll": true,
    "viewOwn": true
  },
  "tasks": {
    "create": true,
    "delete": true,
    "edit": true,
    "viewAll": true,
    "viewOwn": true
  },
  "tools": {
    "aiTools": true,
    "export": true,
    "imageStudio": true
  }
}
```

```json
// account_role_id: 1125899906842627 (Role 4 - Gestor)
{
  "admin": {
    "manageAccount": false,    // ← Cannot access /account-admin
    "manageBilling": false,
    "manageRoles": false,
    "manageUsers": true,       // ← Can manage users though
    "viewReports": true
  },
  "tasks": {
    "create": true,
    "delete": true,
    "edit": true,
    "viewAll": true,           // ← Can see all tasks
    "viewOwn": true
  }
  // ... other permissions
}
```

### Permission Hierarchy

**Implicit Rules:**
- `editAll` implies `editOwn`
- `deleteAll` implies `deleteOwn`
- `viewAll` implies `viewOwn`
- `manageRoles` should imply `manageAccount`

**Implementation:**
```typescript
function canEditTask(permissions, taskOwnerId, currentUserId): boolean {
  // Can edit all tasks
  if (permissions?.tasks?.editAll) return true;

  // Can edit own tasks (editAll implies editOwn)
  if (permissions?.tasks?.editOwn && taskOwnerId === currentUserId) {
    return true;
  }

  return false;
}
```

---

## Real-World Examples

### Scenario Setup

**Users in account 1125899906842625:**

| userId | Name | Role | tasks.viewAll | tasks.editOwn | tasks.editAll |
|--------|------|------|---------------|---------------|---------------|
| user_123 | Ana | Comercial (1) | ✅ true | ✅ true | ✅ true |
| user_456 | Pedro | Admin (3) | ✅ true | ✅ true | ✅ true |
| user_789 | María | Agent (2) | ❌ false | ✅ true | ❌ false |
| user_999 | Carlos | Different account | - | - | - |

**Tasks in database:**

| task_id | title | userId | accountId | completed |
|---------|-------|--------|-----------|-----------|
| 1 | "Llamar cliente Pérez" | user_123 | 1125899906842625 | false |
| 2 | "Mostrar piso C/Mayor" | user_456 | 1125899906842625 | false |
| 3 | "Renovar contrato López" | user_789 | 1125899906842625 | true |
| 4 | "Visita oficina" | user_123 | 1125899906842625 | false |
| 5 | "Llamar proveedor" | user_999 | 9999999999 | false |

---

### Example 1: Ana (Comercial) Lists Tasks

**User Context:**
```typescript
session = {
  user: {
    id: "user_123",
    accountId: 1125899906842625
  }
}

permissions = {
  tasks: {
    viewAll: true,  // ← Can see all tasks
    editAll: true
  }
}
```

**Query Execution:**
```typescript
// Step 1: Get permission context
const { canViewAll, userId } = await getTaskViewScope();
// Returns: { canViewAll: true, userId: "user_123" }

// Step 2: Build WHERE conditions
const whereConditions = [
  eq(tasks.accountId, BigInt(1125899906842625))
];

// Step 3: Check viewAll permission
if (!canViewAll) {
  // SKIP - Ana has viewAll: true
}

// Step 4: Execute query
SELECT * FROM tasks
WHERE accountId = 1125899906842625
  AND isActive = true;
```

**Result:**
```typescript
// Ana sees: [Task 1, Task 2, Task 3, Task 4]
// (All tasks in her account, excluding task 5 from different account)
```

---

### Example 2: María (Agent) Lists Tasks

**User Context:**
```typescript
session = {
  user: {
    id: "user_789",
    accountId: 1125899906842625
  }
}

permissions = {
  tasks: {
    viewAll: false,  // ← Can only see own tasks
    editOwn: true,
    editAll: false
  }
}
```

**Query Execution:**
```typescript
// Step 1: Get permission context
const { canViewAll, userId } = await getTaskViewScope();
// Returns: { canViewAll: false, userId: "user_789" }

// Step 2: Build WHERE conditions
const whereConditions = [
  eq(tasks.accountId, BigInt(1125899906842625))
];

// Step 3: Check viewAll permission
if (!canViewAll) {
  // ✅ APPLY FILTER - María can only see her own tasks
  whereConditions.push(eq(tasks.userId, "user_789"));
}

// Step 4: Execute query
SELECT * FROM tasks
WHERE accountId = 1125899906842625
  AND userId = 'user_789'
  AND isActive = true;
```

**Result:**
```typescript
// María sees: [Task 3]
// (Only her own task, even though there are 4 tasks in the account)
```

---

### Example 3: Pedro (Admin) Edits Ana's Task

**User Context:**
```typescript
session = {
  user: {
    id: "user_456",  // Pedro
    accountId: 1125899906842625
  }
}

taskToEdit = {
  taskId: 1,
  userId: "user_123",  // Ana's task
  title: "Llamar cliente Pérez"
}

permissions = {
  tasks: {
    editAll: true  // ← Can edit any task
  }
}
```

**Permission Check:**
```typescript
// Function: canEditTask(taskOwnerId)
const canEdit = await canEditTask("user_123");

// Internal logic:
// 1. Check editAll permission
if (permissions.tasks?.editAll) {
  return true;  // ✅ Pedro has editAll: true
}

// 2. Check editOwn permission (skipped, already true)
// ...

// Result: canEdit = true
```

**Query Execution:**
```typescript
// Step 1: Verify task exists and belongs to account
const [task] = await db
  .select()
  .from(tasks)
  .where(
    and(
      eq(tasks.taskId, BigInt(1)),
      eq(tasks.accountId, BigInt(1125899906842625))
    )
  );
// ✅ Task found

// Step 2: Check permission
const canEdit = await canEditTask(task.userId);
// Returns: true

if (!canEdit) {
  throw new Error("Access denied");
}

// Step 3: Perform update
await db
  .update(tasks)
  .set({ title: "UPDATED TITLE" })
  .where(eq(tasks.taskId, BigInt(1)));

// ✅ SUCCESS - Pedro can edit Ana's task
```

---

### Example 4: María (Agent) Tries to Edit Pedro's Task

**User Context:**
```typescript
session = {
  user: {
    id: "user_789",  // María
    accountId: 1125899906842625
  }
}

taskToEdit = {
  taskId: 2,
  userId: "user_456",  // Pedro's task
  title: "Mostrar piso C/Mayor"
}

permissions = {
  tasks: {
    editOwn: true,   // ← Can only edit own tasks
    editAll: false   // ← Cannot edit all tasks
  }
}
```

**Permission Check:**
```typescript
// Function: canEditTask(taskOwnerId)
const canEdit = await canEditTask("user_456");

// Internal logic:
// 1. Check editAll permission
if (permissions.tasks?.editAll) {
  return true;  // ❌ María has editAll: false
}

// 2. Check editOwn permission
if (permissions.tasks?.editOwn && "user_456" === "user_789") {
  return true;  // ❌ Task owner (user_456) !== current user (user_789)
}

// 3. Default
return false;

// Result: canEdit = false
```

**Query Execution:**
```typescript
// Step 1: Verify task exists
const [task] = await db
  .select()
  .from(tasks)
  .where(
    and(
      eq(tasks.taskId, BigInt(2)),
      eq(tasks.accountId, BigInt(1125899906842625))
    )
  );
// ✅ Task found

// Step 2: Check permission
const canEdit = await canEditTask(task.userId);
// Returns: false

if (!canEdit) {
  throw new Error("Access denied: insufficient permissions to edit this task");
  // ❌ BLOCKED - María cannot edit Pedro's task
}
```

---

## Implementation Guide

### Step 1: Create Permission Helper Functions

**File:** `src/server/queries/permission-helpers.ts`

```typescript
"use server";

import { getSecureSession } from "~/lib/dal";
import { getUserPermissions } from "./account-roles";
import type { AccountRolePermissions } from "~/types/account-roles";

/**
 * Get current user's permissions with caching
 * This is the foundation - all other helpers use this
 */
export async function getCurrentUserPermissions(): Promise<AccountRolePermissions | null> {
  const session = await getSecureSession();
  if (!session?.user) return null;

  // getUserPermissions uses caching internally
  const permissions = await getUserPermissions(
    session.user.id,
    BigInt(session.user.accountId)
  );

  return permissions;
}

/**
 * Get current user's session
 * Useful for getting userId and accountId
 */
export async function getCurrentUserContext() {
  const session = await getSecureSession();

  if (!session?.user) {
    return {
      userId: null,
      accountId: null,
      isAuthenticated: false
    };
  }

  return {
    userId: session.user.id,
    accountId: session.user.accountId,
    isAuthenticated: true
  };
}

// ═══════════════════════════════════════════════════════════
// TASK PERMISSIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get task viewing scope for current user
 * Returns whether user can view all tasks or just their own
 */
export async function getTaskViewScope(): Promise<{
  canViewAll: boolean;
  userId: string | null;
}> {
  const session = await getSecureSession();
  if (!session?.user) {
    return { canViewAll: false, userId: null };
  }

  const permissions = await getCurrentUserPermissions();

  return {
    canViewAll: permissions?.tasks?.viewAll ?? false,
    userId: session.user.id,
  };
}

/**
 * Check if current user can edit a specific task
 * @param taskOwnerId - The userId who owns the task
 */
export async function canEditTask(taskOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  // Can edit all tasks
  if (permissions?.tasks?.editAll) return true;

  // Can edit own tasks (editAll implies editOwn)
  if (permissions?.tasks?.editOwn && taskOwnerId === session.user.id) {
    return true;
  }

  return false;
}

/**
 * Check if current user can delete a specific task
 * @param taskOwnerId - The userId who owns the task
 */
export async function canDeleteTask(taskOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  // Can delete all tasks
  if (permissions?.tasks?.deleteAll) return true;

  // Can delete own tasks (deleteAll implies deleteOwn)
  if (permissions?.tasks?.deleteOwn && taskOwnerId === session.user.id) {
    return true;
  }

  return false;
}

/**
 * Get comprehensive task permissions for current user
 * Useful for UI: hiding/showing edit/delete buttons
 */
export async function getTaskPermissions(taskOwnerId?: string): Promise<{
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canCreate: boolean;
}> {
  const session = await getSecureSession();

  if (!session?.user) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canViewAll: false,
      canCreate: false,
    };
  }

  const permissions = await getCurrentUserPermissions();
  const isOwner = taskOwnerId === session.user.id;

  const canViewAll = permissions?.tasks?.viewAll ?? false;
  const canEditAll = permissions?.tasks?.editAll ?? false;
  const canEditOwn = permissions?.tasks?.editOwn ?? false;
  const canDeleteAll = permissions?.tasks?.deleteAll ?? false;
  const canDeleteOwn = permissions?.tasks?.deleteOwn ?? false;

  return {
    canView: canViewAll || isOwner,
    canEdit: canEditAll || (canEditOwn && isOwner),
    canDelete: canDeleteAll || (canDeleteOwn && isOwner),
    canViewAll,
    canCreate: true, // Everyone can create tasks (adjust if needed)
  };
}

// ═══════════════════════════════════════════════════════════
// PROPERTY PERMISSIONS
// ═══════════════════════════════════════════════════════════

export async function getPropertyViewScope(): Promise<{
  canViewAll: boolean;
  userId: string | null;
}> {
  const session = await getSecureSession();
  if (!session?.user) {
    return { canViewAll: false, userId: null };
  }

  const permissions = await getCurrentUserPermissions();

  return {
    canViewAll: permissions?.properties?.viewAll ?? false,
    userId: session.user.id,
  };
}

export async function canEditProperty(propertyOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  // Properties use single 'edit' permission, not editOwn/editAll
  if (permissions?.properties?.edit) {
    // If they have edit permission, check viewAll to determine scope
    if (permissions.properties.viewAll) {
      return true; // Can edit any property
    }
    // Can only edit own properties
    return propertyOwnerId === session.user.id;
  }

  return false;
}

export async function canDeleteProperty(propertyOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  if (permissions?.properties?.delete) {
    // If they have delete permission, check viewAll to determine scope
    if (permissions.properties.viewAll) {
      return true; // Can delete any property
    }
    // Can only delete own properties
    return propertyOwnerId === session.user.id;
  }

  return false;
}

export async function canPublishProperty(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.properties?.publish ?? false;
}

// ═══════════════════════════════════════════════════════════
// CONTACT PERMISSIONS
// ═══════════════════════════════════════════════════════════

export async function getContactViewScope(): Promise<{
  canViewAll: boolean;
  userId: string | null;
}> {
  const session = await getSecureSession();
  if (!session?.user) {
    return { canViewAll: false, userId: null };
  }

  const permissions = await getCurrentUserPermissions();

  return {
    canViewAll: permissions?.contacts?.viewAll ?? false,
    userId: session.user.id,
  };
}

export async function canEditContact(contactOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  if (permissions?.contacts?.edit) {
    if (permissions.contacts.viewAll) {
      return true; // Can edit any contact
    }
    return contactOwnerId === session.user.id;
  }

  return false;
}

export async function canDeleteContact(contactOwnerId: string): Promise<boolean> {
  const session = await getSecureSession();
  if (!session?.user) return false;

  const permissions = await getCurrentUserPermissions();

  if (permissions?.contacts?.delete) {
    if (permissions.contacts.viewAll) {
      return true; // Can delete any contact
    }
    return contactOwnerId === session.user.id;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════
// ADMIN PERMISSIONS
// ═══════════════════════════════════════════════════════════

/**
 * Check if user can access /account-admin section
 */
export async function canAccessAccountAdmin(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.admin?.manageAccount ?? false;
}

export async function canManageUsers(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.admin?.manageUsers ?? false;
}

export async function canManageRoles(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.admin?.manageRoles ?? false;
}

export async function canViewReports(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.admin?.viewReports ?? false;
}

export async function canManageBilling(): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions?.admin?.manageBilling ?? false;
}
```

---

### Step 2: Integrate into Task Queries

**File:** `src/server/queries/task.ts`

Update existing functions to include permission checks:

```typescript
import {
  getTaskViewScope,
  canEditTask,
  canDeleteTask,
  getCurrentUserContext
} from "./permission-helpers";

// ═══════════════════════════════════════════════════════════
// READ OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * List all tasks with permission-based filtering
 */
export async function listTasks(
  page = 1,
  limit = 10,
  accountId: number,
  filters?: {
    userId?: string;
    completed?: boolean;
    isActive?: boolean;
  },
) {
  try {
    // ✅ STEP 1: Get permission context
    const { canViewAll, userId: currentUserId } = await getTaskViewScope();

    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const offset = (page - 1) * limit;
    const whereConditions = [];

    // ✅ STEP 2: Apply permission filter
    if (!canViewAll) {
      // User can only see their own tasks
      whereConditions.push(eq(tasks.userId, currentUserId));
    } else if (filters?.userId) {
      // Admin viewing specific user's tasks
      whereConditions.push(eq(tasks.userId, filters.userId));
    }
    // If canViewAll and no userId filter, show all tasks

    // ✅ STEP 3: Apply other filters
    if (filters?.completed !== undefined) {
      whereConditions.push(eq(tasks.completed, filters.completed));
    }
    if (filters?.isActive !== undefined) {
      whereConditions.push(eq(tasks.isActive, filters.isActive));
    } else {
      whereConditions.push(eq(tasks.isActive, true));
    }

    // ✅ STEP 4: Always filter by account (existing security)
    whereConditions.push(
      or(
        eq(contacts.accountId, BigInt(accountId)),
        eq(properties.accountId, BigInt(accountId)),
      ),
    );

    // ✅ STEP 5: Execute query with all filters
    const allTasks = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset);

    return allTasks;
  } catch (error) {
    console.error("Error listing tasks:", error);
    throw error;
  }
}

/**
 * Get tasks by user ID
 */
export async function getUserTasks(userId: string, accountId: number) {
  try {
    // ✅ CHECK PERMISSIONS FIRST
    const { canViewAll, userId: currentUserId } = await getTaskViewScope();

    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // If user can't view all tasks and is trying to view someone else's tasks
    if (!canViewAll && userId !== currentUserId) {
      throw new Error("Access denied: cannot view other users' tasks");
    }

    // ✅ NOW FETCH THE DATA (your existing query)
    const userTasks = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.isActive, true),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );
    return userTasks;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: number, accountId: number) {
  try {
    // ✅ Fetch the task first (your existing query)
    const [task] = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!task) {
      return null;
    }

    // ✅ CHECK PERMISSIONS
    const { canViewAll, userId: currentUserId } = await getTaskViewScope();

    // If user can't view all and this isn't their task
    if (!canViewAll && task.tasks.userId !== currentUserId) {
      throw new Error("Access denied: insufficient permissions to view this task");
    }

    return task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

/**
 * Get most urgent tasks
 */
export async function getMostUrgentTasks(accountId: number, limit = 10, daysAhead = 30) {
  try {
    // ✅ Get permission context
    const { canViewAll, userId: currentUserId } = await getTaskViewScope();

    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysAhead);

    // ✅ Build WHERE conditions with permission filter
    const whereConditions = [
      eq(tasks.isActive, true),
      eq(tasks.completed, false),
      isNotNull(tasks.dueDate),
      lte(tasks.dueDate, endDate),
      or(
        eq(contacts.accountId, BigInt(accountId)),
        eq(properties.accountId, BigInt(accountId)),
      ),
    ];

    // ✅ Add user filter if needed
    if (!canViewAll) {
      whereConditions.push(eq(tasks.userId, currentUserId));
    }

    const urgentTasks = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        propertyTitle: properties.title,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.userId, users.id))
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(and(...whereConditions))
      .orderBy(asc(tasks.dueDate))
      .limit(limit);

    return urgentTasks;
  } catch (error) {
    console.error("Error fetching most urgent tasks:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Update task
 */
export async function updateTask(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // ✅ STEP 1: Get the task to check ownership
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        userId: tasks.userId // ← Need the owner
      })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    // ✅ STEP 2: Check edit permission
    const canEdit = await canEditTask(existingTask.userId);
    if (!canEdit) {
      throw new Error("Access denied: insufficient permissions to edit this task");
    }

    // ✅ STEP 3: Perform update
    await db
      .update(tasks)
      .set(data)
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));

    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));

    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * Delete task (soft delete)
 */
export async function softDeleteTask(taskId: number, accountId: number) {
  try {
    // ✅ STEP 1: Get the task to check ownership
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        userId: tasks.userId
      })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    // ✅ STEP 2: Check delete permission
    const canDelete = await canDeleteTask(existingTask.userId);
    if (!canDelete) {
      throw new Error("Access denied: insufficient permissions to delete this task");
    }

    // ✅ STEP 3: Perform soft delete
    await db
      .update(tasks)
      .set({ isActive: false })
      .where(eq(tasks.taskId, BigInt(taskId)));

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting task:", error);
    throw error;
  }
}

/**
 * Delete task (hard delete)
 */
export async function deleteTask(taskId: number, accountId: number) {
  try {
    // ✅ Get task and check permission (same as soft delete)
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        userId: tasks.userId
      })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    const canDelete = await canDeleteTask(existingTask.userId);
    if (!canDelete) {
      throw new Error("Access denied: insufficient permissions to delete this task");
    }

    await db.delete(tasks).where(eq(tasks.taskId, BigInt(taskId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}
```

---

### Step 3: Update Account Admin Layout

**File:** `src/app/(dashboard)/account-admin/layout.tsx`

Change from role-based to permission-based check:

```typescript
import { redirect } from "next/navigation";
import { getSecureSession } from "~/lib/dal";
import { canAccessAccountAdmin } from "~/server/queries/permission-helpers";
import { userHasRole } from "~/server/queries/user-roles";

export default async function AccountAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSecureSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is inactive (role 5)
  const isInactive = await userHasRole(session.user.id, 5);
  if (isInactive) {
    redirect("/dashboard");
  }

  // ✅ NEW: Check permission instead of role
  const hasPermission = await canAccessAccountAdmin();

  if (!hasPermission) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
```

**Why this is better:**
- ✅ Role 3 (Admin) has `admin.manageAccount: true` → Access granted
- ✅ Role 4 (Gestor) has `admin.manageAccount: false` → Access denied
- ✅ Future-proof: New roles with `manageAccount: true` auto-granted access
- ✅ No hardcoded role IDs

---

## Helper Functions Reference

### Quick Reference Table

| Function | Purpose | Returns | Example |
|----------|---------|---------|---------|
| `getCurrentUserPermissions()` | Get all permissions | `AccountRolePermissions \| null` | Base function for all checks |
| `getCurrentUserContext()` | Get userId & accountId | `{ userId, accountId, isAuthenticated }` | For query building |
| `getTaskViewScope()` | Check if can view all tasks | `{ canViewAll, userId }` | Read queries |
| `canEditTask(ownerId)` | Check if can edit task | `boolean` | Update operations |
| `canDeleteTask(ownerId)` | Check if can delete task | `boolean` | Delete operations |
| `getTaskPermissions(ownerId?)` | Get all task perms | `{ canView, canEdit, canDelete, ... }` | UI rendering |
| `canAccessAccountAdmin()` | Check admin access | `boolean` | Layout protection |
| `canManageUsers()` | Check user management | `boolean` | User admin pages |
| `canManageRoles()` | Check role management | `boolean` | Role config pages |

### Usage Patterns

**Pattern 1: Read Operations (List/Get)**
```typescript
const { canViewAll, userId } = await getTaskViewScope();

if (!canViewAll) {
  whereConditions.push(eq(table.userId, userId));
}
```

**Pattern 2: Write Operations (Update/Delete)**
```typescript
const canEdit = await canEditTask(record.userId);

if (!canEdit) {
  throw new Error("Access denied");
}

// Proceed with operation
```

**Pattern 3: UI Conditional Rendering**
```typescript
const perms = await getTaskPermissions(task.userId);

return (
  <div>
    {perms.canEdit && <EditButton />}
    {perms.canDelete && <DeleteButton />}
  </div>
);
```

---

## Query Integration Patterns

### Pattern A: List/Search Queries

**Use when:** Fetching multiple records

```typescript
export async function listResources(accountId: number) {
  // 1. Get permission scope
  const { canViewAll, userId } = await getResourceViewScope();

  if (!userId) throw new Error("Not authenticated");

  // 2. Build base conditions
  const whereConditions = [
    eq(table.accountId, BigInt(accountId)),
    eq(table.isActive, true)
  ];

  // 3. Add permission filter
  if (!canViewAll) {
    whereConditions.push(eq(table.userId, userId));
  }

  // 4. Execute query
  return await db
    .select()
    .from(table)
    .where(and(...whereConditions));
}
```

### Pattern B: Get Single Record

**Use when:** Fetching one specific record

```typescript
export async function getResourceById(id: number, accountId: number) {
  // 1. Fetch record (with account check)
  const [record] = await db
    .select()
    .from(table)
    .where(
      and(
        eq(table.id, BigInt(id)),
        eq(table.accountId, BigInt(accountId))
      )
    );

  if (!record) return null;

  // 2. Check permission
  const { canViewAll, userId } = await getResourceViewScope();

  if (!canViewAll && record.userId !== userId) {
    throw new Error("Access denied");
  }

  return record;
}
```

### Pattern C: Update Operations

**Use when:** Modifying existing records

```typescript
export async function updateResource(
  id: number,
  data: Partial<Resource>,
  accountId: number
) {
  // 1. Fetch existing record
  const [existing] = await db
    .select({ id: table.id, userId: table.userId })
    .from(table)
    .where(
      and(
        eq(table.id, BigInt(id)),
        eq(table.accountId, BigInt(accountId))
      )
    );

  if (!existing) throw new Error("Not found");

  // 2. Check permission
  const canEdit = await canEditResource(existing.userId);

  if (!canEdit) {
    throw new Error("Access denied");
  }

  // 3. Perform update
  await db
    .update(table)
    .set(data)
    .where(eq(table.id, BigInt(id)));

  return { success: true };
}
```

### Pattern D: Delete Operations

**Use when:** Removing records

```typescript
export async function deleteResource(id: number, accountId: number) {
  // 1. Fetch existing record
  const [existing] = await db
    .select({ id: table.id, userId: table.userId })
    .from(table)
    .where(
      and(
        eq(table.id, BigInt(id)),
        eq(table.accountId, BigInt(accountId))
      )
    );

  if (!existing) throw new Error("Not found");

  // 2. Check permission
  const canDelete = await canDeleteResource(existing.userId);

  if (!canDelete) {
    throw new Error("Access denied");
  }

  // 3. Perform delete (soft or hard)
  await db
    .update(table)
    .set({ isActive: false })
    .where(eq(table.id, BigInt(id)));

  return { success: true };
}
```

---

## Testing & Verification

### Manual Testing Checklist

**Setup:**
1. Create 3 test users with different roles
2. Create test records owned by different users
3. Test all CRUD operations as each user

**Test Cases:**

#### **Test 1: List Resources**
```typescript
// As User with viewAll: false
const tasks = await listTasksWithAuth();

// Expected: Only current user's tasks
// Actual: [verify SQL has WHERE userId = currentUser]

// As User with viewAll: true
const tasks = await listTasksWithAuth();

// Expected: All tasks in account
// Actual: [verify SQL does NOT have userId filter]
```

#### **Test 2: View Single Resource**
```typescript
// As User A trying to view User B's task
// User A has viewAll: false

const task = await getTaskByIdWithAuth(taskIdOwnedByUserB);

// Expected: Error "Access denied"
// Actual: [verify error is thrown]

// As User A trying to view their own task
const task = await getTaskByIdWithAuth(taskIdOwnedByUserA);

// Expected: Task returned
// Actual: [verify task is returned]

// As Admin with viewAll: true
const task = await getTaskByIdWithAuth(taskIdOwnedByUserB);

// Expected: Task returned (can view any task)
// Actual: [verify task is returned]
```

#### **Test 3: Edit Resource**
```typescript
// As User A trying to edit User B's task
// User A has editOwn: true, editAll: false

await updateTaskWithAuth(taskIdOwnedByUserB, { title: "NEW" });

// Expected: Error "Access denied"
// Actual: [verify error is thrown]

// As Admin with editAll: true
await updateTaskWithAuth(taskIdOwnedByUserB, { title: "NEW" });

// Expected: Success
// Actual: [verify update succeeds]
```

#### **Test 4: Delete Resource**
```typescript
// As User A trying to delete User B's task
// User A has deleteOwn: true, deleteAll: false

await deleteTaskWithAuth(taskIdOwnedByUserB);

// Expected: Error "Access denied"
// Actual: [verify error is thrown]

// As User A deleting their own task
await deleteTaskWithAuth(taskIdOwnedByUserA);

// Expected: Success
// Actual: [verify delete succeeds]
```

### Automated Test Examples

```typescript
// tests/permissions/task-permissions.test.ts

describe("Task Permissions", () => {
  describe("viewAll permission", () => {
    it("users with viewAll: false only see their own tasks", async () => {
      // Setup: Create user with viewAll: false
      const user = await createTestUser({
        roleId: 2,  // Agent role
        permissions: { tasks: { viewAll: false } }
      });

      // Create tasks
      const userTask = await createTask({ userId: user.id });
      const otherTask = await createTask({ userId: "other_user" });

      // Act
      const tasks = await listTasks(user.accountId);

      // Assert
      expect(tasks).toHaveLength(1);
      expect(tasks[0].taskId).toBe(userTask.taskId);
      expect(tasks).not.toContainEqual(
        expect.objectContaining({ taskId: otherTask.taskId })
      );
    });

    it("users with viewAll: true see all tasks", async () => {
      // Setup: Create user with viewAll: true
      const admin = await createTestUser({
        roleId: 3,  // Admin role
        permissions: { tasks: { viewAll: true } }
      });

      // Create tasks
      const task1 = await createTask({ userId: admin.id });
      const task2 = await createTask({ userId: "other_user" });

      // Act
      const tasks = await listTasks(admin.accountId);

      // Assert
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks).toContainEqual(
        expect.objectContaining({ taskId: task1.taskId })
      );
      expect(tasks).toContainEqual(
        expect.objectContaining({ taskId: task2.taskId })
      );
    });
  });

  describe("editOwn/editAll permissions", () => {
    it("users with editOwn can edit their own tasks", async () => {
      const user = await createTestUser({
        permissions: { tasks: { editOwn: true, editAll: false } }
      });

      const task = await createTask({ userId: user.id });

      // Act
      const result = await updateTask(
        task.taskId,
        { title: "UPDATED" },
        user.accountId
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe("UPDATED");
    });

    it("users with editOwn cannot edit others' tasks", async () => {
      const user = await createTestUser({
        permissions: { tasks: { editOwn: true, editAll: false } }
      });

      const otherTask = await createTask({ userId: "other_user" });

      // Act & Assert
      await expect(
        updateTask(otherTask.taskId, { title: "HACKED" }, user.accountId)
      ).rejects.toThrow("Access denied");
    });

    it("users with editAll can edit any task", async () => {
      const admin = await createTestUser({
        permissions: { tasks: { editAll: true } }
      });

      const otherTask = await createTask({ userId: "other_user" });

      // Act
      const result = await updateTask(
        otherTask.taskId,
        { title: "ADMIN EDIT" },
        admin.accountId
      );

      // Assert
      expect(result.title).toBe("ADMIN EDIT");
    });
  });
});
```

---

## Migration Guide

### Phase 1: Setup (Week 1)

**Tasks:**
1. ✅ Create `permission-helpers.ts` with all helper functions
2. ✅ Test helpers in isolation (unit tests)
3. ✅ Update account-admin layout to use `canAccessAccountAdmin()`

**Validation:**
- Gestor (role 4) cannot access `/account-admin` anymore
- Admin (role 3) can still access `/account-admin`

### Phase 2: Tasks (Week 2)

**Tasks:**
1. ✅ Update `listTasks()` with permission filter
2. ✅ Update `getUserTasks()` with permission check
3. ✅ Update `getTaskById()` with permission check
4. ✅ Update `updateTask()` with permission check
5. ✅ Update `deleteTask()` with permission check
6. ✅ Update `getMostUrgentTasks()` with permission filter

**Testing:**
- Test as user with `viewAll: false`
- Test as user with `viewAll: true`
- Test edit/delete with different permission combinations

### Phase 3: Properties (Week 3)

**Tasks:**
1. ✅ Add property permission helpers to `permission-helpers.ts`
2. ✅ Update all property queries
3. ✅ Test thoroughly

**Files to modify:**
- `src/server/queries/property.ts` (or equivalent)

### Phase 4: Contacts (Week 4)

**Tasks:**
1. ✅ Add contact permission helpers
2. ✅ Update all contact queries
3. ✅ Test thoroughly

**Files to modify:**
- `src/server/queries/contact.ts`

### Phase 5: UI Updates (Week 5)

**Tasks:**
1. ✅ Update navigation to hide unauthorized links
2. ✅ Add permission checks to action buttons
3. ✅ Show/hide features based on permissions

**Example:**
```typescript
// In a component
const { canEdit, canDelete } = await getTaskPermissions(task.userId);

return (
  <div>
    {canEdit && <EditButton />}
    {canDelete && <DeleteButton />}
  </div>
);
```

### Phase 6: Testing & Rollout (Week 6)

**Tasks:**
1. ✅ Complete automated test suite
2. ✅ Manual QA with all role types
3. ✅ Performance testing
4. ✅ Security audit
5. ✅ Production deployment

---

## Best Practices & Security

### Security Best Practices

#### ✅ **DO: Always Check Permissions**

```typescript
// ✅ GOOD - Check before operations
const canEdit = await canEditTask(task.userId);
if (!canEdit) {
  throw new Error("Access denied");
}
await performUpdate();
```

```typescript
// ❌ BAD - No permission check
await db.update(tasks).set(data);
```

#### ✅ **DO: Use Helper Functions**

```typescript
// ✅ GOOD - Centralized logic
const { canViewAll } = await getTaskViewScope();
```

```typescript
// ❌ BAD - Inline permission checking
const permissions = await getUserPermissions(userId, accountId);
const canViewAll = permissions?.tasks?.viewAll ?? false;
// ... duplicated everywhere
```

#### ✅ **DO: Fail Securely**

```typescript
// ✅ GOOD - Deny by default
const canEdit = permissions?.tasks?.editAll ?? false;
```

```typescript
// ❌ BAD - Allow by default
const canEdit = permissions?.tasks?.editAll ?? true; // Dangerous!
```

#### ✅ **DO: Validate at Multiple Layers**

```typescript
// Layer 1: Layout (blocks page access)
// Layer 2: Query (filters data)
// Layer 3: UI (hides buttons)

// This way, even if one layer fails, others protect
```

#### ✅ **DO: Log Permission Denials**

```typescript
// ✅ GOOD - Log security events
if (!canEdit) {
  console.warn(`Permission denied: User ${userId} tried to edit task ${taskId}`);
  throw new Error("Access denied");
}
```

#### ✅ **DO: Use Type Safety**

```typescript
// ✅ GOOD - TypeScript ensures correct permissions
type TaskAction = 'view' | 'edit' | 'delete';

function checkPermission(action: TaskAction) {
  // Type-safe
}
```

### Performance Best Practices

#### ✅ **DO: Cache Permissions**

```typescript
// Already implemented in getUserPermissions()
// Permissions are cached for 15 minutes via getCachedUserRoles()
```

#### ✅ **DO: Batch Permission Checks**

```typescript
// ✅ GOOD - Single call for all permissions
const perms = await getTaskPermissions(task.userId);

if (perms.canEdit) { /* ... */ }
if (perms.canDelete) { /* ... */ }
```

```typescript
// ❌ BAD - Multiple calls
const canEdit = await canEditTask(task.userId);
const canDelete = await canDeleteTask(task.userId);
// Each call fetches permissions separately (though cached)
```

#### ✅ **DO: Apply Filters in SQL**

```typescript
// ✅ GOOD - Database does the filtering
if (!canViewAll) {
  whereConditions.push(eq(tasks.userId, userId));
}
// Returns only authorized records
```

```typescript
// ❌ BAD - Filter in application code
const allTasks = await db.select().from(tasks);
const filtered = allTasks.filter(task => {
  // Inefficient - fetched unauthorized data
  return canViewAll || task.userId === userId;
});
```

### Anti-Patterns to Avoid

#### ❌ **DON'T: Rely Only on UI Protection**

```typescript
// ❌ BAD - Only hiding button
{!isAdmin && <DeleteButton />}

// But query still allows anyone to delete!
export async function deleteTask(id) {
  await db.delete(tasks).where(eq(tasks.id, id));
}
```

```typescript
// ✅ GOOD - Protect at query level too
{canDelete && <DeleteButton />}

export async function deleteTask(id) {
  const canDelete = await canDeleteTask(task.userId);
  if (!canDelete) throw new Error("Access denied");
  await db.delete(tasks).where(eq(tasks.id, id));
}
```

#### ❌ **DON'T: Check Roles Directly in Queries**

```typescript
// ❌ BAD - Hardcoded role checks
const userRole = await getUserRole(userId);
if (userRole.roleId === 3) {
  // Show all tasks
}
```

```typescript
// ✅ GOOD - Permission-based checks
const { canViewAll } = await getTaskViewScope();
if (canViewAll) {
  // Show all tasks
}
```

#### ❌ **DON'T: Skip Account Isolation**

```typescript
// ❌ BAD - No account filter
SELECT * FROM tasks WHERE userId = ?
// User could potentially access tasks from other accounts!
```

```typescript
// ✅ GOOD - Always filter by account
SELECT * FROM tasks
WHERE accountId = ?
  AND userId = ?
```

---

## Performance Optimization

### Caching Strategy

**Current Implementation:**
- ✅ User roles cached for 15 minutes
- ✅ Permissions derived from cached roles
- ✅ Session data cached for 4 hours

**Cache Flow:**
```
Request → getTaskViewScope()
             ↓
getCurrentUserPermissions()
             ↓
getUserPermissions(userId, accountId)
             ↓
getCachedUserRoles(userId, accountId) ← CACHE CHECK
             ↓
[Cache Hit] → Return cached roles → Calculate permissions
[Cache Miss] → DB Query → Cache for 15min → Return
```

### Performance Metrics

**Without Caching:**
- Permission check: ~50-100ms (database query)
- 100 requests = 5-10 seconds DB time

**With Caching:**
- Permission check: ~1-5ms (memory lookup)
- 100 requests = 100-500ms total
- **95% reduction in permission check time**

### Optimization Tips

1. **Reuse Permission Checks**
```typescript
// ✅ GOOD - Single check, reuse result
const perms = await getTaskPermissions(task.userId);
if (perms.canEdit) { /* ... */ }
if (perms.canDelete) { /* ... */ }
```

2. **Parallel Queries**
```typescript
// ✅ GOOD - Fetch data and permissions in parallel
const [tasks, permissions] = await Promise.all([
  db.select().from(tasks),
  getCurrentUserPermissions()
]);
```

3. **Selective Field Fetching**
```typescript
// ✅ GOOD - Only fetch userId for permission check
const [task] = await db
  .select({ id: tasks.id, userId: tasks.userId })
  .from(tasks)
  .where(eq(tasks.id, id));

// Then check permission before fetching full record
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Access Denied" for Admin Users

**Symptoms:**
- Admin users getting "Access denied" errors
- `canViewAll` returning `false` when it should be `true`

**Causes:**
1. Permissions not set correctly in `account_roles` table
2. User assigned wrong role in `user_roles` table
3. Cache not invalidated after permission change

**Solutions:**

```sql
-- Check user's role
SELECT ur.user_id, ur.role_id, r.name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.role_id
WHERE ur.user_id = 'user_123'
  AND ur.is_active = true;

-- Check role permissions
SELECT ar.role_id, ar.permissions
FROM account_roles ar
WHERE ar.account_id = 1125899906842625
  AND ar.role_id = 3  -- Admin role
  AND ar.is_active = true;

-- Verify permissions has tasks.viewAll = true
```

**Fix:**
```typescript
// Invalidate cache after permission change
import { invalidateUserCache } from "~/lib/auth-cache";
await invalidateUserCache(userId, accountId);
```

#### Issue 2: Users Seeing No Data

**Symptoms:**
- Users with legitimate access see empty lists
- `viewAll: false` working correctly, but returns nothing

**Cause:**
- Permission filter AND account filter might be conflicting
- Tasks might not have proper userId assignment

**Debug:**
```typescript
// Add logging to query
const { canViewAll, userId } = await getTaskViewScope();
console.log("Permission check:", { canViewAll, userId });

const whereConditions = [/* ... */];
console.log("WHERE conditions:", whereConditions);

const tasks = await db.select()...;
console.log("Tasks found:", tasks.length);
```

**Check:**
```sql
-- Verify tasks have userId
SELECT task_id, title, user_id, account_id
FROM tasks
WHERE account_id = 1125899906842625;

-- Are there tasks without user_id?
SELECT COUNT(*)
FROM tasks
WHERE user_id IS NULL
  AND account_id = 1125899906842625;
```

#### Issue 3: Performance Degradation

**Symptoms:**
- Slow query responses
- High database CPU usage

**Causes:**
1. Missing indexes on permission-filtered columns
2. N+1 query problems
3. Cache not working

**Solutions:**

```sql
-- Add indexes for permission filtering
CREATE INDEX idx_tasks_account_user
ON tasks(account_id, user_id, is_active);

CREATE INDEX idx_tasks_user_active
ON tasks(user_id, is_active);
```

**Check cache:**
```typescript
import { getCacheStats } from "~/lib/auth-cache";

const stats = getCacheStats();
console.log("Cache hit rate:", stats.metrics.roles.cacheHitRate);

// Should be >90% for good performance
```

#### Issue 4: Permission Changes Not Applying

**Symptoms:**
- Updated permissions in database
- Users still have old permissions

**Cause:**
- Cache not invalidated

**Solution:**
```typescript
// After updating permissions via UI or script
import { invalidateUserCache } from "~/lib/auth-cache";

// Invalidate for specific user
await invalidateUserCache(userId, accountId);

// OR clear all caches (use sparingly)
import { clearAllAuthCache } from "~/lib/auth-cache";
clearAllAuthCache();
```

### Debug Checklist

When permissions aren't working:

- [ ] Check user is authenticated: `const session = await getSecureSession()`
- [ ] Verify user has role assigned: Query `user_roles` table
- [ ] Check role has permissions: Query `account_roles` table
- [ ] Verify JSON structure: `permissions.tasks.viewAll` exists
- [ ] Check cache is working: Call `getCacheStats()`
- [ ] Invalidate cache: `invalidateUserCache(userId, accountId)`
- [ ] Check query logs: Add `console.log()` to permission helpers
- [ ] Verify SQL indexes: Run `EXPLAIN` on slow queries
- [ ] Test with different roles: Create test users

---

## Conclusion

### Summary

This implementation provides:

✅ **Multi-layer security** - Route + Query + Account isolation
✅ **Permission-based access** - Flexible, not hardcoded to roles
✅ **Defense in depth** - Multiple protection layers
✅ **Performance optimized** - Cached permissions, efficient queries
✅ **Easy to extend** - Centralized helpers, clear patterns
✅ **Type-safe** - Full TypeScript support
✅ **Testable** - Clear interfaces for unit testing

### Next Steps

1. **Implement for Tasks** - Start with task queries (highest priority)
2. **Extend to Properties** - Apply same pattern
3. **Extend to Contacts** - Apply same pattern
4. **Update UI** - Hide unauthorized features
5. **Add Tests** - Comprehensive test coverage
6. **Monitor** - Track permission denials, performance

### Resources

- **Helper Functions**: `src/server/queries/permission-helpers.ts`
- **Task Queries**: `src/server/queries/task.ts`
- **Account Roles Query**: `src/server/queries/account-roles.ts`
- **Types**: `src/types/account-roles.ts`
- **Caching**: `src/lib/auth-cache.ts`

---

**Document Version:** 1.0
**Last Updated:** 2025-10-20
**Author:** Claude Code Implementation Team
