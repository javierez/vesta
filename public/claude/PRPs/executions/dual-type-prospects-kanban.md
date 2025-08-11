name: "Enhanced Dual-Type Prospects Kanban Board - Real Estate CRM with Spanish Localization"
description: |

## Purpose

Comprehensive PRP for implementing an advanced prospects management system that handles two distinct prospect types within a unified kanban interface. This feature extends the existing sophisticated kanban implementation to support both listing prospects (clients wanting to sell/rent properties) and search prospects (clients looking for properties) with different status workflows, data models, and Spanish localization throughout.

## Core Principles

1. **Dual-Entity Architecture**: Handle two different data models (listing-based vs. prospect-based) in the same UI
2. **Spanish-First Localization**: All UI text, status labels, and user messages in Spanish
3. **Multi-Tenant Security**: Enforce accountId filtering throughout to prevent data leakage
4. **Performance-Optimized**: Use React.memo, proper memoization, and @dnd-kit best practices
5. **Mobile-Responsive**: Touch-friendly drag interactions with horizontal scrolling support

---

## Goal

Build a comprehensive dual-type prospects kanban board at `/operaciones/prospects` that:
- Renders different card layouts based on prospect type (listing vs. search)
- Supports distinct status workflows for each prospect type
- Maintains existing drag-and-drop functionality across both data models
- Provides intelligent filtering between listing types (Sale/Rent) and prospect types
- Uses Spanish localization throughout the interface
- Ensures multi-tenant security with proper accountId filtering
- Delivers mobile-responsive touch interactions

## Why

- **Unified Workflow**: Real estate agents need to manage both types of prospects (people wanting to sell AND people wanting to buy) in a single interface
- **Spanish Market Focus**: Interface must be fully localized for Spanish-speaking real estate professionals
- **Improved Conversion Tracking**: Different status workflows help agents track progress more accurately for each prospect type
- **Enhanced User Experience**: Visual differentiation between prospect types while maintaining familiar drag-and-drop interactions
- **Security Compliance**: Fix existing security vulnerabilities in prospect data access for multi-tenant architecture

## What

### User-Visible Behavior
- **Dual-Type Cards**: Cards display different information based on prospect type:
  - *Listing Prospects*: Property details, valuation status, listing preparation phase
  - *Search Prospects*: Search criteria, budget range, preferred areas, urgency level
- **Dynamic Status Columns**: Column structure adapts based on prospect type filtering:
  - *Listing Prospects*: "Información básica" → "Valoración" → "Hoja de encargo" → "En búsqueda"
  - *Search Prospects*: "Información básica" → "En búsqueda"
- **Smart Filtering**: Toggle between "Venta", "Alquiler", and "Todos" with real-time count updates
- **Spanish Interface**: All labels, status names, and user messages in Spanish
- **Mobile-Optimized**: Horizontal scroll kanban with touch-friendly drag interactions

### Technical Requirements
- Extend existing `@dnd-kit` implementation to handle dual data models
- Add discriminator field to prospects table for type identification
- Implement conditional rendering based on prospect type
- Maintain existing multi-tenant security patterns
- Add proper BigInt handling for database IDs
- Create Spanish status translation mappings
- Implement performance optimizations for large datasets

### Success Criteria

- [ ] Both listing and search prospects display in unified kanban interface
- [ ] Different card layouts render correctly based on prospect type
- [ ] Status workflows function properly for each prospect type
- [ ] Drag-and-drop updates database with proper validation and Spanish error messages
- [ ] Sale/Rent filter works correctly for both prospect types
- [ ] All UI text displays in Spanish with consistent terminology
- [ ] Multi-tenant security prevents cross-account data access
- [ ] Mobile drag interactions work smoothly with touch gestures
- [ ] Performance remains optimal with 100+ prospects per board
- [ ] No TypeScript errors and all linting passes

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window

# @dnd-kit Implementation Patterns
- url: https://docs.dndkit.com/introduction/getting-started
  why: Core drag-and-drop implementation patterns and accessibility features
  section: DndContext setup, collision detection strategies

- url: https://docs.dndkit.com/presets/sortable
  why: Sortable list implementation for kanban columns with performance optimization
  section: SortableContext strategies, onDragEnd callback patterns, React.memo usage

