# Contact Comments and Tasks System Implementation PRP

## Goal

Implement a complete contact-based comments and tasks system that mirrors the existing property-based system. This includes creating React components for contact comments, contact tasks, integrating them into the contact tabs interface, and defining proper TypeScript types.

## Why

- **Business value**: Allows users to track discussions and tasks specific to individual contacts, separate from property-related activities
- **Integration with existing features**: Leverages existing UI patterns and backend infrastructure while extending functionality to contact management
- **Problems this solves**: Currently, users can only add comments and tasks to properties. This enables contact-specific workflow management for real estate professionals

## What

Create frontend React components that provide:
- Contact-specific commenting system with hierarchical replies
- Contact-specific task management with due dates and agent assignment  
- Integration into existing contact tabs interface
- Consistent UI/UX with existing property-based systems

### Success Criteria

- [ ] Users can create, edit, and delete comments on contacts
- [ ] Users can reply to comments (hierarchical structure)  
- [ ] Users can create, complete, and delete tasks for contacts
- [ ] Tasks can be assigned to different agents with due dates
- [ ] New "Tareas" tab appears in contact detail view with embedded comments section
- [ ] All functionality respects account-based access control
- [ ] Code passes linting, type checking, and formatting validation
- [ ] UI maintains responsive design and existing visual patterns

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://ui.shadcn.com/docs/components/tabs
  why: Tabs component API and integration patterns for adding new tab sections

- url: https://lucide.dev/guide/packages/lucide-react
  why: Icon component usage patterns and available icons (MessageCircle, Reply, Edit2, Trash2, Plus, Check, etc.)

- url: https://www.radix-ui.com/primitives/docs/components/tabs  
  why: Core Radix UI Tabs primitive documentation for advanced usage

- file: src/components/propiedades/detail/comments.tsx
  why: Complete reference implementation for comments system - UI patterns, state management, optimistic updates

- file: src/components/propiedades/detail/tareas.tsx
  why: Complete reference implementation for tasks system - form handling, agent assignment, due dates

- file: src/components/contactos/detail/contact-tabs.tsx
  why: Integration patterns for adding new tabs and maintaining responsive layout

- file: src/types/comments.ts
  why: Type definitions to mirror for user comments system

- file: src/server/queries/user-comments.ts
  why: Backend API patterns and available query functions

- file: src/server/actions/user-comments.ts
  why: Server action patterns for form submissions and optimistic updates
```

### Current Codebase Structure (Relevant Parts)

```bash
src/
├── components/
│   ├── propiedades/detail/
│   │   ├── comments.tsx          # 681 lines - Reference implementation
│   │   ├── tareas.tsx            # 1009 lines - Reference implementation  
│   │   └── property-tabs.tsx     # Tab integration patterns
│   ├── contactos/detail/
│   │   └── contact-tabs.tsx      # 970 lines - Integration target
│   └── ui/                       # Reusable shadcn/ui components
├── server/
│   ├── queries/
│   │   ├── user-comments.ts      # ✅ COMPLETED - Backend queries
│   │   ├── comments.ts           # Reference patterns
│   │   └── task.ts               # Task query patterns
│   └── actions/
│       ├── user-comments.ts      # ✅ COMPLETED - Server actions  
│       └── comments.ts           # Reference patterns
└── types/
    ├── comments.ts               # Reference type definitions
    └── [user-comments.ts]        # ❌ TO CREATE
```

### Desired Codebase Structure After Implementation

```bash
src/
├── components/contactos/detail/
│   ├── contact-comments.tsx      # ❌ TO CREATE - Standalone comments component
│   ├── contact-tareas.tsx        # ❌ TO CREATE - Tasks with embedded comments
│   └── contact-tabs.tsx          # ✅ TO MODIFY - Add "tareas" tab
└── types/
    └── user-comments.ts          # ❌ TO CREATE - User comment types
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for all interactive components
"use client";

// CRITICAL: All ID conversions between string and BigInt must be handled carefully
// Example: typeof formData.contactId === "string" ? BigInt(formData.contactId) : formData.contactId

