# Permissions System Architecture - Vesta CRM

**Generated:** 2025-10-23
**Focus:** Property Management Permissions Implementation

---

## Overview

The Vesta CRM implements a comprehensive **Role-Based Access Control (RBAC)** system that manages user permissions across the entire platform. This document explains how permissions work specifically in the properties section (`src/app/(dashboard)/propiedades/` and `src/components/propiedades/`).

## Architecture Layers

The permission system operates across 4 distinct layers:

```
┌─────────────────────────────────────────────────┐
│  1. DATABASE LAYER                              │
│     - users, roles, user_roles, account_roles  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  2. AUTHENTICATION & CACHING LAYER              │
│     - lib/auth.ts, lib/auth-cache.ts           │
│     - lib/dal.ts (Data Access Layer)           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  3. PERMISSION CHECKING LAYER                   │
│     - lib/permissions.ts                        │
│     - app/actions/permissions/check-permissions │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  4. UI COMPONENT LAYER                          │
│     - Components conditionally render/disable   │
│       based on canEdit/canDelete flags          │
└─────────────────────────────────────────────────┘
```

---

## 1. Database Schema

### Tables Involved

#### `users` Table
Stores user authentication information. Each user belongs to an account (organization).

**Key Fields:**
- `id` (varchar, PK) - Unique user identifier (BetterAuth compatible)
- `email` (varchar) - User email
- `name` (varchar) - Full name
- `accountId` (bigint, FK) - Links user to their organization/company
- `is_active` (boolean) - Whether user account is active

#### `roles` Table
Defines global role types that exist across all accounts.

**Key Fields:**
- `roleId` (bigint, PK) - Unique role identifier
- `name` (varchar) - Role name (e.g., "admin", "agent", "viewer")
- `description` (varchar) - Human-readable description
- `permissions` (json) - Default permissions for this role (not used in new system)
- `is_active` (boolean) - Whether role is active

**Default Roles:**
1. **Superadmin** (internal only) - Full system access
2. **Agent** - Can create/edit properties and listings
3. **Account Admin** - Full account management
4. **Office Manager** - Office-level permissions
5. **Inactive** - No permissions

#### `user_roles` Table (Junction Table)
Links users to their assigned roles. Supports many-to-many relationship.

**Key Fields:**
- `userRoleId` (bigint, PK) - Unique assignment ID
- `userId` (varchar, FK) - References users.id
- `roleId` (bigint, FK) - References roles.roleId
- `is_active` (boolean) - Whether this role assignment is active
- `created_at`, `updated_at` - Audit timestamps

#### `account_roles` Table
Stores account-specific role configurations with customizable permissions.

**Key Fields:**
- `accountRoleId` (bigint, PK) - Unique record identifier
- `roleId` (bigint, FK) - References roles.roleId
- `accountId` (bigint, FK) - References accounts.accountId
- **`permissions` (json)** - The actual permissions JSON object (see structure below)
- `is_system` (boolean) - True for default roles that shouldn't be deleted
- `is_active` (boolean) - Whether this role configuration is active

### Permissions JSON Structure

The `account_roles.permissions` field stores a nested JSON object:

```json
{
  "admin": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "calendar": {
    "view": true,
    "edit": true,
    "delete": true
  },
  "contacts": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "properties": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "tasks": {
    "view": true,
    "create": true,
    "edit": true,
    "editAll": true,
    "deleteAll": true
  },
  "tools": {
    "view": true
  }
}
```

**Key Categories:**
- `properties` - Property management permissions
  - `view` - Can view properties
  - `create` - Can create new properties
  - `edit` - Can edit property details
  - `delete` - Can delete properties/listings
- `calendar` - Calendar/appointment permissions
- `contacts` - Contact management permissions
- `tasks` - Task management permissions
- `admin` - Administrative permissions
- `tools` - Tool access permissions

---

## 2. Authentication & Caching Layer

### `lib/dal.ts` - Data Access Layer

Provides secure, account-scoped database access.

**Key Functions:**

#### `getSecureSession(): Promise<SecureSession | null>`
Retrieves the current authenticated user's session with account context.

**Performance Optimization:**
1. First checks middleware headers (fast path)
2. Falls back to `auth.api.getSession()` if headers unavailable
3. Validates user has an `accountId` (required for multi-tenant security)

