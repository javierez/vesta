# PRP: Leads Page Implementation for Real Estate CRM

## Goal

Implement a dedicated Leads page at `/operaciones/leads` that displays a table view of all leads, following the existing prospects page pattern. The page will show the relationship between supply (listing owners) and demand (interested contacts), with proper filtering, pagination, and status management. Initially table view only with disabled Kanban toggle for future enhancement.

## Why

- **Centralized Lead Management**: Provides a dedicated space to track and manage all leads in one place
- **Supply-Demand Visibility**: Shows the connection between property owners and interested parties
- **Workflow Tracking**: Enables tracking of lead progression from initial contact through closing
- **Operations Efficiency**: Unlocks the "Leads" navigation item and completes the Operations section
- **Foundation for Growth**: Sets up infrastructure for future Kanban view and advanced features

## What

Create a Leads page that displays all leads in a table format with:
- Contact information (Demandante)
- Associated listing and owner details
- Lead status with Spanish workflow states
- Source tracking (Appointment, Web form, Manual)
- Creation and update timestamps
- Actions for viewing lead details and related entities
- Filter bar with search and status filtering
- Pagination for large datasets
- Disabled view toggle (table/kanban) for future enhancement

### Success Criteria

- [ ] Leads page accessible at `/operaciones/leads`
- [ ] Navigation item "Leads" is enabled in the Operations menu
- [ ] Table displays all leads with proper columns and data
- [ ] Status badges show correct Spanish workflow states
- [ ] Filters work for contact search, listing search, and status
- [ ] Pagination handles large datasets correctly
- [ ] View toggle is visible but disabled
- [ ] Page follows existing prospects page patterns
- [ ] Empty state shows when no leads exist
- [ ] Loading skeleton appears during data fetch
- [ ] Account isolation ensures users only see their leads

## All Needed Context

### Documentation & References

```yaml
- file: /Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/operaciones/prospects/page.tsx
  why: Reference implementation for page structure, state management, pagination, and data fetching patterns

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/prospects/prospect-table.tsx
  why: Table component pattern with resizable columns, status dropdowns, and action menus

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/prospects/prospect-filter.tsx
  why: Filter bar pattern with search, dropdowns, and view toggle implementation

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/lead.ts
  why: Existing lead query functions with auth wrappers and proper account isolation

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/constants/lead-statuses.ts
  why: Lead status constants and workflow definitions in Spanish

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/layout/dashboard-layout.tsx
  why: Navigation configuration to enable the Leads menu item

- file: /Users/javierperezgarcia/Downloads/vesta/public/claude/PRPs/templates/leads.md
  why: Lead workflow logic and status synchronization rules

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/db/schema.ts
  why: Database schema for leads table and relationships (lines 410-419)

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/data.ts
  why: TypeScript types for Lead and related entities
```

### Current Codebase Structure (Relevant Files)

