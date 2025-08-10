name: "Operations Kanban Boards - Real Estate CRM Pipeline Management"
description: |

## Purpose

Comprehensive PRP for implementing interactive Kanban boards for operations management at `/operations/{prospects|leads|deals}` with List/Kanban view toggle, drag-and-drop functionality, bulk actions, and Sale/Rent filtering. This feature provides an interactive pipeline view that complements the existing operations dashboard.

## Core Principles

1. **Multi-tenant Security**: Every query MUST include accountId filtering for data isolation
2. **Performance First**: Optimized queries, lazy loading, and efficient state management
3. **Mobile Responsive**: Touch-friendly interactions and collapsible layouts
4. **Consistent UX**: Follow existing design patterns and animation conventions

---

## Goal

Build comprehensive Kanban boards for operations management at `/operations/{prospects|leads|deals}` that provide:
- Dynamic route structure supporting three operation types (prospects, leads, deals)
- Seamless List/Kanban view toggle with URL persistence
- Drag-and-drop status updates with server validation
- Sale/Rent filtering with real-time data updates
- Bulk actions for assignment, status updates, and task creation
- Mobile-responsive design maintaining existing aesthetic

## Why

- **Pipeline Visibility**: Agents need visual representation of deal flow and status progression
- **Workflow Efficiency**: Drag-and-drop status updates reduce friction compared to forms
- **Bulk Operations**: Manage multiple operations simultaneously for productivity gains
- **Data Filtering**: Separate Sale and Rent pipelines for focused workflow management
- **Mobile Access**: Field agents need touch-friendly kanban access on mobile devices

## What

### User-Visible Behavior
- Three dedicated routes: `/operations/prospects`, `/operations/leads`, `/operations/deals`
- View toggle button switching between dense table (List) and visual kanban (Kanban) views
- Sale/Rent filter toggle affecting displayed data in real-time
- Drag-and-drop cards between status columns with optimistic updates
- Multi-select checkboxes enabling bulk actions (assign, update status, create tasks)
- Responsive layout: desktop grid, mobile horizontal scroll for kanban

### Technical Requirements
- Next.js App Router dynamic routing with `[type]` parameter
- @dnd-kit integration for accessibility-compliant drag-and-drop
- Server Actions for bulk operations and status updates
- URL-based state management for filters and view mode
- Multi-tenant security with accountId filtering on all queries

### Success Criteria

- [ ] All three operation types load correctly at their respective routes
- [ ] List view displays dense table with operation-specific columns
- [ ] Kanban view renders status columns with draggable cards
- [ ] Drag-and-drop updates status in database with audit trail
- [ ] Sale/Rent filter persists in URL and affects data display
- [ ] Bulk actions complete successfully with proper error handling
- [ ] Mobile view provides horizontal scrolling with touch-friendly interactions
- [ ] Zero cross-tenant data leakage (100% accountId filtering compliance)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://docs.dndkit.com/introduction/getting-started
  why: Core drag-and-drop implementation patterns and accessibility features
  section: DndContext, SortableContext, useDraggable/useDroppable hooks

- url: https://docs.dndkit.com/presets/sortable
  why: Sortable list implementation for kanban columns and status management
  section: SortableContext strategies, onDragEnd callback patterns

- url: https://ui.shadcn.com/docs/components/table  
  why: Dense table layout patterns for List view implementation
  section: Responsive table design, mobile overflow strategies

- url: https://ui.shadcn.com/docs/components/tabs
  why: List/Kanban toggle implementation using Radix UI primitives
  section: TabsList, TabsTrigger for view switching

- url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  why: Dynamic route implementation for `/operations/[type]` pattern
  section: Params handling, generateStaticParams for static generation

- file: /src/app/(dashboard)/contactos/page.tsx
  why: URL-based filtering patterns, useSearchParams implementation, loading states
  critical: Lines 62-79 show URL filter extraction, line 88 shows server query integration

- file: /src/components/dashboard/OperacionesSummaryCard.tsx  
  why: Sale/Rent toggle implementation with state management and Framer Motion animations
  critical: Lines 19-20 toggle state, lines 100-145 toggle button pattern