**Returns:**
```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountId: number;  // Critical for data filtering
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}
```

#### `getCurrentUser()`
Gets current user information, throws error if not authenticated.

#### `getUserPermissionsForCurrentUser()`
Fetches the merged permissions object for the current user from cache/database.

**Process:**
1. Check headers for cached permissions
2. If not in headers, call `getCachedUserRoles()`
3. Return merged permissions from all active roles

### `lib/auth-cache.ts` - Caching Strategy

Implements multi-layer caching to optimize authentication performance.

**Cache Configuration:**
- **Session Cache**: 4-hour TTL
- **Roles Cache**: 4-hour TTL (originally 15 minutes)
- Uses `node-cache` with no object cloning for performance

#### `getCachedUserRoles(userId, accountId): Promise<UserRolesAndPermissions>`

**Cache Flow:**
1. Check cache with key `user_roles:{userId}:{accountId}`
2. If cache hit → return immediately (5-20ms)
3. If cache miss → query database (100-300ms)
4. Store result in cache for 4 hours
5. Return roles and merged permissions

**Performance Metrics:**
- 90% reduction in auth database queries
- 80% reduction in auth latency
- 95% cache hit rate for roles/permissions

#### `invalidateUserCache(userId, accountId)`
Clears all cache entries for a user when roles/permissions change.

### `lib/auth.ts` - Authentication Core

#### `getUserRolesFromDB(userId, accountId): Promise<UserRolesAndPermissions>`

Fetches user roles and permissions from database with complex join:

```sql
SELECT
  roles.name,
  account_roles.permissions
FROM user_roles
INNER JOIN roles ON roles.roleId = user_roles.roleId
INNER JOIN account_roles ON
  account_roles.roleId = roles.roleId AND
  account_roles.accountId = {accountId}
WHERE
  user_roles.userId = {userId} AND
  user_roles.is_active = true AND
  roles.is_active = true AND
  account_roles.is_active = true
```

**Returns:**
```typescript
{
  roles: string[];           // e.g., ["admin", "agent"]
  permissions: PermissionsObject;  // Merged permissions from all roles
}
```

#### `mergePermissions(permissionsArray): PermissionsObject`

Merges multiple permission objects using **OR logic**:
- If ANY role grants a permission → user gets it
- Normalizes boolean and numeric values (1 = true)

**Example:**
```typescript
// Role 1: { properties: { view: true, edit: false } }
// Role 2: { properties: { edit: true, delete: false } }
// Merged: { properties: { view: true, edit: true, delete: false } }
```

---

## 3. Permission Checking Layer

### `lib/permissions.ts`

Defines standard permission constants and role configurations.

**Permission Constants:**
```typescript
export const PERMISSIONS = {
  PROPERTY_VIEW: "property:view",
  PROPERTY_CREATE: "property:create",
  PROPERTY_EDIT: "property:edit",
  PROPERTY_DELETE: "property:delete",
  // ... more permissions
} as const;
```

**Role Permission Mappings:**
```typescript
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // ... all permissions
  ],
  agent: [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    // Note: No PROPERTY_DELETE for agents
  ],
  viewer: [
    PERMISSIONS.PROPERTY_VIEW,
    // Read-only access
  ],
};
```

**Key Functions:**

#### `hasPermission(permission): Promise<boolean>`
Checks if current user has a specific permission.

#### `hasRole(roleName): Promise<boolean>`
Checks if current user has a specific role.

#### `isAdmin(): Promise<boolean>`
Shorthand to check for admin role.

### `app/actions/permissions/check-permissions.ts`

Server actions that can be called from client components.

#### `canEditProperties(): Promise<boolean>`
```typescript
export async function canEditProperties(): Promise<boolean> {
  try {
    const permissions = await getUserPermissionsForCurrentUser();
    return Boolean(permissions.properties?.edit);
  } catch (error) {
    console.error("❌ Error checking edit permission:", error);
    return false;
  }
}
```

**Process:**
1. Calls `getUserPermissionsForCurrentUser()` (cached)
2. Checks `permissions.properties.edit` boolean flag
3. Returns `false` on any error (fail-safe)