// CRITICAL: date-fns locale import required for Spanish date formatting
import { es } from "date-fns/locale";

// CRITICAL: Optimistic updates pattern using useOptimistic hook for React 18
const [optimisticComments, addOptimisticComment] = useOptimistic(comments, reducer);

// GOTCHA: Sonner toast library used for notifications, not react-hot-toast
import { toast } from "sonner";

// GOTCHA: All database queries end with ...WithAuth suffix for account-based access control
// NEVER use base functions without WithAuth suffix

// PATTERN: All form submissions use server actions with proper error handling
// Server actions return: { success: boolean; error?: string; data?: T }

// CRITICAL: Different query patterns for comments vs tasks:
// 1. COMMENTS: Direct relationship - userComments.contactId → contacts.contactId
//    Use getUserCommentsByContactIdWithAuth(contactId) - direct query
// 2. TASKS: Indirect relationship - tasks.listingContactId → listingContacts.listingContactId → listingContacts.contactId  
//    Use getContactTasksWithAuth(contactId) - handles complex join internally

// GOTCHA: Contact tabs use dynamic column count based on number of tabs
// className={`grid w-full grid-cols-${tabs.length}`}
```

## Implementation Blueprint

### Data Models and Structure

Backend is already complete with proper types in queries file:

```typescript
// Already available in src/server/queries/user-comments.ts
export interface UserComment {
  commentId: bigint;
  contactId: bigint;
  userId: string;
  content: string;
  parentId?: bigint | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCommentWithUser extends UserComment {
  user: {
    id: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    initials: string;
  };
  replies: UserCommentWithUser[];
}
```

### List of Tasks to Complete (In Order)

```yaml
Task 1 - Create User Comments Types:
CREATE src/types/user-comments.ts:
  - COPY structure from src/types/comments.ts
  - REPLACE all "Comment" with "UserComment"  
  - REPLACE listingId/propertyId with contactId
  - KEEP same interface patterns and naming conventions

Task 2 - Create Standalone Contact Comments Component:
CREATE src/components/contactos/detail/contact-comments.tsx:
  - COPY entire content from src/components/propiedades/detail/comments.tsx
  - REPLACE all propertyId/listingId references with contactId
  - UPDATE imports to use user-comments queries and actions
  - REPLACE CommentsProps interface to use contactId instead of propertyId/listingId
  - UPDATE all query calls to use getUserCommentsByContactIdWithAuth
  - UPDATE all action calls to use user-comments server actions
  - MAINTAIN identical UI patterns, optimistic updates, and error handling
  - This component will be imported and used INSIDE the ContactTareas component

Task 3 - Create Contact Tasks Component with Embedded Comments:
CREATE src/components/contactos/detail/contact-tareas.tsx:
  - COPY entire content from src/components/propiedades/detail/tareas.tsx
  - REPLACE propertyId/listingId props with contactId prop
  - REMOVE property-specific features (keys toggle lines 604-625, property dropdowns, listing queries)
  - REMOVE leads/deals fetching logic (lines 170-248 and 250-282, 320-352)
  - REMOVE contact dropdown functionality since we're already on a contact page
  - UPDATE tasks query: use getContactTasksWithAuth(contactId) - handles listingContactId join internally
  - KEEP embedded Comments section at bottom (lines 992-1006)
  - REPLACE Comments import with ContactComments import
  - REPLACE Comments component usage with ContactComments component
  - MAINTAIN agent assignment and due date functionality
  - PRESERVE optimistic updates and error handling patterns

Task 4 - Integrate into Contact Tabs:
MODIFY src/components/contactos/detail/contact-tabs.tsx:
  - ADD single "tareas" tab entry to tabs array (lines 166-174) 
  - ADD single TabsContent section for "tareas" 
  - IMPORT ContactTareas component (which includes embedded comments)
  - FOLLOW pattern from property-tabs.tsx for consistent tab integration
  - UPDATE grid-cols class to accommodate new tab count
  - MAINTAIN existing responsive design patterns
```

### Per Task Pseudocode

```typescript
// Task 1 - Types Creation Pattern
// src/types/user-comments.ts
export interface UserComment {
  // MIRROR structure from comments.ts but replace entity references
  commentId: bigint;
  contactId: bigint; // REPLACE listingId/propertyId
  userId: string;
  content: string;
  parentId?: bigint | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task 2 - Comments Component Pattern  
// src/components/contactos/detail/contact-comments.tsx
interface ContactCommentsProps {
  contactId: bigint; // REPLACE propertyId: bigint
  // REMOVE listingId and referenceNumber
  initialComments?: UserCommentWithUser[]; // REPLACE CommentWithUser
  currentUserId?: string;
  currentUser?: {
    id: string;
    name?: string;
    image?: string;
  };
}

// CRITICAL: Update all query calls
const comments = await getUserCommentsByContactIdWithAuth(contactId);
// REPLACE: getCommentsByPropertyIdWithAuth(propertyId)

// Task 3 - Tasks Component with Embedded Comments Pattern
// src/components/contactos/detail/contact-tareas.tsx  
// COPY entire structure from property tareas.tsx including embedded Comments

// REMOVE these property-specific features:
// - toggleListingKeysWithAuth calls
// - property dropdown selections  
// - keys toggle UI elements (lines 604-625)
// - leads/deals fetching logic
// - listing-specific contact dropdown logic

// KEEP these core features:
// - Task creation, editing, deletion
// - Agent assignment via Select components
// - Due date functionality with calendar picker
// - Task completion/status management
// - Optimistic updates with error handling
// - EMBEDDED COMMENTS at bottom (lines 992-1006)

// UPDATE query usage for tasks (complex join):
const tasks = await getContactTasksWithAuth(contactId);
// This query handles: tasks.listingContactId → listingContacts.listingContactId → listingContacts.contactId

// UPDATE query usage for comments (direct):
const comments = await getUserCommentsByContactIdWithAuth(contactId);
// This query handles: userComments.contactId → contacts.contactId (direct)

// REPLACE embedded Comments with ContactComments (lines 992-1006):
// FROM:
<Comments 
  propertyId={propertyId}
  listingId={listingId}
  referenceNumber={referenceNumber}
  initialComments={initialComments}
  currentUserId={session?.user?.id}
  currentUser={session?.user ? {
    id: session.user.id,
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined
  } : undefined}
/>

// TO:
<ContactComments 
  contactId={contactId}
  // Remove all property-specific props
  currentUserId={session?.user?.id}
  currentUser={session?.user ? {
    id: session.user.id,
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined
  } : undefined}
/>

// Task 4 - Tab Integration Pattern  
// MODIFY contact-tabs.tsx - ADD ONLY "tareas" tab (not separate comments)
const tabs = [
  { value: "informacion", label: "Información" },
  ...(showSolicitudes ? [{ value: "solicitudes", label: "Solicitudes" }] : []),
  ...(showPropiedades ? [{ value: "propiedades", label: "Propiedades" }] : []),
  { value: "tareas", label: "Tareas" }, // ADD - includes embedded comments
];

// ADD single TabsContent section:
<TabsContent value="tareas" className="mt-6">
  <ContactTareas 
    contactId={contact.contactId}
  />  
</TabsContent>
```

### Integration Points

```yaml
IMPORTS:
  - add to: src/components/contactos/detail/contact-tabs.tsx
  - pattern: |
    import { ContactTareas } from "./contact-tareas";
  - add to: src/components/contactos/detail/contact-tareas.tsx
  - pattern: |
    import { ContactComments } from "./contact-comments";

TYPES:
  - export from: src/types/user-comments.ts
  - import in: components that use UserComment types

QUERIES:
  - use: getUserCommentsByContactIdWithAuth from src/server/queries/user-comments.ts (direct contactId lookup)
  - use: getContactTasksWithAuth from src/server/queries/user-comments.ts (complex join via listingContactId)

ACTIONS:
  - use: createUserCommentAction, updateUserCommentAction, deleteUserCommentAction
  - from: src/server/actions/user-comments.ts
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck          # TypeScript compilation check
pnpm lint               # ESLint checking  
pnpm lint:fix           # Auto-fix linting issues
pnpm format:write       # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Integration Test

```bash
# Start the development server
pnpm dev

# Navigate to a contact detail page
# http://localhost:3000/contactos/[contactId]

# Verify:
# 1. New "Comentarios" and "Tareas" tabs appear
# 2. Comments tab allows creating/editing/deleting comments
# 3. Replies functionality works with proper nesting
# 4. Tasks tab allows creating/assigning/completing tasks
# 5. All forms handle validation and show proper error states
# 6. Optimistic updates work correctly
# 7. Responsive design maintained across screen sizes
```

### Level 3: Manual Testing Checklist

```bash
# Comment System Testing:
echo "✓ Can create new comment with valid content"
echo "✓ Cannot create comment with empty content (validation)"  
echo "✓ Can edit own comments"
echo "✓ Cannot edit other users' comments"
echo "✓ Can delete own comments with confirmation"
echo "✓ Can reply to comments (hierarchical display)"
echo "✓ Optimistic updates work and revert on error"
echo "✓ Error states display properly with toast notifications"

# Task System Testing:
echo "✓ Can create tasks with title, description, due date"
echo "✓ Can assign tasks to different agents"
echo "✓ Can mark tasks as complete/incomplete"
echo "✓ Can delete tasks with confirmation"  
echo "✓ Tasks load correctly for the specific contact"
echo "✓ Form validation works (required fields)"
echo "✓ Loading states appear during async operations"

# Responsive Design Testing:
echo "✓ Components work on desktop (1920x1080)"
echo "✓ Components work on tablet (768x1024)"
echo "✓ Components work on mobile (375x667)"
echo "✓ Tab navigation works on all screen sizes"
```

### Level 4: Database & Performance Validation

```bash
# Verify database operations
# Check browser network tab for:
# - Efficient query patterns (no N+1 queries)
# - Proper error handling for failed requests
# - Account-based access control working
# - Optimistic updates reverting on server errors

# Performance checks:
# - Components render within 100ms on fast 3G
# - No console errors or warnings
# - Images lazy load properly
# - Keyboard shortcuts work (Cmd+Enter, Esc)
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm typecheck && pnpm lint`
- [ ] No TypeScript errors: `pnpm typecheck`  
- [ ] Code formatted properly: `pnpm format:write`
- [ ] Manual testing successful for all comment operations
- [ ] Manual testing successful for all task operations
- [ ] New tabs integrate properly into contact interface
- [ ] Account-based access control respected
- [ ] Responsive design maintained
- [ ] Error cases handled gracefully with proper user feedback
- [ ] Loading states implemented for all async operations
- [ ] Keyboard shortcuts functional (Cmd+Enter for save, Esc for cancel)

---

## Anti-Patterns to Avoid

- ❌ Don't create new UI patterns when existing ones work perfectly
- ❌ Don't skip the WithAuth suffix on query functions (security issue)
- ❌ Don't hardcode contactId values - always pass as props
- ❌ Don't ignore TypeScript errors with @ts-ignore comments
- ❌ Don't create tasks without proper form validation
- ❌ Don't forget to handle loading and error states
- ❌ Don't skip optimistic updates - users expect instant feedback
- ❌ Don't use different toast library than existing codebase (use sonner)
- ❌ Don't forget 'use client' directive on interactive components
- ❌ Don't mix BigInt and string types without proper conversion

## Confidence Score: 9/10

This PRP provides comprehensive context with:
- ✅ Complete reference implementations to copy and modify
- ✅ Backend already implemented and tested  
- ✅ Clear transformation patterns from property → contact
- ✅ Detailed validation loops with executable commands
- ✅ Specific gotchas and patterns documented
- ✅ External documentation URLs for UI libraries
- ✅ Progressive complexity (types → components → integration)

The high confidence score reflects the thorough backend preparation and clear reference patterns available in the codebase.