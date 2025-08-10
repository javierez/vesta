name: "Operations Dashboard - Real Estate CRM Command Center"
description: |

## Purpose

Comprehensive PRP for implementing a unified Operations Dashboard at `/operations` that provides real estate agents with a command center view of all prospects, leads, deals, urgent tasks, and appointments across both sales and rental operations.

## Core Principles

1. **Executive Summary Design**: Scannable within 5 seconds, actionable immediately
2. **Multi-tenant Security**: Every query filtered by accountId for data isolation
3. **Minimalist Aesthetic**: Consistent with existing gray/white design system
4. **Performance First**: Optimized queries, loading states, mobile responsive

---

## Goal

Build a comprehensive Operations Dashboard at `/operations` that serves as the daily driver for real estate agents. The dashboard must display KPI summaries for Sale vs Rent operations (prospects, leads, deals), urgent work queue (tasks due within 5 working days), today's and tomorrow's appointments, and provide quick actions for common workflows.

## Why

- **Unified Operations View**: Agents currently lack a single place to see all active operations across sales and rentals
- **Task Management**: Critical follow-ups and appointments are scattered across different views
- **Business Intelligence**: Need real-time KPIs to understand pipeline health and workload
- **Productivity**: Quick actions reduce navigation between sections for common workflows
- **Scalability**: Foundation for advanced analytics and pipeline management features

## What

### User-Visible Behavior
- Single-page dashboard at `/operations` with three main sections:
  1. **KPI Summary Cards**: Operations counts by type (Sale/Rent) and status
  2. **Work Queue**: Urgent tasks (due ≤5 working days) + today's/tomorrow's appointments  
  3. **Quick Actions Grid**: Add prospect, create task, view pipelines, schedule appointment

### Technical Requirements
- Server-side data fetching with Next.js App Router and Server Actions
- Real-time operation counts with efficient aggregation queries
- Framer Motion animations consistent with existing dashboard cards
- Multi-tenant data isolation via accountId filtering
- Mobile-responsive grid layout following existing patterns

### Success Criteria

- [ ] Dashboard loads in <2 seconds with skeleton states during loading
- [ ] All operation counts are accurate and filtered by user's account
- [ ] Urgent tasks display correctly ordered by due date (closest first)
- [ ] Today's and tomorrow's appointments show with contact and property context
- [ ] Quick actions navigate to correct routes and maintain user context
- [ ] Mobile responsive design works on 375px+ screen widths
- [ ] Multi-tenant security prevents cross-account data leakage
- [ ] Design matches existing minimalist aesthetic with consistent animations

## All Needed Context

### Documentation & References

```yaml
# Frontend Framework Documentation
- url: https://nextjs.org/docs/app/building-your-application/routing
  why: App Router patterns for /operations page structure and navigation
  
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  why: Server Actions for dashboard data fetching and quick action implementations

- url: https://react-hook-form.com/docs
  why: Form handling for quick action modals (add task, schedule appointment)

# Styling and UI Documentation
- url: https://tailwindcss.com/docs
  why: Utility classes for responsive grid layout and consistent spacing
  
- url: https://ui.shadcn.com/docs/components
  why: Card, Badge, Button, Table, Skeleton components for dashboard structure
  
- url: https://www.framer.com/motion/introduction/
  why: Animation patterns for hover effects and loading transitions
  
- url: https://lucide.dev/icons
  why: Consistent iconography for status indicators and quick actions

# Database Documentation  
- url: https://orm.drizzle.team/docs/overview
  why: Type-safe queries for operation counts and aggregations
  
- url: https://docs.singlestore.com/
  why: Database optimization patterns for multi-tenant filtering and indexing

# Key Pattern Files in Codebase
- file: /src/app/(dashboard)/dashboard/page.tsx
  why: Main dashboard layout structure, grid patterns, container styling
  
- file: /src/components/dashboard/OperacionesEnCursoCard.tsx
  why: Complex card pattern with toggle states, animations, process breakdowns
  
- file: /src/components/dashboard/AccionesRapidasCard.tsx  
  why: Quick actions grid layout, icon+label pattern, navigation routing
  
- file: /src/app/(dashboard)/calendario/page.tsx
  why: Appointment filtering, date range queries, list view patterns

- file: /src/server/db/schema.ts
  why: Complete database structure, multi-tenant relationships, status enums
  
- file: /src/server/queries/contact.ts
  why: Account filtering patterns, aggregation examples, error handling
```

### Current Codebase Tree (Key Areas)