#### `canDeleteProperties(): Promise<boolean>`
```typescript
export async function canDeleteProperties(): Promise<boolean> {
  try {
    const permissions = await getUserPermissionsForCurrentUser();
    return Boolean(permissions.properties?.delete);
  } catch (error) {
    console.error("❌ Error checking delete permission:", error);
    return false;
  }
}
```

**Other Permission Checks:**
- `canEditAllTasks()` - Check `permissions.tasks.editAll`
- `canDeleteAllTasks()` - Check `permissions.tasks.deleteAll`
- `canEditCalendar()` - Check `permissions.calendar.edit`
- `canDeleteCalendar()` - Check `permissions.calendar.delete`

---

## 4. UI Component Layer - Property Form Implementation

### File: `src/components/propiedades/form/property-characteristics-form.tsx`

**Lines: 38, 847-848, 869-877**

#### Permission Fetching (During Mount)

```typescript
useEffect(() => {
  const fetchAllFormData = async () => {
    const [
      agentsData,
      potentialOwnersData,
      currentOwnersData,
      listingDetailsData,
      firstImage,
      hasDeletePermission,  // ← Fetched here
      hasEditPermission     // ← Fetched here
    ] = await Promise.all([
      getAllAgentsWithAuth(),
      getAllPotentialOwnersWithAuth(),
      getCurrentListingOwnersWithAuth(listingId),
      getListingDetailsWithAuth(listingId),
      getFirstImage(propertyId),
      canDeleteProperties(),  // Server action call
      canEditProperties(),    // Server action call
    ]);

    // Store in component state
    setCanDelete(hasDeletePermission);
    setCanEdit(hasEditPermission);
  };

  void fetchAllFormData();
}, [listing.listingId, listing.propertyId]);
```

**Performance Note:**
All data fetching happens in parallel using `Promise.all()` for optimal performance.

#### Permission State Management

**Lines: 847-848**
```typescript
const [canDelete, setCanDelete] = useState<boolean>(false);
const [canEdit, setCanEdit] = useState<boolean>(false);
```

**Default Values:** Both default to `false` (fail-safe approach)

#### Passing Permissions to Child Components

**Example: BasicInfoCard (Lines 1286-1309)**
```typescript
<BasicInfoCard
  listing={listing}
  propertyType={propertyType}
  // ... other props
  canEdit={canEdit}  // ← Permission passed down
  onToggleSection={toggleSection}
  onSave={() => saveModule("basicInfo")}
  onUpdateModule={(hasChanges) => updateModuleState("basicInfo", hasChanges)}
  // ... more props
/>
```

**All Form Cards Receive `canEdit` Prop:**
- `BasicInfoCard`
- `PropertyDetailsCard`
- `LocationCard`
- `FeaturesCard`
- `ContactInfoCard`
- `OrientationCard`
- `AdditionalCharacteristicsCard`
- `PremiumFeaturesCard`
- `AdditionalSpacesCard`
- `MaterialsCard`
- `DescriptionCard`
- `RentalPropertiesCard`

#### Delete Actions Conditional Rendering

**Lines: 1655-1683**
```typescript
{canDelete && (
  <div className="mt-6">
    <div className="flex justify-center gap-4 flex-wrap">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsDiscardModalOpen(true)}
      >
        {listing.status === "Descartado"
          ? "Recuperar anuncio"
          : "Descartar anuncio"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={() => setIsDeleteListingModalOpen(true)}
      >
        Borrar anuncio
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={() => setIsDeleteModalOpen(true)}
      >
        Eliminar propiedad
      </Button>
    </div>
  </div>
)}
```

**Behavior:**
- If `canDelete === false`: Buttons are completely hidden (not just disabled)
- If `canDelete === true`: All three action buttons appear:
  1. **Descartar anuncio** - Mark listing as discarded (soft delete)
  2. **Borrar anuncio** - Delete listing only (keeps property)
  3. **Eliminar propiedad** - Delete entire property with all listings

### Card Component Example: `BasicInfoCard`

**File:** `src/components/propiedades/form/cards/basic-info-card.tsx`

**Lines: 32, 55**
```typescript
interface BasicInfoCardProps {
  // ... other props
  canEdit?: boolean;  // ← Permission prop (optional, defaults to true)
  // ... more props
}

export function BasicInfoCard({
  // ... destructured props
  canEdit = true,  // ← Default value
  // ... more props
}: BasicInfoCardProps) {
  // Component implementation
}
```