- file: /src/server/queries/operaciones-dashboard.ts
  why: Multi-tenant query patterns, SQL aggregation, accountId filtering examples
  critical: Lines 76-85 show proper accountId filtering pattern with JOIN

- file: /src/server/queries/prospect.ts
  why: Basic CRUD operations but MISSING accountId filtering (critical security gap)
  critical: ALL functions lack accountId filtering - this MUST be added

- file: /src/app/(dashboard)/contactos/[id]/page.tsx
  why: Dynamic route parameter handling with Next.js App Router
  critical: Lines 6-10 show params Promise unwrapping pattern

- docfile: /operations-kanban-boards-feature.md
  why: Complete feature specification with examples and considerations
```

### Current Codebase Tree

```bash
src/
├── app/(dashboard)/
│   ├── contactos/
│   │   ├── [id]/page.tsx          # Dynamic route pattern
│   │   └── page.tsx               # List view with filtering
│   ├── operaciones/
│   │   └── page.tsx               # Existing operations dashboard
│   └── layout.tsx                 # Dashboard layout wrapper
├── components/
│   ├── dashboard/
│   │   ├── OperacionesSummaryCard.tsx    # Sale/Rent toggle pattern
│   │   └── WorkQueueCard.tsx             # Table display pattern
│   ├── contactos/
│   │   └── table-components/
│   │       └── contact-filter.tsx        # Filter component example
│   └── ui/
│       ├── table.tsx              # shadcn/ui table components  
│       ├── tabs.tsx               # Radix UI tabs for view toggle
│       └── badge.tsx              # Status indicator components
├── server/
│   ├── db/schema.ts               # Database schema definitions
│   └── queries/
│       ├── operaciones-dashboard.ts      # Multi-tenant query patterns
│       ├── prospect.ts            # CRITICAL: Missing accountId filtering
│       ├── lead.ts                # CRITICAL: Missing accountId filtering  
│       └── deal.ts                # CRITICAL: Missing accountId filtering
└── lib/
    └── dal.ts                     # getCurrentUserAccountId function
```

### Desired Codebase Tree

```bash
src/
├── app/(dashboard)/
│   └── operations/
│       └── [type]/
│           └── page.tsx           # Dynamic kanban/list page
├── components/
│   ├── operations/
│   │   ├── KanbanBoard.tsx        # Main kanban implementation
│   │   ├── KanbanColumn.tsx       # Droppable status columns  
│   │   ├── KanbanCard.tsx         # Draggable operation cards
│   │   ├── OperationsTable.tsx    # Dense table view
│   │   ├── ViewToggle.tsx         # List/Kanban toggle component
│   │   ├── FilterToggle.tsx       # Sale/Rent filter component
│   │   └── BulkActions.tsx        # Multi-select bulk operations
│   └── ui/
│       └── kanban/                # Reusable kanban primitives
├── server/
│   ├── actions/
│   │   └── operations.ts          # Server actions for status updates
│   └── queries/
│       └── operations-kanban.ts   # Kanban-specific queries with accountId
└── types/
    └── operations.ts              # TypeScript interfaces for operations
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: @dnd-kit requires installation (not in package.json currently)
// Install: pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

// CRITICAL: Next.js App Router requires 'use client' for dnd-kit components  
// All kanban components need client-side interactivity

// CRITICAL: Multi-tenant security MISSING in current query files
// EVERY query in prospect.ts, lead.ts, deal.ts lacks accountId filtering
// Example FIX needed:
//   WRONG: .where(eq(prospects.status, status))
//   RIGHT: .where(and(eq(prospects.status, status), eq(contacts.accountId, accountId)))

// CRITICAL: BigInt conversion required for database IDs in Next.js
// Example: eq(prospects.id, BigInt(id)) not eq(prospects.id, id)

// CRITICAL: @dnd-kit onDragEnd must handle server validation
// Use optimistic updates with rollback on server error

// CRITICAL: Database schema status values must match operation workflows
// Prospects: "New", "Working", "Qualified", "Archived"
// Leads: "New", "Working", "Converted", "Disqualified"  
// Deals: "Offer", "UnderContract", "Closed", "Lost"

// CRITICAL: Framer Motion conflicts with dnd-kit transforms
// Use CSS transforms instead of layout animations during drag