```bash
src/
├── app/
│   └── (dashboard)/
│       ├── dashboard/
│       │   └── page.tsx              # Main dashboard with card grid
│       ├── calendario/
│       │   └── page.tsx              # Calendar/appointment patterns
│       └── layout.tsx                # Dashboard wrapper layout
├── components/
│   ├── dashboard/
│   │   ├── OperacionesEnCursoCard.tsx    # Operations summary card
│   │   └── AccionesRapidasCard.tsx       # Quick actions pattern
│   └── ui/
│       ├── card.tsx                      # shadcn/ui Card components
│       ├── badge.tsx                     # Status indicators
│       ├── button.tsx                    # Action buttons
│       ├── skeleton.tsx                  # Loading states
│       └── table.tsx                     # Data display
├── server/
│   ├── db/
│   │   └── schema.ts                     # Complete database schema
│   └── queries/
│       ├── prospect.ts                   # Prospect CRUD operations
│       ├── lead.ts                       # Lead management
│       ├── deal.ts                       # Deal tracking
│       ├── task.ts                       # Task queries with date filtering
│       ├── appointment.ts                # Appointment scheduling
│       └── contact.ts                    # Multi-tenant query patterns
└── lib/
    ├── auth-client.ts                    # BetterAuth session management
    └── process-data.ts                   # Status workflow definitions
```

### Desired Codebase Tree (Files to Add)

```bash
src/
├── app/
│   └── (dashboard)/
│       └── operations/
│           └── page.tsx                  # Main operations dashboard
├── components/
│   └── dashboard/
│       ├── OperationsSummaryCard.tsx    # KPI cards for operations
│       ├── WorkQueueCard.tsx             # Tasks + appointments queue
│       └── OperationsQuickActionsCard.tsx # Dashboard-specific actions
└── server/
    └── queries/
        └── operations-dashboard.ts       # Aggregated queries for dashboard
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js App Router requires 'use client' for interactive components
// All dashboard cards with animations/interactions need this directive

// CRITICAL: BigInt conversion required for database IDs
// Example: eq(table.id, BigInt(id)) not eq(table.id, id)

// CRITICAL: Multi-tenant security ALWAYS filter by accountId
// Every query MUST include: eq(table.accountId, BigInt(accountId))

// CRITICAL: BetterAuth uses string IDs, database uses bigint for other IDs
// User IDs: string (varchar 36), Contact/Listing/etc IDs: bigint

// CRITICAL: Framer Motion patterns in existing components
// Use whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }} consistently

// CRITICAL: Date filtering for "working days" excludes weekends
// Calculate business days, not calendar days for task urgency

// CRITICAL: SingleStore requires specific SQL patterns for aggregation
// Use sql<number>`` template literals for complex counting queries

// CRITICAL: Error boundaries needed for dashboard data loading
// Wrap async components in try/catch with graceful fallbacks
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Dashboard-specific data types
interface OperationsSummary {
  sale: {
    prospects: { [status: string]: number };
    leads: { [status: string]: number };
    deals: { [status: string]: number };
  };
  rent: {
    prospects: { [status: string]: number };
    leads: { [status: string]: number };
    deals: { [status: string]: number };
  };
}

interface UrgentTask {
  taskId: bigint;
  description: string;
  dueDate: Date;
  entityType: 'prospect' | 'lead' | 'deal' | 'listing' | 'appointment';
  entityId: bigint;
  entityName: string; // Contact name or property address
  daysUntilDue: number;
  completed: boolean;
}

interface TodayAppointment {
  appointmentId: bigint;
  contactName: string;
  propertyAddress?: string;
  startTime: Date;
  endTime: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  appointmentType: string; // viewing, valuation, etc.
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  description: string;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1 - Database Query Layer:
CREATE src/server/queries/operations-dashboard.ts:
  - IMPLEMENT getOperationsSummary(accountId): OperationsSummary
    - COUNT prospects by status and listingType (Sale/Rent)
    - COUNT leads by status with JOIN to listings for Sale/Rent classification  
    - COUNT deals by status with JOIN to listings for Sale/Rent classification
    - USE SQL aggregation with CASE WHEN for efficient counting
    - ENFORCE accountId filtering on ALL subqueries
  
  - IMPLEMENT getUrgentTasks(accountId, workingDaysLimit = 5): UrgentTask[]
    - JOIN tasks with related entities (prospects, leads, deals, listings)
    - CALCULATE business days until due (exclude weekends)
    - ORDER BY dueDate ASC (most urgent first)
    - INCLUDE entity context for display
  
  - IMPLEMENT getTodayAppointments(accountId): TodayAppointment[]
    - FILTER appointments for today and tomorrow
    - JOIN with contacts for names
    - JOIN with listings for property context
    - ORDER BY datetimeStart ASC

Task 2 - Main Dashboard Page:
CREATE src/app/(dashboard)/operations/page.tsx:
  - COPY layout structure from /dashboard/page.tsx
  - IMPLEMENT Server Component pattern for data fetching
  - USE async function with await for all data queries
  - RENDER three main sections: KPIs, Work Queue, Quick Actions
  - ADD error boundaries for graceful failure handling
  - IMPLEMENT responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

Task 3 - Operations Summary Card:
CREATE src/components/dashboard/OperationsSummaryCard.tsx:
  - MIRROR pattern from OperacionesEnCursoCard.tsx
  - IMPLEMENT Sale/Rent toggle with state management
  - DISPLAY operations counts with large typography (text-5xl font-extrabold)
  - ADD status breakdown with badges and colors
  - INCLUDE Framer Motion animations for count changes
  - IMPLEMENT expandable sections for status details

Task 4 - Work Queue Card:
CREATE src/components/dashboard/WorkQueueCard.tsx:
  - DESIGN two-column layout: Tasks (left) | Appointments (right)
  - DISPLAY urgent tasks with days-until-due indicators
  - SHOW today's appointments with time and contact info
  - ADD quick-complete buttons for tasks
  - IMPLEMENT responsive stacking for mobile
  - INCLUDE empty states for no tasks/appointments

Task 5 - Quick Actions Card:
CREATE src/components/dashboard/OperationsQuickActionsCard.tsx:
  - COPY grid pattern from AccionesRapidasCard.tsx
  - IMPLEMENT essential actions: Add Prospect, Add Task, View Pipelines
  - ADD proper routing with next/navigation
  - INCLUDE hover animations and visual feedback
  - IMPLEMENT 2x2 grid with responsive adjustment

Task 6 - Integration & Polish:
MODIFY src/app/(dashboard)/operations/page.tsx:
  - INTEGRATE all dashboard cards into main layout
  - ADD loading states with Skeleton components
  - IMPLEMENT error handling with user-friendly messages
  - ADD page metadata and SEO optimization
  - ENSURE proper TypeScript types throughout
```