**How `canEdit` is Used in Components:**

1. **Disable Form Inputs:**
```typescript
<Input
  id="title"
  value={currentTitle}
  onChange={handleTitleChange}
  disabled={!canEdit}  // ← Input disabled when no edit permission
/>
```

2. **Disable Save Buttons:**
```typescript
<Button
  onClick={onSave}
  disabled={!canEdit || saveState === "saving"}
>
  Guardar
</Button>
```

3. **Hide Edit Controls:**
```typescript
{canEdit && (
  <div className="edit-controls">
    {/* Edit-specific UI */}
  </div>
)}
```

---

## Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Loads Property Form Page                              │
│  /propiedades/[id]                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PropertyCharacteristicsForm useEffect() runs               │
│  Calls: Promise.all([                                       │
│    canDeleteProperties(),  // Server action                 │
│    canEditProperties()     // Server action                 │
│  ])                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Action: canEditProperties()                         │
│  Location: app/actions/permissions/check-permissions.ts     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  getUserPermissionsForCurrentUser()                         │
│  Location: lib/dal.ts                                       │
│                                                              │
│  1. Check headers for cached permissions                    │
│  2. If not in headers, call getCachedUserRoles()            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  getCachedUserRoles(userId, accountId)                      │
│  Location: lib/auth-cache.ts                                │
│                                                              │
│  Cache Key: "user_roles:{userId}:{accountId}"               │
│                                                              │
│  ┌─────────────┐                                            │
│  │ Cache Hit?  │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│    ┌────┴────┐                                              │
│    │   YES   │  → Return cached data (5-20ms)              │
│    └─────────┘                                              │
│         │                                                    │
│    ┌────┴────┐                                              │
│    │   NO    │  → Continue to DB query                     │
│    └────┬────┘                                              │
└─────────┼──────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  getUserRolesFromDB(userId, accountId)                      │
│  Location: lib/auth.ts                                      │
│                                                              │
│  SQL Query:                                                 │
│  SELECT roles.name, account_roles.permissions               │
│  FROM user_roles                                            │
│  JOIN roles ON roles.roleId = user_roles.roleId            │
│  JOIN account_roles ON                                      │
│    account_roles.roleId = roles.roleId AND                 │
│    account_roles.accountId = {accountId}                   │
│  WHERE user_roles.userId = {userId}                         │
│    AND user_roles.is_active = true                          │
│    AND roles.is_active = true                               │
│    AND account_roles.is_active = true                       │
│                                                              │
│  Result: { roles: string[], permissions: PermissionsObject }│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  mergePermissions(permissionsArray)                         │
│  Merge all role permissions using OR logic                  │
│                                                              │
│  Example:                                                   │
│  Agent role:  { properties: { edit: true, delete: false } } │
│  Admin role:  { properties: { edit: true, delete: true } }  │
│  ─────────────────────────────────────────────────────────  │
│  MERGED:      { properties: { edit: true, delete: true } }  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Cache Result for 4 Hours                                   │
│  rolesCache.set(cacheKey, result, 4 * 60 * 60)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Return to canEditProperties()                              │
│  Check: Boolean(permissions.properties?.edit)               │
│                                                              │
│  If true → User can edit properties                         │
│  If false → User cannot edit properties                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Return to Component                                        │
│  setCanEdit(hasEditPermission)                              │
│  setCanDelete(hasDeletePermission)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Component Re-renders with Permission Flags                 │
│                                                              │
│  If canEdit = false:                                        │
│    - All input fields are disabled                          │
│    - Save buttons are disabled                              │
│    - Edit controls are hidden                               │
│                                                              │
│  If canDelete = false:                                      │
│    - Delete action buttons are completely hidden            │
│                                                              │
│  If canEdit = true && canDelete = true:                     │
│    - Full editing and deletion capabilities enabled         │
└─────────────────────────────────────────────────────────────┘
```

---

## Permission Check Examples

### Example 1: Admin User

**User Database State:**
- `users.id` = "user-123"
- `users.accountId` = 1
- `user_roles`: roleId = 2 (Account Admin)
- `account_roles` for roleId=2, accountId=1:
  ```json
  {
    "properties": { "view": true, "create": true, "edit": true, "delete": true }
  }
  ```

**Permission Check Result:**
```typescript
canEditProperties() → true   // ✅ Can edit
canDeleteProperties() → true  // ✅ Can delete
```

**UI Behavior:**
- All form fields are **enabled**
- All save buttons are **enabled**
- Delete action buttons are **visible**

---

### Example 2: Agent User

**User Database State:**
- `users.id` = "user-456"
- `users.accountId` = 1
- `user_roles`: roleId = 3 (Agent)
- `account_roles` for roleId=3, accountId=1:
  ```json
  {
    "properties": { "view": true, "create": true, "edit": true, "delete": false }
  }
  ```

**Permission Check Result:**
```typescript
canEditProperties() → true    // ✅ Can edit
canDeleteProperties() → false  // ❌ Cannot delete
```

**UI Behavior:**
- All form fields are **enabled**
- All save buttons are **enabled**
- Delete action buttons are **hidden** (not rendered)

---

### Example 3: Viewer User

**User Database State:**
- `users.id` = "user-789"
- `users.accountId` = 1
- `user_roles`: roleId = 5 (Viewer)
- `account_roles` for roleId=5, accountId=1:
  ```json
  {
    "properties": { "view": true, "create": false, "edit": false, "delete": false }
  }
  ```

**Permission Check Result:**
```typescript
canEditProperties() → false   // ❌ Cannot edit
canDeleteProperties() → false  // ❌ Cannot delete
```

**UI Behavior:**
- All form fields are **disabled** (read-only)
- All save buttons are **disabled**
- Delete action buttons are **hidden** (not rendered)

---

### Example 4: Multi-Role User

**User Database State:**
- `users.id` = "user-999"
- `users.accountId` = 1
- `user_roles`:
  - roleId = 3 (Agent) - has `edit: true, delete: false`
  - roleId = 4 (Office Manager) - has `edit: true, delete: true`

**Merge Process:**
```typescript
// Agent role permissions
{ properties: { view: true, edit: true, delete: false } }