// CRITICAL: Mobile drag-and-drop requires touch event polyfills
// @dnd-kit handles this automatically but needs proper viewport settings
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core operation types for kanban implementation
interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  items: OperationCard[];
  itemCount: number;
}

interface OperationCard {
  id: bigint;
  type: 'prospect' | 'lead' | 'deal';
  status: string;
  listingType: 'Sale' | 'Rent';
  // Prospect-specific fields
  contactName?: string;
  needSummary?: string;
  urgencyLevel?: number;
  lastActivity?: Date;
  nextTask?: string;
  // Lead-specific fields  
  listingAddress?: string;
  source?: string;
  // Deal-specific fields
  amount?: number;
  closeDate?: Date;
  participants?: string[];
}

interface KanbanViewProps {
  operationType: 'prospects' | 'leads' | 'deals';
  listingType: 'sale' | 'rent' | 'all';
  columns: KanbanColumn[];
  onCardMove: (cardId: bigint, fromColumn: string, toColumn: string) => Promise<void>;
  onBulkAction: (action: BulkActionType, cardIds: bigint[]) => Promise<void>;
}

// Zod schemas for server action validation
const StatusUpdateSchema = z.object({
  operationId: z.string().transform(val => BigInt(val)),
  operationType: z.enum(['prospects', 'leads', 'deals']),
  fromStatus: z.string(),
  toStatus: z.string(),
  accountId: z.string().transform(val => BigInt(val)),
});

const BulkActionSchema = z.object({
  action: z.enum(['assign', 'updateStatus', 'createTasks']),
  operationIds: z.array(z.string().transform(val => BigInt(val))),
  operationType: z.enum(['prospects', 'leads', 'deals']),
  targetValue: z.string().optional(), // For assign user ID or new status
  accountId: z.string().transform(val => BigInt(val)),
});
```

### List of Tasks to be Completed

```yaml
Task 1 - Install Dependencies and Setup:
MODIFY package.json:
  - ADD "@dnd-kit/core": "^6.0.8"
  - ADD "@dnd-kit/sortable": "^8.0.0"  
  - ADD "@dnd-kit/utilities": "^3.2.2"
  - RUN: pnpm install

CREATE src/types/operations.ts:
  - DEFINE KanbanColumn, OperationCard, BulkActionType interfaces
  - EXPORT Zod validation schemas for server actions
  - INCLUDE proper TypeScript types for all operation variants

Task 2 - Fix Critical Security Gap in Existing Queries:
MODIFY src/server/queries/prospect.ts:
  - ADD getCurrentUserAccountId import from ~/lib/dal
  - WRAP all functions with accountId filtering
  - CREATE withAuth wrapper functions (getAllProspectsWithAuth, etc.)
  - ENFORCE: eq(contacts.accountId, accountId) in all queries via JOIN

MODIFY src/server/queries/lead.ts:
  - MIRROR prospect.ts security patterns
  - ENSURE all functions filter by accountId through contact relationship
  - ADD proper error handling for unauthorized access

MODIFY src/server/queries/deal.ts:
  - IMPLEMENT accountId filtering through listings->properties->accountId chain
  - VERIFY BigInt conversion consistency across all ID comparisons
  - MAINTAIN existing function signatures for backward compatibility

Task 3 - Create Dynamic Route Structure:
CREATE src/app/(dashboard)/operations/[type]/page.tsx:
  - COPY layout pattern from src/app/(dashboard)/contactos/page.tsx
  - VALIDATE type parameter: prospects, leads, or deals (404 for invalid)
  - IMPLEMENT parallel data fetching for kanban columns and items
  - ADD proper TypeScript typing for params: Promise<{ type: string }>
  - INCLUDE error boundaries and loading states with Suspense

Task 4 - Build Core Kanban Components:
CREATE src/components/operations/KanbanBoard.tsx:
  - IMPLEMENT DndContext with proper sensors (PointerSensor, KeyboardSensor)
  - HANDLE onDragEnd with optimistic updates and rollback on error
  - MANAGE drag overlay with DragOverlay component for smooth UX
  - INTEGRATE with server actions for status update persistence

CREATE src/components/operations/KanbanColumn.tsx:
  - USE useDroppable hook with unique column ID
  - IMPLEMENT SortableContext for items within column
  - DISPLAY status title, item count, and add-new-item button
  - HANDLE empty state with proper visual feedback