```bash
src/
├── app/
│   └── (dashboard)/
│       └── operaciones/
│           ├── prospects/
│           │   └── page.tsx           # Reference implementation
│           └── leads/                 # NEW - To be created
│               └── page.tsx          
├── components/
│   ├── prospects/                     # Reference components
│   │   ├── prospect-table.tsx
│   │   ├── prospect-filter.tsx
│   │   └── skeletons.tsx
│   ├── leads/                         # NEW - To be created
│   │   ├── lead-table.tsx
│   │   ├── lead-filter.tsx
│   │   └── lead-skeletons.tsx
│   └── layout/
│       └── dashboard-layout.tsx       # Navigation config
├── server/
│   └── queries/
│       └── lead.ts                    # Existing lead queries
└── lib/
    ├── constants/
    │   └── lead-statuses.ts          # Status workflow
    └── data.ts                       # Type definitions
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: All IDs in database are bigint - must convert for display/URLs
// Example: leadId.toString() when passing to components or URLs

// CRITICAL: Always use auth wrapper functions from queries
// Pattern: listLeadsWithAuth() not listLeads() directly

// CRITICAL: Spanish status values must match exactly from constants
// Current max length: 20 chars (database varchar limit)

// CRITICAL: Client components need "use client" directive
// Next.js 14 requires explicit client/server boundary

// CRITICAL: Account isolation is mandatory
// Pattern: const accountId = await getCurrentUserAccountId()

// CRITICAL: URL state management for filters
// Use useSearchParams and router.push for filter persistence

// CRITICAL: Date formatting should use Spanish locale
// Pattern: new Intl.DateTimeFormat("es-ES", options)
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Types already exist in src/lib/data.ts
interface Lead {
  leadId: bigint;
  contactId: bigint;
  listingId?: bigint;
  prospectId?: bigint;
  source: string;
  status: LeadStatus; // from constants
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  contact?: Contact;
  listing?: Listing;
}

// For table display
interface LeadTableRow {
  id: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  listingReference?: string;
  listingAddress?: string;
  ownerName?: string;
  status: LeadStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### List of Tasks to Complete (In Order)

```yaml
Task 1 - Enable Navigation:
MODIFY src/components/layout/dashboard-layout.tsx:
  - FIND: { name: "Leads", href: "/operaciones/leads", disabled: true }
  - REPLACE: { name: "Leads", href: "/operaciones/leads", disabled: false }
  - REASON: Unlock the navigation item once page exists

Task 2 - Create Lead Skeletons:
CREATE src/components/leads/lead-skeletons.tsx:
  - MIRROR pattern from: src/components/prospects/skeletons.tsx
  - MODIFY: Adjust for lead-specific columns
  - KEEP: Same skeleton animation patterns

Task 3 - Create Lead Filter Component:
CREATE src/components/leads/lead-filter.tsx:
  - MIRROR pattern from: src/components/prospects/prospect-filter.tsx
  - MODIFY: 
    - Search placeholder: "Buscar por contacto, propiedad..."
    - Filter options for lead statuses from constants
    - Keep view toggle but make it disabled
  - PRESERVE: URL state management pattern

Task 4 - Create Lead Table Component:
CREATE src/components/leads/lead-table.tsx:
  - MIRROR pattern from: src/components/prospects/prospect-table.tsx
  - COLUMNS:
    - Contacto (name with email/phone tooltip)
    - Propiedad (reference + address)
    - Propietario (owner name from listing)
    - Estado (status badge)
    - Fuente (source)
    - Creado (date)
    - Acciones (dropdown menu)
  - PRESERVE: Resizable columns, status updates, pagination

Task 5 - Create Leads Page:
CREATE src/app/(dashboard)/operaciones/leads/page.tsx:
  - MIRROR pattern from: src/app/(dashboard)/operaciones/prospects/page.tsx
  - USE: listLeadsWithAuth() for data fetching
  - REMOVE: Kanban view logic (keep toggle disabled)
  - REMOVE: ConexionesPotenciales component
  - PRESERVE: All state management and filtering patterns

Task 6 - Update Lead Queries (if needed):
CHECK src/server/queries/lead.ts:
  - VERIFY: listLeadsWithAuth includes all needed joins
  - ADD if missing: Join with listings table for owner info
  - ENSURE: Proper pagination support
```

### Task-by-Task Pseudocode

```typescript
// Task 3 - Lead Filter Component
"use client";
export function LeadFilter({ onFilterChange, viewMode, onViewChange }) {
  // PATTERN: Use URL state (see prospect-filter.tsx)
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // GOTCHA: Debounce search to avoid too many requests
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      // Update URL params
      const params = new URLSearchParams(searchParams);
      if (value) params.set("search", value);
      else params.delete("search");
      router.push(`?${params.toString()}`);
    }, 300),
    [searchParams, router]
  );
  
  // View toggle - CRITICAL: Always disabled for MVP
  const viewToggle = (
    <ToggleGroup value={viewMode} disabled>
      <ToggleGroupItem value="list">Lista</ToggleGroupItem>
      <ToggleGroupItem value="kanban" disabled>Kanban</ToggleGroupItem>
    </ToggleGroup>
  );
}