// Office Manager role permissions
{ properties: { view: true, edit: true, delete: true } }

// Merged with OR logic
{ properties: { view: true, edit: true, delete: true } }
```

**Permission Check Result:**
```typescript
canEditProperties() → true   // ✅ Can edit (both roles have it)
canDeleteProperties() → true  // ✅ Can delete (Office Manager grants it)
```

**UI Behavior:**
- All form fields are **enabled**
- All save buttons are **enabled**
- Delete action buttons are **visible**

---

## Performance Characteristics

### Without Caching (Original Implementation)
- Permission check latency: **100-300ms**
- Database queries per page load: **Multiple** (for each permission check)
- Load on database: **High** (constant role/permission queries)

### With Caching (Current Implementation)
- Permission check latency: **5-20ms** (cache hit)
- Database queries per page load: **0-1** (only on cache miss)
- Cache hit rate: **~95%**
- Cache TTL: **4 hours**

### Performance Optimization Strategy

1. **Middleware Headers** (Fastest)
   - Permissions stored in request headers
   - Instant access without function calls
   - Currently not fully implemented due to Edge Runtime limitations

2. **Node Cache** (Fast)
   - In-memory cache with 4-hour TTL
   - 5-20ms access time
   - Current primary optimization

3. **Database Query** (Slowest)
   - Complex 3-table join query
   - 100-300ms access time
   - Only on cache miss (5% of requests)

---

## Security Considerations

### Multi-Tenant Isolation
- All permission checks are scoped to `accountId`
- Users can only access permissions within their organization
- Database queries enforce `account_roles.accountId = {accountId}` constraint

### Fail-Safe Defaults
- All permission checks default to `false` on error
- Component props default to `canEdit = true` (but overridden by permission checks)
- Component state initializes as `canDelete = false, canEdit = false`

### Error Handling
```typescript
try {
  const permissions = await getUserPermissionsForCurrentUser();
  return Boolean(permissions.properties?.edit);
} catch (error) {
  console.error("❌ Error checking edit permission:", error);
  return false;  // ← Fail-safe: deny on error
}
```

### Cache Invalidation
When user roles or permissions change:
```typescript
invalidateUserCache(userId, accountId);
// Clears:
// - Session cache entries for this user
// - Roles cache for this user + account
// - Forces fresh database query on next permission check
```

---

## Common Patterns & Best Practices

### 1. Fetching Permissions in Components

**DO:**
```typescript
useEffect(() => {
  const fetchPermissions = async () => {
    const [hasEdit, hasDelete] = await Promise.all([
      canEditProperties(),
      canDeleteProperties(),
    ]);
    setCanEdit(hasEdit);
    setCanDelete(hasDelete);
  };
  void fetchPermissions();
}, []);
```

**DON'T:**
```typescript
// ❌ Bad: Sequential fetching
const hasEdit = await canEditProperties();
const hasDelete = await canDeleteProperties();
```

### 2. Conditional Rendering Based on Permissions

**Complete Hiding (Recommended for sensitive actions):**
```typescript
{canDelete && (
  <Button variant="destructive" onClick={handleDelete}>
    Delete Property
  </Button>
)}
```

**Disabling (For less sensitive actions):**
```typescript
<Button disabled={!canEdit} onClick={handleEdit}>
  Edit Property
