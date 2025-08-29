name: "Comments System with CRUD Operations"
description: |

## Purpose

Implement a fully functional comments system for property listings that replaces the current mock implementation with real database operations, supporting hierarchical comments, replies, and full CRUD functionality.

## Core Principles

1. **Database-First**: Use existing comments table schema from the database
2. **Type Safety**: Implement proper TypeScript interfaces and validation
3. **Real-time UX**: Maintain current UI design while adding live data
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

- Full CRUD operations via API endpoints
- Database integration using existing comments table
- User authentication and authorization
- Proper error handling and loading states
- TypeScript interfaces matching database schema
- Maintain existing UI component structure

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

- file: src/types/ (directory)
  why: Need to create comment-related type definitions

- file: src/app/api/ (directory)
  why: Need to create API endpoints for comment operations

- doc: Next.js App Router documentation
  section: API Routes
  critical: API routes go in app/api/ directory with route.ts files

- doc: Drizzle ORM documentation
  section: Database queries and relationships
  critical: Use proper bigint handling for IDs
```

### Current Codebase Structure

```bash
src/
├── app/
│   ├── api/           # API endpoints
│   └── (dashboard)/   # Dashboard routes
├── components/
│   └── propiedades/
│       └── detail/
│           └── comments.tsx  # Current mock implementation
├── server/
│   └── db/
│       └── schema.ts  # Database schema with comments table
├── types/              # TypeScript type definitions
└── lib/               # Utility functions and database access
```

### Desired Codebase Structure

```bash
src/
├── app/
│   └── api/
│       └── comments/
│           ├── route.ts           # GET (list), POST (create)
│           └── [commentId]/
│               └── route.ts       # GET, PUT, DELETE for specific comment
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
// CRITICAL: Next.js requires 'use client' directive for client-side components
// CRITICAL: Drizzle uses bigint for IDs - handle type conversion properly
// CRITICAL: SingleStore database requires proper connection handling
// CRITICAL: User authentication uses BetterAuth with string user IDs
// CRITICAL: Comments table has soft delete (isDeleted flag)
// CRITICAL: Parent-child relationships use self-referencing parentId
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
  - Define API request/response types
  - Export all interfaces

Task 2: Create API Endpoints
CREATE src/app/api/comments/route.ts:
  - GET: List comments for a property/listing
  - POST: Create new comment
  - Handle proper error responses
  - Implement user authentication

CREATE src/app/api/comments/[commentId]/route.ts:
  - GET: Get specific comment
  - PUT: Update comment (owner only)
  - DELETE: Soft delete comment (owner only)
  - Handle authorization properly

Task 3: Update Comments Component
MODIFY src/components/propiedades/detail/comments.tsx:
  - Replace mock data with real API calls
  - Implement proper loading states
  - Add error handling
  - Maintain existing UI design
  - Add edit/delete functionality
  - Implement real-time updates

Task 4: Create Utility Functions
CREATE src/lib/comments.ts:
  - Database query functions
  - Comment formatting utilities
  - Permission checking functions
  - Error handling helpers

Task 5: Integration and Testing
- Test all CRUD operations
- Verify user permissions
- Test reply functionality
- Ensure UI responsiveness
- Validate error handling
```

### Database Operations

```typescript
// Key database operations needed:
// 1. Create comment
INSERT INTO comments (listing_id, property_id, user_id, content, parent_id)

// 2. Read comments with user data
SELECT c.*, u.name, u.avatar FROM comments c 
JOIN users u ON c.user_id = u.id 
WHERE c.property_id = ? AND c.is_deleted = false

// 3. Update comment
UPDATE comments SET content = ?, updated_at = NOW() 
WHERE comment_id = ? AND user_id = ?

// 4. Soft delete comment
UPDATE comments SET is_deleted = true, updated_at = NOW() 
WHERE comment_id = ? AND user_id = ?
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