- url: https://docs.dndkit.com/api-documentation/sensors
  why: Touch and keyboard sensor configuration for mobile compatibility
  section: PointerSensor, KeyboardSensor setup for accessibility

# Next.js App Router Multi-Tenant Patterns  
- url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  why: Dynamic route implementation for /operaciones/[type] pattern
  section: Params handling, generateStaticParams for static generation

- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
  why: Server actions for status updates with validation and error handling
  section: Error handling, revalidatePath usage

# shadcn/ui Component Patterns
- url: https://ui.shadcn.com/docs/components/tabs
  why: List/Kanban toggle implementation using Radix UI primitives
  section: TabsList, TabsTrigger for view switching with state persistence

- url: https://ui.shadcn.com/docs/components/badge
  why: Status indicator components with color coding for Spanish labels
  section: Variant patterns, custom styling approaches

# External Best Practices Research
- url: https://blog.logrocket.com/build-kanban-board-dnd-kit-react/
  why: Performance optimization techniques for large kanban boards
  section: React.memo patterns, drag overlay optimization

# CRITICAL CODEBASE FILES - Security and Patterns

- file: /src/components/operations/KanbanBoard.tsx
  why: Sophisticated drag-and-drop implementation with @dnd-kit, optimistic updates, error handling
  critical: Lines 45-78 show optimistic update pattern with rollback, lines 89-120 show status validation

- file: /src/components/operations/KanbanCard.tsx  
  why: Operation-specific rendering patterns with switch statement for different entity types
  critical: Lines 67-89 renderOperationContent() method shows how to handle multiple operation types

- file: /src/components/operations/KanbanColumn.tsx
  why: Column structure with status translation and color coding for Spanish labels
  critical: Lines 23-34 show STATUS_TRANSLATIONS usage, lines 45-56 show empty state handling

- file: /src/server/queries/operations-kanban.ts
  why: Complex multi-table JOIN patterns with proper accountId filtering for multi-tenancy
  critical: Lines 76-95 show security-compliant query patterns with account-based filtering

- file: /src/server/queries/prospect.ts
  why: CRITICAL SECURITY GAP - Missing accountId filtering on all CRUD operations
  critical: ALL functions lack accountId filtering - this MUST be fixed before UI implementation

- file: /src/types/operations.ts
  why: Status translation patterns and TypeScript interfaces for operations
  critical: Lines 15-35 STATUS_TRANSLATIONS for Spanish labels, lines 67-89 OperationCard interface

- file: /src/components/dashboard/OperacionesSummaryCard.tsx
  why: Sale/Rent toggle implementation with Spanish labels and Framer Motion animations
  critical: Lines 89-145 toggle button pattern, lines 45-67 count display logic

- file: /src/app/(dashboard)/operaciones/[type]/page.tsx
  why: Dynamic routing with type validation and URL parameter handling
  critical: Lines 12-25 type validation logic, lines 34-56 search params extraction

- file: /src/server/db/schema.ts
  why: Complete database schema with multi-tenant patterns and relationship definitions
  critical: Lines 234-267 prospects table schema, lines 89-123 multi-tenant accountId patterns
```

### Current Codebase Tree

```bash
src/
├── app/(dashboard)/
│   ├── operaciones/
│   │   ├── [type]/
│   │   │   └── page.tsx              # Dynamic routing for prospects/leads/deals
│   │   └── page.tsx                  # Operations dashboard landing
│   └── layout.tsx
├── components/
│   ├── operations/
│   │   ├── KanbanBoard.tsx           # Sophisticated @dnd-kit implementation
│   │   ├── KanbanCard.tsx            # Operation-specific card rendering
│   │   ├── KanbanColumn.tsx          # Status columns with Spanish translations
│   │   ├── OperationsTable.tsx       # Dense table view alternative
│   │   ├── FilterToggle.tsx          # Sale/Rent filtering with counts
│   │   └── ViewToggle.tsx            # List/Kanban view switching
│   ├── dashboard/
│   │   └── OperacionesSummaryCard.tsx # Sale/Rent toggle pattern reference
│   └── ui/
│       ├── badge.tsx                 # Status indicator components
│       ├── table.tsx                 # Table layout patterns
│       └── tabs.tsx                  # View toggle implementation
├── server/
│   ├── db/
│   │   └── schema.ts                 # Multi-tenant database schema
│   ├── queries/
│   │   ├── operations-kanban.ts      # Complex JOIN queries for kanban data
│   │   ├── prospect.ts               # ⚠️ SECURITY GAP: Missing accountId filtering
│   │   ├── contact.ts                # Contact operations with proper security
│   │   └── listing.ts                # Listing operations for dual-type prospects
│   └── actions/
│       └── operations.ts             # Server actions with Zod validation
├── types/
│   ├── operations.ts                 # Status translations and interfaces
│   ├── listing.ts                    # Listing-related types
│   └── property-listing.ts           # Property characteristics (150+ fields)
└── lib/
    ├── dal.ts                        # getCurrentUserAccountId() for security
    └── utils/
        └── status-helpers.ts         # Status validation utilities
