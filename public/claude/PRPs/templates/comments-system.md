name: "Comments System with CRUD Operations"
description: |

## Purpose

Implement a fully functional comments system for property listings that replaces the current mock implementation with real database operations, supporting hierarchical comments, replies, and full CRUD functionality.

## Core Principles

1. **Database-First**: Use existing comments table schema from the database
2. **Type Safety**: Implement proper TypeScript interfaces and validation
3. **Server Components**: Use server-side queries and actions instead of API routes
4. **Security**: Implement proper user authentication and authorization

---

## Goal

Replace the mock comments system in `src/components/propiedades/detail/comments.tsx` with a real database-driven implementation that supports Create, Read, Update, Delete operations for comments and replies.

## Why

- **User Experience**: Enable real collaboration and communication around property listings
- **Data Persistence**: Store valuable user interactions and feedback
- **Feature Completeness**: Move from demo functionality to production-ready system
- **Integration**: Connect with existing user authentication and property management

## What

### User-Visible Behavior

- Users can create new comments on property listings
- Users can reply to existing comments (hierarchical structure)
- Users can edit their own comments
- Users can delete their own comments (soft delete)
- Real-time comment updates without page refresh
- Proper user attribution and timestamps
- Responsive design matching existing UI patterns

### Technical Requirements

- Full CRUD operations via server actions and queries
- Database integration using existing comments table
- User authentication and authorization
- Proper error handling and loading states
- TypeScript interfaces matching database schema
- Maintain existing UI component structure
- Use server components pattern like `src/server/queries/listing.ts`

### Success Criteria

- [ ] Comments are stored in and retrieved from database
- [ ] Create, Read, Update, Delete operations work correctly
- [ ] Reply functionality maintains hierarchical structure
- [ ] User permissions are properly enforced
- [ ] UI maintains current design and responsiveness
- [ ] No breaking changes to existing functionality
- [ ] Proper error handling for all operations

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: src/server/db/schema.ts
  why: Contains the comments table structure (lines 657-669)

- file: src/components/propiedades/detail/comments.tsx
  why: Current implementation showing UI design and mock data structure

- file: src/server/queries/listing.ts
  why: Reference for server-side query patterns and database operations

- file: src/server/queries/task.ts
  why: Example of CRUD operations using server queries pattern

- file: src/server/actions/appointments.ts
  why: Example of server actions for mutations and data updates

- file: src/types/ (directory)
  why: Need to create comment-related type definitions

- doc: Next.js App Router documentation
  section: Server Actions and Server Components
  critical: Use server actions for mutations, server queries for data fetching

- doc: Drizzle ORM documentation
  section: Database queries and relationships
  critical: Use proper bigint handling for IDs
```

### Current Codebase Structure

```bash
src/
├── app/
│   └── (dashboard)/   # Dashboard routes
├── components/
│   └── propiedades/
│       └── detail/
│           └── comments.tsx  # Current mock implementation
├── server/
│   ├── queries/       # Server-side data queries
│   ├── actions/       # Server actions for mutations
│   └── db/
│       └── schema.ts  # Database schema with comments table
├── types/              # TypeScript type definitions
└── lib/               # Utility functions and database access
```

### Desired Codebase Structure

```bash
src/
├── server/
│   ├── queries/
│   │   └── comments.ts            # Server-side comment queries
│   └── actions/
│       └── comments.ts            # Server actions for comment CRUD
├── components/
│   └── propiedades/
│       └── detail/
│           └── comments.tsx       # Updated with real data
├── types/
│   └── comments.ts                # Comment type definitions
└── lib/
    └── comments.ts                # Comment utility functions
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Server queries must use "use server" directive at top of file
// CRITICAL: Server actions must use "use server" directive at top of file
// CRITICAL: Always use getCurrentUserAccountId() for security in server functions
// CRITICAL: Drizzle uses bigint for IDs - handle type conversion properly
// CRITICAL: SingleStore database requires proper connection handling
// CRITICAL: User authentication uses BetterAuth with string user IDs
// CRITICAL: Comments table has soft delete (isDeleted flag)
// CRITICAL: Parent-child relationships use self-referencing parentId
// CRITICAL: Use revalidatePath() after mutations to update cached data
```

### Codebase Patterns to Follow

```typescript
// SERVER QUERY PATTERN (from src/server/queries/listing.ts)
"use server";

import { db } from "../db";
import { comments, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUserAccountId } from "../../lib/dal";

export async function getCommentsByPropertyIdWithAuth(propertyId: bigint) {
  const accountId = await getCurrentUserAccountId();
  return getCommentsByPropertyId(propertyId, accountId);
}

// SERVER ACTION PATTERN (from src/server/actions/appointments.ts)
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAccountId, getCurrentUser } from "~/lib/dal";

export async function createCommentAction(formData: CreateCommentFormData) {
  try {
    await getCurrentUserAccountId(); // Security check
    const currentUser = await getCurrentUser();
    
    const result = await db.insert(comments).values({
      listingId: BigInt(formData.listingId),
      propertyId: BigInt(formData.propertyId),
      userId: currentUser.id,
      content: formData.content,
    });
    
    revalidatePath(`/dashboard/propiedades/${formData.propertyId}`);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to create comment" };
  }
}
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core comment interface matching database schema
interface Comment {
  commentId: bigint;
  listingId: bigint;
  propertyId: bigint;
  userId: string;
  content: string;
  parentId?: bigint;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended interface for UI with user data and replies
interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  replies: CommentWithUser[];
}