CREATE src/components/operations/KanbanCard.tsx:
  - USE useSortable hook for drag functionality
  - RENDER operation-specific data based on type (prospect/lead/deal)
  - INCLUDE status badges, urgency indicators, and quick actions
  - IMPLEMENT selection checkbox for bulk operations

Task 5 - Build List View Components:
CREATE src/components/operations/OperationsTable.tsx:
  - COPY table pattern from src/components/ui/table.tsx  
  - IMPLEMENT operation-specific columns based on type
  - ADD sorting, filtering, and pagination capabilities
  - INCLUDE bulk action checkbox selection in header and rows

CREATE src/components/operations/TableRow.tsx:
  - RENDER operation data in dense table format
  - INCLUDE status badge, last activity, next task information
  - IMPLEMENT row selection and hover effects
  - ADD quick edit actions (status change, assign user)

Task 6 - Implement View and Filter Controls:
CREATE src/components/operations/ViewToggle.tsx:
  - USE shadcn/ui Tabs components for List/Kanban toggle
  - PERSIST selection in URL searchParams
  - IMPLEMENT smooth transition animations with Framer Motion
  - HANDLE view-specific state management (selection clearing)

CREATE src/components/operations/FilterToggle.tsx:
  - COPY pattern from OperacionesSummaryCard.tsx lines 100-145
  - IMPLEMENT Sale/Rent/All toggle with URL persistence
  - ADD visual feedback with active states and animations
  - TRIGGER real-time data refetch on filter change

Task 7 - Build Server Actions and Queries:
CREATE src/server/actions/operations.ts:
  - IMPLEMENT updateOperationStatus with Zod validation
  - CREATE bulkUpdateOperations for multi-item operations
  - ADD proper error handling and audit trail logging
  - ENSURE accountId validation on all operations

CREATE src/server/queries/operations-kanban.ts:
  - IMPLEMENT getKanbanData(type, listingType, accountId) with proper JOINs
  - CREATE getOperationsByStatus with efficient aggregation
  - ADD getOperationDetails for card display data
  - OPTIMIZE queries with proper indexes and pagination

Task 8 - Integration and Polish:
MODIFY src/app/(dashboard)/operations/[type]/page.tsx:
  - INTEGRATE all components with proper data flow
  - IMPLEMENT view mode persistence and filter state
  - ADD proper SEO metadata and page titles
  - HANDLE loading states and error boundaries

CREATE src/components/operations/BulkActions.tsx:
  - IMPLEMENT multi-select state management
  - CREATE dropdown menu with assign, status update, task creation
  - ADD confirmation dialogs for destructive operations
  - PROVIDE user feedback during async operations

UPDATE src/components/layout/dashboard-layout.tsx:
  - ADD navigation links to operations kanban boards
  - IMPLEMENT breadcrumb navigation for operation context
  - MAINTAIN active state highlighting for current operation type