// Task 4 - Lead Table Component
export function LeadTable({ leads, onStatusUpdate, currentPage, totalPages, onPageChange }) {
  // PATTERN: Transform lead data to unified format
  const transformedData = leads.map(lead => ({
    id: lead.leadId.toString(),
    contactName: lead.contact?.fullName || "Sin contacto",
    contactEmail: lead.contact?.email,
    contactPhone: lead.contact?.phone,
    listingReference: lead.listing?.referenceNumber,
    listingAddress: lead.listing?.address,
    ownerName: lead.listing?.owner?.fullName,
    status: lead.status,
    source: lead.source,
    createdAt: lead.createdAt,
    actions: {
      viewLead: () => router.push(`/operaciones/leads/${lead.leadId}`),
      viewContact: () => router.push(`/contactos/${lead.contactId}`),
      viewListing: () => lead.listingId && router.push(`/propiedades/${lead.listingId}`)
    }
  }));
  
  // CRITICAL: Status update with optimistic UI
  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    // Optimistic update
    setOptimisticStatus(leadId, newStatus);
    
    try {
      await updateLeadStatusAction(leadId, newStatus);
      // Success - keep optimistic state
    } catch (error) {
      // Revert on error
      revertOptimisticStatus(leadId);
      toast.error("Error al actualizar estado");
    }
  };
}

// Task 5 - Leads Page
"use client";
export default function LeadsPage() {
  // PATTERN: State management (mirror prospects page)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const statuses = searchParams.getAll("status");
  
  // CRITICAL: Fetch data with filters
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const result = await listLeadsWithAuth(
          currentPage,
          ITEMS_PER_PAGE,
          search,
          statuses
        );
        
        setLeads(result.leads);
        setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching leads:", error);
        toast.error("Error al cargar leads");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, [currentPage, search, statuses]);
  
  // PATTERN: Loading state with skeletons
  if (isLoading) {
    return <LeadPageSkeleton />;
  }
  
  // PATTERN: Empty state
  if (!leads.length && !search && !statuses.length) {
    return <EmptyLeadsState />;
  }
}
```

### Integration Points

```yaml
NAVIGATION:
  - modify: src/components/layout/dashboard-layout.tsx
  - change: disabled: false for Leads menu item

ROUTES:
  - create: src/app/(dashboard)/operaciones/leads/page.tsx
  - pattern: Client component with data fetching

