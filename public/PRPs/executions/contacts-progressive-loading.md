name: "Progressive Contact Data Loading with Optimized UX"
description: |

## Purpose

Implement progressive data loading for the contacts page to achieve instant UI rendering, load owner data first for immediate table display, fetch buyer data in background for instant toggle switching, and fix filtering inconsistencies between table and detail views.

## Core Principles

1. **Progressive Loading**: UI renders immediately, data loads progressively
2. **Instant Toggle**: Pre-fetch both datasets for zero-delay switching
3. **Consistent Filtering**: Table and detail views respect same URL filters
4. **Zero Regression**: Maintain exact visual and functional behavior

---

## Goal

Redesign data fetching architecture for `src/app/(dashboard)/contactos/` to eliminate initial loading spinner, display owner contacts within 200ms, enable instant buyer/owner toggle, and ensure filtering consistency across all views.

## Why

- **User Experience**: Users currently wait 2-3 seconds staring at loading spinner
- **Perceived Performance**: Progressive loading makes app feel 10x faster
- **Data Consistency**: Current filtering mismatch confuses users when same contact shows different data
- **Scalability**: Split queries enable better caching and optimization

## What

Transform contacts page from blocking data fetch to progressive loading architecture while maintaining identical UI/UX. Page renders immediately with skeleton, owner data loads first (default view), buyer data fetches in background, toggle switches instantly between cached datasets.

### Success Criteria

- [ ] Page renders without initial loading spinner
- [ ] Owner data table appears within 200ms of navigation
- [ ] Toggle between owner/buyer is instantaneous (no loading)
- [ ] Filtering is consistent between table and detail views  
- [ ] No visual or functional regressions
- [ ] All existing features continue working

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: src/app/(dashboard)/contactos/page.tsx
  why: Current implementation to understand state management and data flow

- file: src/components/contactos/table/contact-table.tsx
  why: Table component that displays data - must remain unchanged

- file: src/server/queries/contact.ts
  why: Current monolithic query to split into progressive queries

- file: src/app/(dashboard)/propiedades/[id]/page.tsx
  why: Example of progressive loading pattern with Promise.all

- file: src/components/propiedades/tabs/property-tabs.tsx
  why: Example of background data fetching for tabs

- file: src/server/db/schema.ts
  why: Database structure for contacts, listings, prospects relationships

- url: https://nextjs.org/docs/app/building-your-application/data-fetching/patterns
  why: Next.js data fetching patterns for client components

- url: https://www.developerway.com/posts/how-to-fetch-data-in-react
  why: React patterns for parallel fetching and avoiding waterfalls
```

### Current Codebase Structure

```bash
src/
├── app/
│   └── (dashboard)/
│       └── contactos/
│           ├── page.tsx              # Main contacts page (client component)
│           └── [contactId]/
│               └── page.tsx          # Contact detail page
├── components/
│   └── contactos/
│       ├── contact-filter.tsx        # URL-based filtering UI
│       └── table/
│           └── contact-table.tsx     # Main table component
└── server/
    ├── queries/
    │   └── contact.ts               # Database queries
    └── db/
        └── schema.ts                # Drizzle ORM schema
```

### Desired Codebase Structure (additions)

```bash
src/
└── server/
    └── queries/
        └── contact.ts               # Add split queries:
                                    # - listContactsCoreDataWithAuth()
                                    # - listContactsOwnerDataWithAuth()  
                                    # - listContactsBuyerDataWithAuth()
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js client components can't use async/await at top level
// CRITICAL: URL params are source of truth - preserve this pattern
// CRITICAL: Contact role filtering uses SQL CASE for isOwner/isBuyer flags
// CRITICAL: Drizzle ORM batch operations limited to 1000 records
// CRITICAL: React StrictMode causes double useEffect in dev (production is fine)
// CRITICAL: Browser limits 6 parallel requests - use Promise.all wisely
// CRITICAL: Table component expects exact data shape - don't modify interface
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Existing ContactWithTypes interface must be preserved
export interface ContactWithTypes extends Contact {
  contactId: string;
  isOwner: boolean;
  isBuyer: boolean; 
  isInteresado: boolean;
  allListings: ContactListing[];
  prospectTitles: string[];
  ownerCount: number;
  buyerCount: number;
  prospectCount: number;
}

// New query response types for split data
export interface ContactCoreData {
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  updatedAt: Date;
  isOwner: boolean;
  isBuyer: boolean;
  isInteresado: boolean;
  ownerCount: number;
  buyerCount: number;
  prospectCount: number;
}