```

### Pseudocode for Core Functions

```typescript
// Task 4: Core Kanban Implementation
function KanbanBoard({ operationType, listingType, initialData }) {
  // PATTERN: DndContext with custom collision detection
  const [columns, setColumns] = useState(initialData);
  const [activeId, setActiveId] = useState(null);

  // CRITICAL: Handle drag end with database sync
  async function handleDragEnd(event) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // PATTERN: Optimistic update for instant feedback
    const optimisticUpdate = moveCardBetweenColumns(active.id, over.id);
    setColumns(optimisticUpdate);
    
    try {
      // GOTCHA: Must validate accountId on server
      await updateOperationStatusAction({
        operationId: active.id,
        operationType,
        fromStatus: active.data.current.status,
        toStatus: over.id,
      });
    } catch (error) {
      // CRITICAL: Rollback on server error
      setColumns(initialData);
      toast.error('Failed to update status');
    }
  }

  return (
    <DndContext
      sensors={sensors} // GOTCHA: Include keyboard and pointer sensors
      collisionDetection={closestCorners}
      onDragStart={setActiveId}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => (
          <SortableContext key={column.id} items={column.items}>
            <KanbanColumn column={column} operationType={operationType} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeId ? <KanbanCard id={activeId} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Task 7: Server Action with Security
async function updateOperationStatusAction(data: StatusUpdateSchema) {
  const currentUserId = await getCurrentUser();
  const accountId = await getCurrentUserAccountId();
  
  // CRITICAL: Validate data and account access
  const validated = StatusUpdateSchema.parse({ ...data, accountId });
  
  // PATTERN: Transaction for consistency
  await db.transaction(async (tx) => {
    // CRITICAL: Verify operation belongs to user's account
    const operation = await getOperationWithAccountValidation(
      validated.operationId,
      validated.operationType,
      validated.accountId
    );
    
    if (!operation) {
      throw new Error('Operation not found or access denied');
    }
    
    // PATTERN: Validate status transition is allowed
    if (!isValidStatusTransition(validated.fromStatus, validated.toStatus)) {
      throw new Error('Invalid status transition');
    }
    
    // Update operation status
    await updateOperationInDatabase(validated);
    
    // PATTERN: Create audit trail
    await createStatusChangeHistory({
      operationId: validated.operationId,
      operationType: validated.operationType,
      fromStatus: validated.fromStatus,
      toStatus: validated.toStatus,
      changedBy: currentUserId,
      timestamp: new Date(),
    });
  });
  
  revalidatePath(`/operations/${validated.operationType}`);
}
```

### Integration Points

```yaml
DATABASE:
  - verify: accountId indexes exist on contacts, properties tables
  - add: status_history table for audit trail of status changes
  - ensure: Foreign key constraints for data integrity

ROUTES:  
  - add: /operations/prospects, /operations/leads, /operations/deals
  - update: Navigation component with operations submenu
  - maintain: Existing /operations dashboard as landing page

AUTHENTICATION:
  - integrate: getCurrentUserAccountId() for all operations
  - enforce: Role-based permissions for bulk actions
  - validate: Session tokens for drag-and-drop API calls

COMPONENTS:
  - reuse: shadcn/ui primitives (Table, Tabs, Badge, Button)
  - extend: Existing dashboard component patterns and animations
  - maintain: Framer Motion consistency across interactions
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Install dependencies and check for installation success  
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm install

# TypeScript compilation with strict checks
npx tsc --noEmit
# Expected: No errors. Fix any @dnd-kit type imports or missing dependencies.

# ESLint with auto-fix capability
pnpm lint:fix
# Expected: No linting errors. Fix any unused imports or accessibility warnings.

# Prettier code formatting
pnpm format:write
# Expected: Consistent formatting across all new files.

# Build verification to catch import/export issues
pnpm build
# Expected: Clean build. Fix any missing exports or circular dependencies.
```

### Level 2: Unit Tests (Create test files for new components)

```typescript
// CREATE src/components/operations/__tests__/KanbanBoard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';

describe('KanbanBoard', () => {
  const mockProps = {
    operationType: 'prospects' as const,
    listingType: 'sale' as const,
    columns: [
      { id: 'New', title: 'New', status: 'New', items: [], itemCount: 0 },
      { id: 'Working', title: 'Working', status: 'Working', items: [], itemCount: 0 }
    ],
    onCardMove: jest.fn(),
    onBulkAction: jest.fn(),
  };

  it('should render all columns correctly', () => {
    render(<KanbanBoard {...mockProps} />);
    
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('should handle card drag and drop between columns', async () => {
    const mockOnCardMove = jest.fn().mockResolvedValue(undefined);
    render(<KanbanBoard {...mockProps} onCardMove={mockOnCardMove} />);
    
    // Simulate drag and drop (requires more setup with @dnd-kit testing utils)
    // This is a basic example - full implementation would need DndProvider wrapper
    
    expect(mockOnCardMove).toHaveBeenCalledWith(
      expect.any(BigInt),
      'New',
      'Working'
    );
  });

  it('should handle bulk action selection', async () => {
    render(<KanbanBoard {...mockProps} />);
    
    // Test bulk selection functionality
    const selectAllCheckbox = screen.getByLabelText('Select all');
    fireEvent.click(selectAllCheckbox);
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Actions')).toBeVisible();
    });
  });
});
```

```bash
# Run unit tests (after creating test files)
pnpm test -- --testPathPattern=operations
# If failing: Check component imports, mock server actions, verify test data
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Test routes are accessible
curl -I http://localhost:3000/operations/prospects
curl -I http://localhost:3000/operations/leads  
curl -I http://localhost:3000/operations/deals
# Expected: 200 OK responses, not 404 or 500 errors

# Test invalid route handling
curl -I http://localhost:3000/operations/invalid
# Expected: 404 Not Found response

# Manual browser testing checklist:
echo "✓ Navigate to /operations/prospects"
echo "✓ Verify List/Kanban toggle works"  
echo "✓ Test Sale/Rent filter functionality"
echo "✓ Drag cards between columns (desktop)"
echo "✓ Touch drag on mobile viewport (375px width)"
echo "✓ Bulk select multiple items"
echo "✓ Execute bulk action (assign, status update)"
echo "✓ Check data persistence after page refresh"
echo "✓ Verify no data leakage between accounts (switch users)"
```

### Level 4: Performance & Creative Validation

```bash
# Database query performance analysis
# Check explain plans for kanban data queries
EXPLAIN SELECT /* kanban operations query */;

# Performance testing with realistic data
# Load test with 100+ prospects/leads/deals per account
# Measure page load time, drag responsiveness, bulk action speed

# Security validation critical for multi-tenant app
# Create test accounts and verify data isolation
# Test: User A cannot see or modify User B's operations
# Verify: All queries include proper accountId filtering

# Mobile responsiveness validation
# Test viewport sizes: 375px (mobile), 768px (tablet), 1024px (desktop)
# Verify: Horizontal scroll on mobile kanban, collapsible table columns

# Accessibility validation  
# Test: Keyboard navigation through kanban columns
# Verify: Screen reader compatibility with drag-and-drop
# Check: Color contrast ratios for status badges

# Load testing for performance
# Test with 1000+ operations per kanban board
# Measure: Initial load time (<2 seconds), drag performance (60fps)
# Verify: No memory leaks during extended drag sessions
```

## Final Validation Checklist

- [ ] All dependencies installed: `pnpm list @dnd-kit/core @dnd-kit/sortable`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Clean build: `pnpm build`
- [ ] Routes accessible: `/operations/prospects`, `/operations/leads`, `/operations/deals`
- [ ] List view displays operation-specific columns correctly
- [ ] Kanban view renders draggable cards in status columns
- [ ] Drag-and-drop updates database with proper validation
- [ ] Sale/Rent filter persists in URL and affects data display
- [ ] Bulk actions work with proper error handling
- [ ] Mobile responsive: horizontal scroll, touch-friendly interactions
- [ ] Multi-tenant security: zero cross-account data leakage
- [ ] All queries include accountId filtering
- [ ] Status transitions follow defined workflows
- [ ] Audit trail created for all status changes
- [ ] Loading states prevent layout shift
- [ ] Error boundaries handle failures gracefully

---

## Anti-Patterns to Avoid

- ❌ Don't skip accountId filtering - critical security requirement for multi-tenant app
- ❌ Don't use react-beautiful-dnd - deprecated, use @dnd-kit instead
- ❌ Don't ignore mobile drag-and-drop - implement proper touch interactions
- ❌ Don't create N+1 queries - optimize with proper JOINs and aggregation
- ❌ Don't skip status transition validation - enforce business rules
- ❌ Don't forget BigInt conversions - database IDs are bigint type
- ❌ Don't mix server and client state - use optimistic updates with rollback
- ❌ Don't hardcode status values - use constants matching operation workflows
- ❌ Don't ignore concurrent updates - handle race conditions gracefully
- ❌ Don't skip audit trail - track all status changes for compliance

## Confidence Score: 9/10

This PRP provides comprehensive context for successful one-pass implementation:
- ✅ Complete codebase analysis with existing patterns identified
- ✅ External research on modern @dnd-kit implementation practices
- ✅ Critical security gaps identified and addressed (missing accountId filtering)
- ✅ Step-by-step implementation plan with specific file modifications
- ✅ Executable validation gates at multiple levels
- ✅ Mobile-responsive design patterns documented
- ✅ Known gotchas and anti-patterns explicitly called out
- ✅ Success criteria clearly measurable and testable

**Deduction (-1)**: Complex drag-and-drop state management may require iteration during implementation to handle edge cases and concurrent user updates.