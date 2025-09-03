# Contact Comments and Tasks System Implementation

## Overview
Implementation of a contact-based comments and tasks system similar to the existing property-based system. This allows users to add comments and tasks specific to contacts, separate from property-related functionality.

## Database Schema ✅ COMPLETED

### User Comments Table
- **File**: [`src/server/db/schema.ts`](src/server/db/schema.ts) (lines 670-680)
- **MySQL Table**: [`user_comments_table.sql`](user_comments_table.sql) - Already created in database
- **Structure**: Contact-based comments with hierarchical replies support

```sql
CREATE TABLE user_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contact_id BIGINT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

## Backend Implementation ✅ COMPLETED

### Database Queries
- **File**: [`src/server/queries/user-comments.ts`](src/server/queries/user-comments.ts)
- **Functions**:
  - `getUserCommentsByContactIdWithAuth()` - Get comments for a contact
  - `getContactTasksWithAuth()` - Get tasks for a contact through listing_contact_id
  - `createUserComment()` - Create new comment
  - `updateUserComment()` - Update existing comment
  - `deleteUserComment()` - Soft delete comment

### Server Actions
- **File**: [`src/server/actions/user-comments.ts`](src/server/actions/user-comments.ts)
- **Functions**:
  - `createUserCommentAction()` - Server action for creating comments
  - `updateUserCommentAction()` - Server action for updating comments
  - `deleteUserCommentAction()` - Server action for deleting comments

## Frontend Implementation 🚧 TODO

### 1. Contact Comments Component
- **File**: `src/components/contactos/detail/contact-comments.tsx` ❌ **NEEDS CREATION**
- **Base**: [`src/components/propiedades/detail/comments.tsx`](src/components/propiedades/detail/comments.tsx) (681 lines)
- **Changes**:
  - Replace `listingId`/`propertyId` with `contactId`
  - Use `getUserCommentsByContactIdWithAuth` from user-comments queries
  - Use actions from user-comments server actions
  - Maintain same UI/UX patterns (replies, editing, deletion)

### 2. Contact Tasks Component
- **File**: `src/components/contactos/detail/contact-tareas.tsx` ❌ **NEEDS CREATION**
- **Base**: [`src/components/propiedades/detail/tareas.tsx`](src/components/propiedades/detail/tareas.tsx) (1009 lines)
- **Changes**:
  - Remove property-specific features (keys toggle, property dropdowns)
  - Use `getContactTasksWithAuth` from user-comments queries
  - Query tasks through `listing_contact_id` → `contact_id` relationship
  - Keep agent assignment and due date functionality
  - Maintain optimistic updates and error handling

### 3. Contact Tabs Integration
- **File**: [`src/components/contactos/detail/contact-tabs.tsx`](src/components/contactos/detail/contact-tabs.tsx) ❌ **NEEDS MODIFICATION**
- **Current tabs** (lines 166-174):
  ```typescript
  const tabs = [
    { value: "informacion", label: "Información" },
    ...(showSolicitudes ? [{ value: "solicitudes", label: "Solicitudes" }] : []),
    ...(showPropiedades ? [{ value: "propiedades", label: "Propiedades" }] : []),
  ];
  ```
- **Required changes**:
  - Add "Tareas" and "Comentarios" tabs
  - Add TabsContent sections for new components
  - Follow pattern from [`src/components/propiedades/detail/property-tabs.tsx`](src/components/propiedades/detail/property-tabs.tsx) (lines 200-207, 286-297)

### 4. Types Definition
- **File**: `src/types/user-comments.ts` ❌ **NEEDS CREATION**
- **Base**: [`src/types/comments.ts`](src/types/comments.ts)
- **Required types**:
  - `UserComment`
  - `UserCommentWithUser`
  - `CreateUserCommentFormData`
  - `UpdateUserCommentFormData`
  - `UserCommentActionResult`

## Reference Files

### Existing Property System (for reference)
- **Property Comments**: [`src/components/propiedades/detail/comments.tsx`](src/components/propiedades/detail/comments.tsx)
- **Property Tasks**: [`src/components/propiedades/detail/tareas.tsx`](src/components/propiedades/detail/tareas.tsx)
- **Property Tabs**: [`src/components/propiedades/detail/property-tabs.tsx`](src/components/propiedades/detail/property-tabs.tsx)
- **Property Comments Types**: [`src/types/comments.ts`](src/types/comments.ts)
- **Property Comments Queries**: [`src/server/queries/comments.ts`](src/server/queries/comments.ts)
- **Property Comments Actions**: [`src/server/actions/comments.ts`](src/server/actions/comments.ts)

### Contact System (existing)
- **Contact Tabs**: [`src/components/contactos/detail/contact-tabs.tsx`](src/components/contactos/detail/contact-tabs.tsx)
- **Contact Queries**: [`src/server/queries/contact.ts`](src/server/queries/contact.ts)

### Task System (existing)
- **Task Queries**: [`src/server/queries/task.ts`](src/server/queries/task.ts)
- **Task Types**: [`src/lib/data.ts`](src/lib/data.ts) (Task interface)

## Implementation Steps

### Step 1: Create Types
1. Create `src/types/user-comments.ts`
2. Define interfaces based on existing comments types

### Step 2: Create Contact Comments Component
1. Copy `src/components/propiedades/detail/comments.tsx`
2. Rename to `src/components/contactos/detail/contact-comments.tsx`
3. Replace property-specific logic with contact logic
4. Update imports to use user-comments queries and actions

### Step 3: Create Contact Tasks Component
1. Copy `src/components/propiedades/detail/tareas.tsx`
2. Rename to `src/components/contactos/detail/contact-tareas.tsx`
3. Remove property-specific features
4. Update to use contact-based task queries
5. Maintain core task functionality (create, update, delete, complete)

### Step 4: Update Contact Tabs
1. Modify `src/components/contactos/detail/contact-tabs.tsx`
2. Add new tabs to tabs array
3. Add TabsContent sections for new components
4. Import and integrate new components

### Step 5: Testing
1. Test comment creation, editing, deletion
2. Test task creation, completion, deletion
3. Test reply functionality
4. Verify responsive design
5. Test error handling and loading states

## Technical Notes

### Task-Contact Relationship
- Tasks link to contacts through: `tasks.listingContactId` → `listingContacts.listingContactId` → `listingContacts.contactId`
- Use existing task schema, no new tables needed
- Filter by `listingContacts.contactId` to get all tasks for a contact

### Security
- Account-based access control already implemented in queries
- User can only access comments/tasks for contacts in their account
- User can only edit/delete their own comments

### UI/UX Consistency
- Follow existing Tailwind patterns
- Maintain responsive design
- Use same card layouts and spacing
- Keep optimistic updates and error handling patterns
- Maintain keyboard shortcuts (Cmd+Enter, Esc)

## Status
- ✅ Database schema and queries completed
- ✅ Server actions completed  
- ❌ Frontend components need creation
- ❌ Contact tabs integration needed
- ❌ Types definition needed