### Pseudocode for Core Functions

```typescript
// Task 1: Operations Dashboard Queries
async function getOperationsSummary(accountId: bigint): Promise<OperationsSummary> {
  // PATTERN: Use sql`` template for complex aggregations
  const summaryQuery = await db
    .select({
      saleProspects: sql<number>`
        COUNT(CASE WHEN p.listing_type = 'Sale' THEN 1 END)
      `,
      rentProspects: sql<number>`
        COUNT(CASE WHEN p.listing_type = 'Rent' THEN 1 END) 
      `,
      // ... similar for leads and deals
    })
    .from(prospects)
    .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
    .where(eq(contacts.accountId, accountId)); // CRITICAL: Account filtering

  return formatSummary(summaryQuery);
}

// Task 2: Main Dashboard Server Component  
export default async function OperationsPage() {
  // PATTERN: Fetch data at server component level
  const accountId = await getCurrentUserAccountId(); // From auth context
  
  // GOTCHA: Parallel data fetching for performance
  const [summary, urgentTasks, appointments] = await Promise.all([
    getOperationsSummary(accountId),
    getUrgentTasks(accountId),
    getTodayAppointments(accountId)
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <OperationsSummaryCard data={summary} />
          <WorkQueueCard tasks={urgentTasks} appointments={appointments} />
          <OperationsQuickActionsCard />
        </div>
      </div>
    </div>
  );
}
```

### Integration Points

```yaml
ROUTES:
  - add: /operations page route in Next.js App Router
  - modify: Navigation component to include Operations link
  - pattern: Follow existing dashboard route structure

DATABASE:
  - verify indexes: accountId, status fields, due_date, datetime_start
  - ensure: All entity tables have proper foreign key relationships
  - check: Multi-tenant isolation via accountId filtering

AUTHENTICATION:
  - integrate: BetterAuth session management
  - ensure: getCurrentUserAccountId() function availability
  - verify: User role permissions for operations access

COMPONENTS:
  - reuse: shadcn/ui components (Card, Badge, Button, Skeleton)
  - maintain: Framer Motion animation patterns
  - follow: Existing color scheme and typography scale
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint with auto-fix
npx eslint src/app/\(dashboard\)/operations/ --fix
npx eslint src/components/dashboard/Operations* --fix
npx eslint src/server/queries/operations-dashboard.ts --fix

# Prettier formatting
pnpm format:write

# Expected: No errors. Fix any issues before proceeding.
```