```

### Desired Codebase Tree with New Files

```bash
src/
├── server/
│   ├── queries/
│   │   ├── prospect.ts               # MODIFY: Add accountId filtering to all functions
│   │   └── dual-prospects.ts         # NEW: Unified queries for dual-type prospects
│   └── actions/
│       └── prospect-actions.ts       # NEW: Server actions for dual-type operations
├── components/
│   ├── operations/
│   │   ├── KanbanCard.tsx            # MODIFY: Add dual-type rendering logic
│   │   ├── DualTypeProspectCard.tsx  # NEW: Specific card component for prospects
│   │   └── ProspectStatusWorkflow.tsx # NEW: Status validation for dual workflows
│   └── prospects/
│       ├── ListingProspectCard.tsx   # NEW: Card layout for listing prospects
│       └── SearchProspectCard.tsx    # NEW: Card layout for search prospects
├── types/
│   └── dual-prospects.ts             # NEW: TypeScript interfaces for dual-type system
└── lib/
    └── prospect-utils.ts             # NEW: Utilities for prospect type detection and validation
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: @dnd-kit requires installation (not currently in package.json)
// Install with: pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
// All kanban components need 'use client' directive for drag interactions

// CRITICAL: Multi-tenant security MISSING in prospect.ts
// ALL functions in src/server/queries/prospect.ts lack accountId filtering
// Example FIX required:
//   WRONG: .where(eq(prospects.status, status))
//   RIGHT: .where(and(eq(prospects.status, status), eq(contacts.accountId, accountId)))

// CRITICAL: BigInt conversion required for database IDs throughout Next.js
// Database IDs are BigInt but come as strings from client
// Example: eq(prospects.id, BigInt(id)) not eq(prospects.id, id)
// Use: z.string().transform((val) => BigInt(val)) in Zod schemas

// CRITICAL: Spanish status translations must be consistent
// Use existing STATUS_TRANSLATIONS object in src/types/operations.ts
// New statuses: "Valoración" (valuation), "Hoja de encargo" (listing agreement)

// CRITICAL: @dnd-kit onDragEnd must handle server validation
// Use optimistic updates with error rollback pattern from existing KanbanBoard.tsx
// Never skip server-side status transition validation

// CRITICAL: Performance optimization for large prospect lists
// Use React.memo for KanbanCard components to prevent unnecessary re-renders
// Implement useMemo for expensive calculations during drag operations
// Consider virtualization for boards with 100+ prospects

// CRITICAL: Mobile drag-and-drop requires proper sensor configuration
// Use PointerSensor with activationConstraint for touch devices
// Set proper delay and distance thresholds for mobile gestures