// Separate listing data by type
export interface ContactOwnerData extends ContactCoreData {
  allListings: ContactListing[]; // Only owner listings
  prospectTitles: []; // Empty for owner view
}

export interface ContactBuyerData extends ContactCoreData {
  allListings: ContactListing[]; // Only buyer listings  
  prospectTitles: string[]; // Buyer's property interests
}
```

### List of Tasks

```yaml
Task 1: Create Split Database Queries
MODIFY src/server/queries/contact.ts:
  - KEEP existing listContactsWithTypes function
  - CREATE listContactsCoreData - fast query for basic info + role counts
  - CREATE listContactsOwnerData - core + owner listings only
  - CREATE listContactsBuyerData - core + buyer listings + prospects
  - PATTERN: Follow existing query structure with filters
  - ENSURE: All use proper authentication wrapper

Task 2: Update Contacts Page for Progressive Loading
MODIFY src/app/(dashboard)/contactos/page.tsx:
  - REMOVE single isLoading state
  - ADD separate states: ownerData, buyerData, isLoadingOwner, isLoadingBuyer
  - MODIFY useEffect to render UI immediately
  - ADD parallel fetch pattern for owner data (priority) and buyer data (background)
  - IMPLEMENT instant toggle using cached datasets
  - PRESERVE URL parameter handling exactly

Task 3: Fix Detail View Filtering Consistency
MODIFY src/app/(dashboard)/contactos/[contactId]/page.tsx:
  - REMOVE else-if precedence logic for role display
  - USE URL filter parameter to determine which data to show
  - ENSURE same contact shows same filtered data as in table

Task 4: Add Loading State Refinements
MODIFY src/components/contactos/table/contact-table.tsx:
  - NO CHANGES to component interface or visual structure
  - Component already handles empty data gracefully
  - Skeleton is shown by parent when isLoading=true

Task 5: Testing and Validation
CREATE manual testing checklist:
  - Page loads without spinner
  - Owner data appears quickly
  - Toggle switching is instant
  - Filters work consistently
  - Search updates both views
  - Pagination continues working
```

### Task 1: Split Database Queries Pseudocode

```typescript
// Fast core query - no listing JOINs
export async function listContactsCoreData(
  accountId: number,
  page: number,
  limit: number, 
  filters: ContactFilters
) {
  // PATTERN: Use existing SQL structure but remove listing JOINs
  const contacts = await db.select({
    ...getTableColumns(schema.contacts),
    contactId: schema.contacts.id,
    // CRITICAL: Keep role count calculations
    ownerCount: sql<number>`...existing CASE logic...`,
    buyerCount: sql<number>`...existing CASE logic...`,
    prospectCount: sql<number>`...existing CASE logic...`,
  })
  .from(schema.contacts)
  .where(buildWhereClause(filters))
  .limit(limit)
  .offset(offset);

  // PATTERN: Calculate isOwner/isBuyer flags
  return contacts.map(c => ({
    ...c,
    isOwner: c.ownerCount > 0,
    isBuyer: c.buyerCount > 0,
    isInteresado: c.prospectCount > 0,
    allListings: [], // Empty initially
    prospectTitles: []
  }));
}