</Button>
```

### 3. Prop Passing with Defaults

```typescript
interface ComponentProps {
  canEdit?: boolean;  // Optional with default
}

export function Component({ canEdit = true }: ComponentProps) {
  // Component will work even if canEdit not provided
  // But parent should always pass explicit permission
}
```

### 4. Form Field Patterns

```typescript
<Input
  id="title"
  value={title}
  onChange={handleChange}
  disabled={!canEdit}  // Disable, don't hide
  className={!canEdit ? "bg-gray-100" : ""}  // Visual feedback
/>
```

---

## Troubleshooting

### Permission Check Returns Wrong Value

**Check:**
1. Is cache stale? Call `invalidateUserCache(userId, accountId)`
2. Are roles active? Check `user_roles.is_active`, `roles.is_active`, `account_roles.is_active`
3. Is user in correct account? Verify `users.accountId` matches expected value
4. Are permissions correctly set in `account_roles.permissions` JSON?

### Delete Buttons Still Visible Despite No Permission

**Debug Steps:**
1. Check `canDelete` state value in component
2. Verify conditional render: `{canDelete && (<Button>...</Button>)}`
3. Check if component receives updated `canDelete` prop
4. Look for conflicting logic that might set `canDelete = true`

### Form Fields Not Disabling for Read-Only Users

**Debug Steps:**
1. Check `canEdit` state value in component
2. Verify all inputs have `disabled={!canEdit}`
3. Check if component receives updated `canEdit` prop
4. Look for local state that might override disabled state

### Performance Issues

**Check:**
1. Cache hit rate: `AuthMetrics.getStats()`
2. Number of permission checks per page load
3. Are permissions being fetched in parallel or sequentially?
4. Is cache TTL appropriate? (Currently 4 hours)

---

## Files Reference Quick Index

| File Path | Purpose |
|-----------|---------|
| `src/server/db/schema.ts` | Database table definitions (users, roles, user_roles, account_roles) |
| `src/lib/dal.ts` | Data Access Layer - session and permission retrieval |
| `src/lib/auth.ts` | Authentication core - role queries and permission merging |
| `src/lib/auth-cache.ts` | Caching layer for roles and permissions (4-hour TTL) |
| `src/lib/permissions.ts` | Permission constants and role configurations |
| `src/app/actions/permissions/check-permissions.ts` | Server actions for permission checks (callable from client) |
| `src/components/propiedades/form/property-characteristics-form.tsx` | Main form component - fetches and distributes permissions |
| `src/components/propiedades/form/cards/basic-info-card.tsx` | Example card component using canEdit prop |

---

## Summary

The Vesta CRM permission system is a robust, multi-layered architecture that:

1. **Stores** permissions in a flexible JSON structure in `account_roles.permissions`
2. **Caches** permissions aggressively (4-hour TTL) for performance
3. **Merges** permissions from multiple roles using OR logic
4. **Checks** permissions via server actions callable from client components
5. **Enforces** permissions in UI by disabling inputs and hiding sensitive actions

**Key Principle:** Permissions flow from database → cache → server action → component state → UI rendering.

**Performance:** 95% cache hit rate, 5-20ms latency on cache hits, 90% reduction in database queries.

**Security:** Multi-tenant isolation, fail-safe defaults, error handling with denial on failure.