// API request/response types
interface CreateCommentRequest {
  listingId: bigint;
  propertyId: bigint;
  content: string;
  parentId?: bigint;
}

interface UpdateCommentRequest {
  content: string;
}
```

### Implementation Tasks

```yaml
Task 1: Create Type Definitions
CREATE src/types/comments.ts:
  - Define Comment interface matching database schema
  - Define CommentWithUser interface for UI
  - Define server action request/response types
  - Export all interfaces

Task 2: Create Server Queries
CREATE src/server/queries/comments.ts:
  - getCommentsByPropertyId(propertyId, accountId) - List comments for property
  - getCommentById(commentId, accountId) - Get specific comment
  - Follow pattern from src/server/queries/listing.ts
  - Include user joins and hierarchical structure
  - Handle soft delete filtering

Task 3: Create Server Actions
CREATE src/server/actions/comments.ts:
  - createCommentAction(formData) - Create new comment
  - updateCommentAction(commentId, formData) - Update comment (owner only)
  - deleteCommentAction(commentId) - Soft delete comment (owner only)
  - Follow pattern from src/server/actions/appointments.ts
  - Use getCurrentUserAccountId() for security
  - Use revalidatePath() after mutations

Task 4: Update Comments Component
MODIFY src/components/propiedades/detail/comments.tsx:
  - Replace mock data with server queries
  - Use server actions for mutations
  - Implement proper loading states with React transitions
  - Add error handling with toast notifications
  - Maintain existing UI design
  - Add edit/delete functionality
  - Use optimistic updates for better UX

Task 5: Create Utility Functions
CREATE src/lib/comments.ts:
  - Comment formatting utilities
  - Permission checking functions
  - Error handling helpers
  - Type conversion utilities for bigint

Task 6: Integration and Testing
- Test all CRUD operations
- Verify user permissions
- Test reply functionality
- Ensure UI responsiveness
- Validate error handling
```

### Database Operations (Drizzle Patterns)

```typescript
// Key database operations using Drizzle ORM patterns from codebase:

// 1. Create comment (server action)
const result = await db.insert(comments).values({
  listingId: BigInt(formData.listingId),
  propertyId: BigInt(formData.propertyId),
  userId: currentUser.id,
  content: formData.content,
  parentId: formData.parentId ? BigInt(formData.parentId) : null,
});

// 2. Read comments with user data (server query)
const commentsWithUsers = await db
  .select({
    commentId: comments.commentId,
    listingId: comments.listingId,
    propertyId: comments.propertyId,
    userId: comments.userId,
    content: comments.content,
    parentId: comments.parentId,
    isDeleted: comments.isDeleted,
    createdAt: comments.createdAt,
    updatedAt: comments.updatedAt,
    user: {
      id: users.id,
      name: users.name,
      avatar: users.avatar,
    }
  })
  .from(comments)
  .leftJoin(users, eq(comments.userId, users.id))
  .where(
    and(
      eq(comments.propertyId, propertyId),
      eq(comments.isDeleted, false)
    )
  )
  .orderBy(comments.createdAt);

// 3. Update comment (server action)
await db
  .update(comments)
  .set({ 
    content: formData.content,
    updatedAt: new Date()
  })
  .where(
    and(
      eq(comments.commentId, commentId),
      eq(comments.userId, currentUser.id)
    )
  );

// 4. Soft delete comment (server action)
await db
  .update(comments)
  .set({ 
    isDeleted: true,
    updatedAt: new Date()
  })
  .where(
    and(
      eq(comments.commentId, commentId),
      eq(comments.userId, currentUser.id)
    )
  );
```

### Security Considerations

```typescript
// User authorization rules:
// - Users can only edit/delete their own comments
// - Users can reply to any comment
// - Users can view all non-deleted comments
// - Admin users may have additional permissions

// Input validation:
// - Sanitize comment content
// - Validate property/listing IDs
// - Rate limiting for comment creation
// - Maximum comment length limits
```

### Error Handling

```typescript
// Common error scenarios:
// - Database connection failures
// - Invalid user permissions
// - Comment not found
// - Validation errors
// - Rate limiting exceeded

// User-friendly error messages:
// - "Unable to save comment. Please try again."
// - "You can only edit your own comments."
// - "Comment not found or has been deleted."
```

## Testing Strategy

```yaml
Test 1: Basic CRUD Operations
- Create new comment
- Read comment list
- Update existing comment
- Delete comment (soft delete)

Test 2: Reply Functionality
- Create reply to existing comment
- Verify hierarchical structure
- Test nested reply display

Test 3: User Permissions
- Verify users can only edit own comments
- Test unauthorized access attempts
- Verify proper error responses

Test 4: UI/UX
- Loading states display correctly
- Error messages are user-friendly
- Responsive design maintained
- No breaking changes to existing UI
```

## Success Validation

```bash
# Run these commands to validate implementation:
npm run build          # Should build without errors
npm run lint          # Should pass linting
npm run type-check    # Should pass TypeScript checks

# Manual testing checklist:
- [ ] Comments save to database
- [ ] Comments load from database
- [ ] Edit functionality works
- [ ] Delete functionality works
- [ ] Reply system functions
- [ ] User permissions enforced
- [ ] UI remains responsive
- [ ] Error handling works
```