// Owner data query
export async function listContactsOwnerData(filters) {
  // Get core data first (or receive contactIds)
  // Then fetch only owner listings using batch approach
  
  // CRITICAL: Filter listingContacts by contactType = 'owner'
  const ownerListings = await db.select()
    .from(schema.listingContacts)
    .where(and(
      inArray(schema.listingContacts.contactId, contactIds),
      eq(schema.listingContacts.contactType, 'owner'),
      eq(schema.listingContacts.isActive, true)
    ))
    .leftJoin(schema.listings, ...)
    .leftJoin(schema.properties, ...);

  // Group by contactId and merge with core data
}
```

### Task 2: Progressive Loading Implementation

```typescript
// In contactos/page.tsx
export default function ContactosPage() {
  // PATTERN: Separate states for each data type
  const [ownerContacts, setOwnerContacts] = useState<ContactWithTypes[]>([]);
  const [buyerContacts, setBuyerContacts] = useState<ContactWithTypes[]>([]);
  const [isLoadingOwner, setIsLoadingOwner] = useState(false);
  const [isLoadingBuyer, setIsLoadingBuyer] = useState(false);
  const [dataLoadedFor, setDataLoadedFor] = useState<'owner' | 'buyer' | null>(null);

  // CRITICAL: Determine active view from URL
  const currentFilter = searchParams.get('roles') || 'owner';
  const isOwnerView = currentFilter === 'owner';

  useEffect(() => {
    // PATTERN: No initial loading state - UI renders immediately
    
    // Fetch owner data first (default view)
    const fetchOwnerData = async () => {
      setIsLoadingOwner(true);
      try {
        const data = await listContactsOwnerDataWithAuth(1, 100, filters);
        setOwnerContacts(data);
        setDataLoadedFor('owner');
      } finally {
        setIsLoadingOwner(false);
      }
    };

    // Background fetch buyer data
    const fetchBuyerData = async () => {
      // PATTERN: Use setTimeout to deprioritize
      setTimeout(async () => {
        setIsLoadingBuyer(true);
        try {
          const data = await listContactsBuyerDataWithAuth(1, 100, filters);
          setBuyerContacts(data);
        } finally {
          setIsLoadingBuyer(false);
        }
      }, 0);
    };

    // CRITICAL: Parallel execution
    fetchOwnerData();
    fetchBuyerData();
  }, [searchParams]); // Re-fetch when filters change

  // Determine which dataset to display
  const displayContacts = isOwnerView ? ownerContacts : buyerContacts;
  const isCurrentlyLoading = isOwnerView ? isLoadingOwner : isLoadingBuyer;

  // Show skeleton only if current view is loading and no data
  const showSkeleton = isCurrentlyLoading && displayContacts.length === 0;
}
```

### Integration Points

```yaml
API:
  - No new API routes needed (using server functions directly)
  
STATE:
  - URL parameters remain source of truth
  - Local state caches both datasets
  
TYPES:
  - Extend existing ContactWithTypes interface
  - No breaking changes to component props
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                    # TypeScript checking
pnpm lint:fix                    # ESLint with auto-fix
pnpm format:write               # Prettier formatting

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Build Verification

```bash
# Ensure the app builds without errors
pnpm build

# Expected: Successful build
# Common issues: 
# - Missing exports
# - Type mismatches
# - Import errors
```

### Level 3: Manual Testing Checklist

```bash
# Start development server
pnpm dev

# Test progressive loading:
echo "✓ Navigate to /contactos - page renders immediately (no spinner)"
echo "✓ Owner contacts appear within 200ms"
echo "✓ Click buyer toggle - switches instantly"
echo "✓ Click back to owner - switches instantly"

# Test filtering consistency:
echo "✓ Select a contact in owner view - detail shows owner properties only"
echo "✓ Switch to buyer view - select same contact - shows buyer properties only"
echo "✓ URL shows ?roles=buyer and both views respect it"

# Test search and filters:
echo "✓ Search for contact name - both views update"
echo "✓ Change sort order - maintains current view"
echo "✓ Apply last contact filter - data updates correctly"

# Performance validation:
echo "✓ Open Network tab - verify two parallel requests on page load"
echo "✓ Toggle between views - no new network requests"
echo "✓ Change filters - both datasets refresh"
```

### Level 4: Performance Metrics

```bash
# Measure load time improvement
# Before: Time to first table row ~2-3 seconds
# After: Time to first table row <200ms

# Use Chrome DevTools Performance tab:
1. Record page load
2. Measure "First Contentful Paint" 
3. Verify table renders before all data loaded

# Browser request validation:
- Check Network tab shows parallel requests
- Verify requests complete in expected order
- Confirm no waterfall pattern
```

## Final Validation Checklist

- [ ] All TypeScript checks pass: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Page renders without initial spinner
- [ ] Owner data loads in <200ms
- [ ] Toggle switching is instant
- [ ] Filtering is consistent across views
- [ ] Search works correctly
- [ ] No visual regressions
- [ ] No console errors
- [ ] Network shows parallel requests

---

## Anti-Patterns to Avoid

- ❌ Don't modify the table component structure
- ❌ Don't change the URL parameter pattern  
- ❌ Don't create new loading spinners
- ❌ Don't fetch all data before rendering
- ❌ Don't break existing functionality
- ❌ Don't ignore TypeScript errors

## PRP Confidence Score: 9/10

This PRP provides comprehensive context including:
- Complete understanding of current implementation
- Clear progressive loading patterns from the codebase to follow
- Specific implementation details with pseudocode
- Database query optimization strategies
- Validation steps that ensure success
- Known gotchas and critical warnings

The 1-point deduction is because the exact Drizzle ORM syntax for the split queries might require minor adjustments during implementation, but the pattern is clear and the existing code provides good examples.