COMPONENTS:
  - create: src/components/leads/* (3 new components)
  - reuse: All UI primitives from src/components/ui/*

QUERIES:
  - use: src/server/queries/lead.ts existing functions
  - verify: Joins include listing owner information

CONSTANTS:
  - import: LEAD_STATUSES from src/lib/constants/lead-statuses.ts
  - use: For status badges and filter options
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint                        # Check all linting rules
pnpm exec tsc --noEmit          # TypeScript compilation check
pnpm format:write               # Auto-format code

# Expected: No errors. If errors exist, read and fix before proceeding.
```

### Level 2: Component Tests

```typescript
// CREATE src/components/leads/__tests__/lead-table.test.tsx
describe('LeadTable', () => {
  it('should render leads with all columns', () => {
    const mockLeads = [
      {
        leadId: 1n,
        contactId: 1n,
        contact: { fullName: 'Juan Pérez', email: 'juan@email.com' },
        listing: { referenceNumber: 'REF123', address: 'Calle Mayor 1' },
        status: 'Visita Pendiente',
        source: 'Appointment',
        createdAt: new Date()
      }
    ];
    
    render(<LeadTable leads={mockLeads} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('REF123')).toBeInTheDocument();
    expect(screen.getByText('Visita Pendiente')).toBeInTheDocument();
  });

  it('should handle status updates', async () => {
    const onStatusUpdate = jest.fn();
    render(<LeadTable leads={mockLeads} onStatusUpdate={onStatusUpdate} />);
    
    // Open status dropdown and select new status
    const statusDropdown = screen.getByRole('button', { name: /estado/i });
    await userEvent.click(statusDropdown);
    await userEvent.click(screen.getByText('Oferta Presentada'));
    
    expect(onStatusUpdate).toHaveBeenCalledWith('1', 'Oferta Presentada');
  });
});
```

```bash
# Run component tests
pnpm test lead-table.test.tsx
```

### Level 3: Integration Testing

```bash
# Start development server
pnpm dev

# Test navigation
# 1. Navigate to http://localhost:3000/operaciones
# 2. Click on "Leads" in the sidebar
# 3. Should load the leads page without errors

# Test data loading
curl http://localhost:3000/api/leads?page=1&limit=10
# Expected: JSON response with leads array and total count

# Test filtering
# 1. Type in search box - should filter results
# 2. Select status filters - should update table
# 3. URL should update with filter params

# Test pagination
# 1. If > 10 leads, pagination controls should appear
# 2. Clicking page 2 should load next set of results
# 3. URL should update with page param
```

### Level 4: Manual Validation Checklist

```bash
# Desktop Testing (1920x1080)
echo "✓ Leads page loads at /operaciones/leads"
echo "✓ Navigation item 'Leads' is active and clickable"
echo "✓ Table shows all expected columns"
echo "✓ Status badges display with correct colors"
echo "✓ Search filters leads in real-time"
echo "✓ Status filter dropdown works"
echo "✓ Pagination controls appear and work"
echo "✓ View toggle is visible but disabled"
echo "✓ Empty state appears when no leads"
echo "✓ Loading skeleton appears during fetch"

# Mobile Testing (375x667)
echo "✓ Table is horizontally scrollable"
echo "✓ Filters are accessible and usable"
echo "✓ Navigation menu works on mobile"
echo "✓ Text is readable and not truncated"

# Data Validation
echo "✓ Only account-specific leads are shown"
echo "✓ Lead status updates persist"
echo "✓ Dates show in Spanish format"
echo "✓ BigInt IDs don't cause display issues"

# Error States
echo "✓ Network error shows toast message"
echo "✓ Invalid status update shows error"
echo "✓ Empty search shows 'No results' message"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm exec tsc --noEmit`
- [ ] Build succeeds: `pnpm build`
- [ ] Leads page accessible at `/operaciones/leads`
- [ ] Navigation enabled in sidebar
- [ ] Table displays data correctly
- [ ] Filters and pagination work
- [ ] Account isolation verified
- [ ] Spanish text and date formatting correct
- [ ] Error states handled gracefully
- [ ] Performance acceptable with 100+ leads

## Anti-Patterns to Avoid

- ❌ Don't enable Kanban view in MVP - keep it disabled
- ❌ Don't access leads directly - always use WithAuth wrappers
- ❌ Don't forget bigint conversions for display
- ❌ Don't hardcode Spanish text - use constants
- ❌ Don't skip loading states - UX is important
- ❌ Don't create new UI patterns - follow prospects page
- ❌ Don't forget mobile responsiveness
- ❌ Don't mix server and client components incorrectly

## Confidence Score

**9/10** - This PRP provides comprehensive implementation guidance with:
- ✅ Complete reference to existing patterns in prospects page
- ✅ All necessary files and code locations identified
- ✅ Clear task sequence with dependencies
- ✅ Detailed pseudocode for complex components
- ✅ Extensive validation steps from unit to integration tests
- ✅ Known gotchas and patterns documented
- ✅ Spanish localization considerations included

The only uncertainty is potential edge cases in lead data relationships, but the existing query patterns and error handling should cover most scenarios.