// CRITICAL: Dual data model complexity
// Search prospects use prospects table fields (minPrice, maxPrice, preferredAreas)
// Listing prospects need connection to listings/properties tables for property details
// Use discriminator pattern with prospectType: 'search' | 'listing'
```

## Implementation Blueprint

### Data Models and Structure

Create TypeScript interfaces that handle both prospect types with proper discrimination:

```typescript
// Dual-type prospect system with discriminator pattern
interface BaseProspect {
  id: bigint;
  contactId: bigint;
  status: string;
  listingType: 'Sale' | 'Rent';
  prospectType: 'search' | 'listing'; // NEW: Discriminator field
  urgencyLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchProspect extends BaseProspect {
  prospectType: 'search';
  // Existing fields for people looking FOR properties
  minPrice: number;
  maxPrice: number;
  preferredAreas: Array<{neighborhoodId: bigint; name: string}>;
  minBedrooms: number;
  propertyType: string;
  extras: Record<string, boolean>;
}

interface ListingProspect extends BaseProspect {
  prospectType: 'listing';
  // NEW: Fields for people wanting to LIST properties
  propertyToList: {
    address: string;
    propertyType: string;
    estimatedValue: number;
    condition: string;
    readyToList: boolean;
  };
  valuationStatus: 'pending' | 'scheduled' | 'completed';
  listingAgreementStatus: 'not_started' | 'in_progress' | 'signed';
}

// Union type for type-safe handling
type DualProspect = SearchProspect | ListingProspect;

// Zod schemas for server action validation
const DualProspectStatusUpdateSchema = z.object({
  prospectId: z.string().transform((val) => BigInt(val)),
  prospectType: z.enum(['search', 'listing']),
  fromStatus: z.string(),
  toStatus: z.string(),
  accountId: z.string().transform((val) => BigInt(val)),
});

// Spanish status workflows
const LISTING_PROSPECT_STATUSES = [
  'Información básica',
  'Valoración', 
  'Hoja de encargo',
  'En búsqueda'
] as const;

const SEARCH_PROSPECT_STATUSES = [
  'Información básica',
  'En búsqueda'
] as const;
```

### List of Tasks to be Completed

```yaml
Task 1 - Fix Critical Security Gap in Prospect Queries:
MODIFY src/server/queries/prospect.ts:
  - IMPORT getCurrentUserAccountId from ~/lib/dal
  - WRAP all existing functions with accountId filtering
  - PATTERN: Add .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
  - PATTERN: Add .where(eq(contacts.accountId, accountId)) to every query
  - PRESERVE all existing function signatures for backward compatibility
  - TEST each modified function to ensure security compliance

Task 2 - Add Dual-Type Support to Database Schema:
MODIFY src/server/db/schema.ts:
  - ADD prospectType: varchar('prospect_type').notNull() to prospects table
  - ADD propertyToList: json('property_to_list') for listing prospect details
  - ADD valuationStatus: varchar('valuation_status') for listing workflow
  - ADD listingAgreementStatus: varchar('listing_agreement_status') for workflow
  - CREATE migration script to update existing prospects with default 'search' type

Task 3 - Create Dual-Type Prospect Queries:
CREATE src/server/queries/dual-prospects.ts:
  - IMPLEMENT getDualProspectsForKanban(accountId, listingType?, prospectType?)
  - PATTERN: Complex JOIN across prospects, contacts, listings, properties tables
  - RETURN unified OperationCard interface for both prospect types
  - INCLUDE proper Spanish status translations
  - OPTIMIZE with proper indexes and pagination support

Task 4 - Extend Kanban Card for Dual-Type Rendering:
MODIFY src/components/operations/KanbanCard.tsx:
  - IMPORT DualProspect types and discriminator utilities
  - EXTEND renderOperationContent() switch statement for prospects case
  - ADD conditional rendering based on prospectType field
  - IMPLEMENT ListingProspectDetails and SearchProspectDetails components
  - MAINTAIN existing Spanish localization patterns

CREATE src/components/prospects/ListingProspectCard.tsx:
  - RENDER property details, valuation status, listing preparation phase
  - SHOW property address, estimated value, condition assessment
  - DISPLAY valuation progress: "Pendiente", "Programada", "Completada"
  - INCLUDE listing agreement status: "No iniciado", "En progreso", "Firmado"

CREATE src/components/prospects/SearchProspectCard.tsx:
  - RENDER search criteria: budget range, preferred areas, property type
  - SHOW urgency level with color coding (1-5 scale)
  - DISPLAY property preferences: bedrooms, bathrooms, amenities
  - INCLUDE move-in timeline and funding readiness status

Task 5 - Implement Dual-Type Status Workflows:
CREATE src/components/operations/ProspectStatusWorkflow.tsx:
  - IMPLEMENT validateStatusTransition(prospectType, fromStatus, toStatus)
  - DEFINE separate workflow rules for listing vs search prospects
  - RETURN Spanish error messages for invalid transitions
  - INTEGRATE with existing status validation in KanbanBoard.tsx

MODIFY src/components/operations/KanbanColumn.tsx:
  - ADD dynamic column rendering based on active prospect type filter
  - SHOW different status columns for listing vs search prospects
  - MAINTAIN existing STATUS_TRANSLATIONS patterns
  - IMPLEMENT conditional column visibility

Task 6 - Enhance Filtering for Dual-Type Prospects:
MODIFY src/components/operations/FilterToggle.tsx:
  - ADD prospect type filter: "Búsqueda", "Listado", "Todos"
  - EXTEND Sale/Rent filter to work with both prospect types
  - UPDATE count calculations for combined filtering
  - PERSIST filter state in URL search parameters
  - TRIGGER real-time data refetch on filter changes

Task 7 - Create Server Actions for Dual-Type Operations:
CREATE src/server/actions/prospect-actions.ts:
  - IMPLEMENT updateDualProspectStatus with type-specific validation
  - CREATE bulkUpdateProspects for multi-select operations
  - ADD createListingProspect and createSearchProspect actions
  - INCLUDE proper error handling with Spanish messages
  - ENSURE all actions validate accountId for multi-tenant security

Task 8 - Add Spanish Status Translations:
MODIFY src/types/operations.ts:
  - EXTEND STATUS_TRANSLATIONS object with new prospect statuses
  - ADD "Valoración": "Valuation", "Hoja de encargo": "Listing Agreement"
  - UPDATE PROSPECT_STATUSES array with dual-type workflows
  - MAINTAIN consistency with existing Spanish terminology

Task 9 - Implement Performance Optimizations:
MODIFY src/components/operations/KanbanBoard.tsx:
  - ADD React.memo wrapper for DualTypeProspectCard components
  - IMPLEMENT useMemo for expensive prospect type calculations
  - OPTIMIZE drag overlay rendering for dual-type cards
  - ADD proper cleanup for drag event listeners

CREATE src/lib/prospect-utils.ts:
  - IMPLEMENT getProspectTypeDetails(prospect) helper function
  - CREATE buildProspectSummary(prospect) for card descriptions
  - ADD isValidProspectStatusTransition(prospectType, fromStatus, toStatus)
  - INCLUDE Spanish text generation utilities

Task 10 - Integration Testing and Validation:
MODIFY src/app/(dashboard)/operaciones/[type]/page.tsx:
  - INTEGRATE dual-type prospect queries with existing kanban
  - IMPLEMENT proper loading states for complex queries
  - ADD error boundaries for dual-type data handling
  - ENSURE mobile responsiveness with horizontal scroll
  - TEST drag-and-drop functionality across both prospect types
```

### Pseudocode for Core Dual-Type Implementation

```typescript
// Task 4: Dual-Type Card Rendering Logic
function DualTypeProspectCard({ prospect }: { prospect: DualProspect }) {
  // PATTERN: Type discrimination for conditional rendering
  const renderProspectContent = () => {
    switch (prospect.prospectType) {
      case 'listing':
        return (
          <div className="listing-prospect-content">
            {/* Property to be listed details */}
            <PropertyDetails property={prospect.propertyToList} />
            <ValuationStatus status={prospect.valuationStatus} />
            <ListingAgreementProgress status={prospect.listingAgreementStatus} />
            <StatusBadge status={prospect.status} type="listing" />
          </div>
        );
      case 'search':
        return (
          <div className="search-prospect-content">
            {/* Search criteria and preferences */}
            <SearchCriteria 
              budget={`€${prospect.minPrice} - €${prospect.maxPrice}`}
              areas={prospect.preferredAreas}
              preferences={prospect.extras}
            />
            <UrgencyIndicator level={prospect.urgencyLevel} />
            <StatusBadge status={prospect.status} type="search" />
          </div>
        );
    }
  };

  // CRITICAL: Use React.memo to prevent unnecessary re-renders during drag
  return React.memo(() => (
    <motion.div 
      className="dual-prospect-card"
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
    >
      <ContactHeader contactName={prospect.contact?.name} />
      {renderProspectContent()}
      <ActionButtons prospectId={prospect.id} prospectType={prospect.prospectType} />
    </motion.div>
  ));
}

// Task 5: Status Workflow Validation
async function validateDualProspectStatusTransition(
  prospectType: 'search' | 'listing',
  fromStatus: string, 
  toStatus: string
): Promise<{ valid: boolean; error?: string }> {
  // PATTERN: Type-specific workflow validation
  const workflows = {
    listing: ['Información básica', 'Valoración', 'Hoja de encargo', 'En búsqueda'],
    search: ['Información básica', 'En búsqueda']
  };
  
  const validStatuses = workflows[prospectType];
  const fromIndex = validStatuses.indexOf(fromStatus);
  const toIndex = validStatuses.indexOf(toStatus);
  
  // CRITICAL: Enforce sequential workflow progression
  if (fromIndex === -1 || toIndex === -1) {
    return { 
      valid: false, 
      error: `Estado no válido para prospecto de tipo ${prospectType}` 
    };
  }
  
  // GOTCHA: Allow backward movement for corrections
  if (toIndex < fromIndex - 1 || toIndex > fromIndex + 1) {
    return { 
      valid: false, 
      error: 'Solo se permite avanzar un estado o retroceder un estado' 
    };
  }
  
  return { valid: true };
}

// Task 7: Server Action with Dual-Type Support
async function updateDualProspectStatusAction(data: DualProspectStatusUpdateSchema) {
  const accountId = await getCurrentUserAccountId();
  const validated = DualProspectStatusUpdateSchema.parse({ ...data, accountId });
  
  // CRITICAL: Validate prospect belongs to user's account
  const prospect = await getDualProspectWithSecurity(
    validated.prospectId, 
    validated.accountId
  );
  
  if (!prospect) {
    throw new Error('Prospecto no encontrado o acceso denegado');
  }
  
  // CRITICAL: Type-specific status validation
  const validation = await validateDualProspectStatusTransition(
    validated.prospectType,
    validated.fromStatus,
    validated.toStatus
  );
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // PATTERN: Transaction for data consistency
  await db.transaction(async (tx) => {
    // Update prospect status
    await tx.update(prospects)
      .set({ status: validated.toStatus, updatedAt: new Date() })
      .where(eq(prospects.id, validated.prospectId));
    
    // PATTERN: Create audit trail
    await tx.insert(prospectHistory).values({
      prospectId: validated.prospectId,
      fromStatus: validated.fromStatus,
      toStatus: validated.toStatus,
      changedAt: new Date(),
      changedBy: await getCurrentUser(),
    });
  });
  
  // CRITICAL: Revalidate kanban data
  revalidatePath(`/operaciones/prospects`);
  return { success: true, message: `Prospecto movido a "${validated.toStatus}"` };
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "ALTER TABLE prospects ADD COLUMN prospect_type VARCHAR(20) DEFAULT 'search'"
  - migration: "ALTER TABLE prospects ADD COLUMN property_to_list JSON"
  - migration: "ALTER TABLE prospects ADD COLUMN valuation_status VARCHAR(50)"
  - index: "CREATE INDEX idx_prospects_type_status ON prospects(prospect_type, status, listing_type)"

CONFIG:
  - verify: @dnd-kit dependencies installed in package.json
  - add: Spanish status translations to STATUS_TRANSLATIONS object
  - ensure: React 18 concurrent features compatibility

ROUTES:
  - maintain: /operaciones/prospects route with extended dual-type support
  - add: Query parameter support for prospect_type filtering
  - ensure: Mobile-responsive layout with horizontal scroll

SECURITY:
  - fix: Add accountId filtering to all prospect.ts query functions
  - verify: No cross-tenant data leakage in dual-type queries
  - test: Multi-tenant isolation with different account data
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Critical type checking and linting - fix ALL errors before proceeding
pnpm typecheck                    # TypeScript compilation check
pnpm lint:fix                     # ESLint with auto-fix capability
pnpm format:write                 # Prettier code formatting
pnpm build                        # Next.js build verification

# Expected: No errors. If errors exist, READ them carefully and fix.
# Common issues: BigInt conversion, missing 'use client' directives
```

### Level 2: Unit Tests (Create test suite for dual-type functionality)

```typescript
// CREATE src/components/operations/__tests__/DualTypeProspectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DualTypeProspectCard } from '../DualTypeProspectCard';

describe('DualTypeProspectCard', () => {
  const mockListingProspect = {
    id: BigInt(1),
    prospectType: 'listing' as const,
    status: 'Valoración',
    propertyToList: {
      address: 'Calle Mayor 123',
      propertyType: 'piso',
      estimatedValue: 300000,
      condition: 'good',
      readyToList: false
    },
    contact: { name: 'Juan Pérez' }
  };

  const mockSearchProspect = {
    id: BigInt(2),
    prospectType: 'search' as const,
    status: 'En búsqueda',
    minPrice: 200000,
    maxPrice: 400000,
    preferredAreas: [{ neighborhoodId: BigInt(1), name: 'Salamanca' }],
    urgencyLevel: 4,
    contact: { name: 'María García' }
  };

  it('should render listing prospect content correctly', () => {
    render(<DualTypeProspectCard prospect={mockListingProspect} />);
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Calle Mayor 123')).toBeInTheDocument();
    expect(screen.getByText('Valoración')).toBeInTheDocument();
    expect(screen.getByText('€300.000')).toBeInTheDocument();
  });

  it('should render search prospect content correctly', () => {
    render(<DualTypeProspectCard prospect={mockSearchProspect} />);
    
    expect(screen.getByText('María García')).toBeInTheDocument();
    expect(screen.getByText('€200.000 - €400.000')).toBeInTheDocument();
    expect(screen.getByText('Salamanca')).toBeInTheDocument();
    expect(screen.getByText('Urgencia: Alta')).toBeInTheDocument();
  });

  it('should handle prospect type discrimination correctly', () => {
    const { rerender } = render(<DualTypeProspectCard prospect={mockListingProspect} />);
    expect(screen.queryByText('€200.000 - €400.000')).not.toBeInTheDocument();
    
    rerender(<DualTypeProspectCard prospect={mockSearchProspect} />);
    expect(screen.queryByText('Calle Mayor 123')).not.toBeInTheDocument();
  });
});

// CREATE src/server/actions/__tests__/prospect-actions.test.ts
import { updateDualProspectStatusAction } from '../prospect-actions';
import { validateDualProspectStatusTransition } from '../../../lib/prospect-utils';

describe('updateDualProspectStatusAction', () => {
  it('should validate listing prospect workflow correctly', async () => {
    const validation = await validateDualProspectStatusTransition(
      'listing',
      'Información básica',
      'Valoración'
    );
    
    expect(validation.valid).toBe(true);
  });

  it('should reject invalid status transitions', async () => {
    const validation = await validateDualProspectStatusTransition(
      'listing',
      'Información básica',
      'En búsqueda' // Skipping Valoración step
    );
    
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Solo se permite avanzar un estado');
  });

  it('should handle search prospect workflow correctly', async () => {
    const validation = await validateDualProspectStatusTransition(
      'search',
      'Información básica',
      'En búsqueda'
    );
    
    expect(validation.valid).toBe(true);
  });
});
```

```bash
# Run unit tests - iterate until ALL tests pass
pnpm test -- --testPathPattern=dual-type
pnpm test -- --testPathPattern=prospect
# If failing: Read error messages, understand root cause, fix implementation
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Test dual-type prospects kanban page loads correctly
curl -I http://localhost:3000/operaciones/prospects
# Expected: 200 OK response

# Test filtering functionality
curl -X GET "http://localhost:3000/operaciones/prospects?prospect_type=listing&listing_type=sale"
# Expected: Filtered results with only listing prospects for sale

# Manual browser testing checklist:
echo "✓ Navigate to /operaciones/prospects"
echo "✓ Verify both listing and search prospect cards display correctly"
echo "✓ Test drag-and-drop between status columns"
echo "✓ Verify status transitions respect workflow rules"
echo "✓ Test Sale/Rent filter functionality"
echo "✓ Test prospect type filter (Búsqueda/Listado/Todos)"
echo "✓ Verify Spanish localization throughout interface"
echo "✓ Test mobile responsiveness (375px width)"
echo "✓ Verify touch drag interactions on mobile"
echo "✓ Test bulk selection and actions"
echo "✓ Confirm no cross-tenant data leakage (create test accounts)"
```

### Level 4: Performance & Creative Validation

```bash
# Performance testing with realistic prospect data
# Load test database with 100+ prospects of both types
# Measure kanban load time (target: <2 seconds)
# Test drag-and-drop performance (target: 60fps during drag)

# Security validation (CRITICAL for multi-tenant)
# Create multiple test accounts with different prospect data
# Verify Account A cannot see or modify Account B prospects
# Test SQL injection protection in filter parameters
# Validate BigInt conversion handles malformed IDs gracefully

# Spanish localization validation
# Verify all status labels display in Spanish
# Test error messages appear in Spanish
# Confirm date formatting uses Spanish locale (DD/MM/YYYY)
# Validate currency formatting: €XXX.XXX format

# Mobile responsiveness validation
echo "Testing mobile viewports:"
echo "✓ 375px width: Horizontal scroll kanban"
echo "✓ 768px width: Tablet layout optimization"
echo "✓ 1024px width: Desktop full layout"

# Accessibility validation
echo "Testing accessibility:"
echo "✓ Keyboard navigation through kanban columns"
echo "✓ Screen reader compatibility with drag-and-drop"
echo "✓ Color contrast ratios for status badges"
echo "✓ ARIA labels for Spanish interface elements"
```

## Final Validation Checklist

- [ ] All dependencies installed: `pnpm list @dnd-kit/core`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Clean build: `pnpm build`
- [ ] Route accessible: `/operaciones/prospects` loads correctly
- [ ] Both prospect types render with appropriate card layouts
- [ ] Drag-and-drop functions with proper status validation
- [ ] Spanish localization complete throughout interface
- [ ] Sale/Rent filtering works for both prospect types
- [ ] Prospect type filtering (Búsqueda/Listado/Todos) functions correctly
- [ ] Multi-tenant security prevents cross-account data access
- [ ] Mobile touch interactions work smoothly
- [ ] Performance optimal with large datasets (100+ prospects)
- [ ] Status workflows enforce proper business rules
- [ ] Error messages display in Spanish with helpful context
- [ ] All unit tests pass: `pnpm test`
- [ ] Database migrations complete successfully
- [ ] Audit trail logs prospect status changes correctly

---

## Anti-Patterns to Avoid

- ❌ Don't skip accountId filtering - critical security requirement for multi-tenant SaaS
- ❌ Don't mix prospect types in single components without type discrimination
- ❌ Don't ignore mobile drag-and-drop optimization - real estate agents work on mobile
- ❌ Don't hardcode Spanish translations - use centralized STATUS_TRANSLATIONS
- ❌ Don't skip BigInt conversion for database IDs - will cause runtime errors
- ❌ Don't create separate kanban boards for each prospect type - unified interface is key
- ❌ Don't ignore status workflow validation - business rules prevent invalid transitions
- ❌ Don't skip React.memo optimization - drag performance requires proper memoization
- ❌ Don't use english text anywhere in UI - complete Spanish localization required
- ❌ Don't create N+1 queries - optimize with proper JOINs for dual-type data

## Confidence Score: 9/10

This PRP provides comprehensive context for successful one-pass implementation:
- ✅ Complete analysis of existing sophisticated kanban implementation
- ✅ Detailed security gap identification and remediation approach  
- ✅ Comprehensive dual-type data model architecture with discriminator pattern
- ✅ Spanish localization patterns from existing codebase
- ✅ External research on @dnd-kit best practices and performance optimization
- ✅ Step-by-step implementation tasks with specific file modifications
- ✅ Executable validation gates with unit tests and integration testing
- ✅ Mobile-responsive design considerations with touch interaction support
- ✅ Multi-tenant security patterns with accountId filtering throughout
- ✅ Performance optimization strategies for large prospect datasets

**Deduction (-1)**: Complex dual-type data model may require iterative refinement during implementation to handle edge cases in prospect type discrimination and status workflow transitions.