### Level 2: Unit Tests

```typescript
// CREATE __tests__/operations-dashboard.test.ts
describe('Operations Dashboard Queries', () => {
  beforeEach(async () => {
    // Setup test database with multi-tenant data
    await seedTestData();
  });

  it('should return operations summary filtered by account', async () => {
    const summary = await getOperationsSummary(BigInt(1));
    
    expect(summary.sale.prospects).toBeDefined();
    expect(summary.rent.prospects).toBeDefined();
    expect(typeof summary.sale.prospects['New']).toBe('number');
  });

  it('should only return urgent tasks within working days limit', async () => {
    const tasks = await getUrgentTasks(BigInt(1), 5);
    
    tasks.forEach(task => {
      expect(task.daysUntilDue).toBeLessThanOrEqual(5);
      expect(task.daysUntilDue).toBeGreaterThan(0); // Exclude overdue
    });
  });

  it('should prevent cross-tenant data leakage', async () => {
    const account1Summary = await getOperationsSummary(BigInt(1));
    const account2Summary = await getOperationsSummary(BigInt(2));
    
    // Verify data isolation between accounts
    expect(account1Summary).not.toEqual(account2Summary);
  });
});
```

```bash
# Run tests with coverage
pnpm test operations-dashboard.test.ts --coverage
# If failing: Debug queries, check account filtering, verify test data setup
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Test dashboard page loading
curl -v http://localhost:3000/operations
# Expected: 200 OK with HTML content

# Test with browser (manual verification)
# 1. Navigate to http://localhost:3000/operations
# 2. Verify KPI cards display operation counts
# 3. Check work queue shows urgent tasks and appointments
# 4. Confirm quick actions are clickable and route correctly
# 5. Test responsive behavior on mobile viewport (375px)
```

### Level 4: Performance & Creative Validation

```bash
# Database query performance testing
# Analyze EXPLAIN plans for dashboard queries
EXPLAIN SELECT /* operations summary query */;

# Frontend performance testing
# Lighthouse audit for page speed and accessibility
npx lighthouse http://localhost:3000/operations --output html

# Load testing with realistic data volumes
# Test with 1000+ prospects, leads, deals per account

# Security validation
# Verify accountId filtering prevents data leakage
# Test with multiple user sessions from different accounts

# Mobile responsiveness validation  
# Test on viewport sizes: 375px, 768px, 1024px, 1920px
```

## Final Validation Checklist

- [ ] All TypeScript compilation passes: `npx tsc --noEmit`
- [ ] No ESLint errors: `pnpm lint`
- [ ] All unit tests pass: `pnpm test operations-dashboard`
- [ ] Dashboard loads successfully at /operations route
- [ ] KPI cards display accurate operation counts
- [ ] Work queue shows urgent tasks (≤5 working days)
- [ ] Today's appointments display with proper formatting
- [ ] Quick actions navigate to correct destinations
- [ ] Mobile responsive design works on 375px+ screens
- [ ] Multi-tenant security prevents cross-account data access
- [ ] Loading states display during data fetching
- [ ] Error states handle network/database failures gracefully
- [ ] Framer Motion animations match existing dashboard cards
- [ ] Color scheme and typography consistent with design system

---

## Anti-Patterns to Avoid

- ❌ Don't skip accountId filtering in any database query
- ❌ Don't use calendar days for "working days" calculations
- ❌ Don't hardcode status values - use constants/enums
- ❌ Don't create N+1 query problems with separate calls per operation
- ❌ Don't ignore loading states - users need visual feedback
- ❌ Don't break existing animation patterns - follow Framer Motion conventions
- ❌ Don't forget error boundaries - dashboard must handle failures gracefully
- ❌ Don't optimize prematurely - get functionality working first, then optimize
- ❌ Don't create new UI patterns when existing components work
- ❌ Don't forget BigInt conversions for database ID comparisons

## Confidence Score: 9/10

This PRP provides comprehensive context for one-pass implementation success:
- ✅ Complete database schema and query patterns documented
- ✅ Existing UI component patterns identified and referenced
- ✅ All necessary documentation URLs verified and included
- ✅ Multi-tenant security patterns clearly defined
- ✅ Step-by-step implementation plan with specific file modifications
- ✅ Executable validation gates at multiple levels
- ✅ Known gotchas and anti-patterns explicitly called out
- ✅ Success criteria clearly measurable and testable

**Deduction (-1)**: External API integrations (if any) may require additional discovery during implementation.