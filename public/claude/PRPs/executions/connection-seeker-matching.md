name: "Connection Seeker — Rule-Based Prospect ↔ Listing Matching System"
description: |

## Purpose

Implement a comprehensive prospect-to-listing matching system that intelligently connects buyer/renter prospects to available property listings using strict rule-based matching with limited tolerance parameters.

## Core Principles

1. **Precision Matching**: Exact matches on critical fields with ±5% tolerance on price/area only
2. **Privacy-First**: Support cross-account matching with privacy-preserving contact requests  
3. **Performance Optimized**: Efficient SQL queries with proper indexing for scale
4. **Progressive Enhancement**: Start with in-account matching, extend to cross-account

---

## Goal

Build an intelligent connection seeker that automatically matches buyer/renter prospects to property listings within the current account (primary scope) and across accounts (secondary scope) using sophisticated rule-based matching algorithms with strict constraints and limited tolerance zones.

## Why

- **Business Value**: Automate the manual process of matching prospects to listings, reducing agent workload by 60-80%
- **User Impact**: Provide instant, relevant property recommendations to prospects based on their exact requirements
- **Integration**: Enhance the existing prospects and listings workflow with intelligent automation
- **Revenue**: Increase conversion rates through better prospect-to-property matching and faster deal closure

## What

A React component that displays intelligent prospect-to-listing matches with the following capabilities:

### Success Criteria

- [ ] Display prospects with matching listings using strict rule-based algorithms
- [ ] Show "Strict" matches (within original criteria) and "Near-strict" matches (±5% tolerance)
- [ ] Support filtering: In-account vs Cross-account, property type, location
- [ ] Provide save/dismiss/contact actions for each match
- [ ] Handle cross-account privacy protection until contact acceptance
- [ ] Achieve <2s response time for matches within account
- [ ] Support pagination for large result sets

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
  why: Server actions pattern for data fetching and mutations

- url: https://tailwindcss.com/docs/utility-first
  why: Utility-first CSS patterns used throughout the project

- url: https://lucide.dev/icons
  why: Icon library used for UI components

- url: https://docs.singlestore.com/db/v8.1/en/reference/sql-reference/data-manipulation-language-dml/select.html
  why: Advanced SQL query patterns for complex filtering and joins

- file: src/server/queries/operations-listings.ts
  why: Existing pattern for complex joins between listings, properties, locations, and contacts

- file: src/server/queries/prospect.ts  
  why: Existing prospect query patterns and authentication wrapper functions

- file: src/components/prospects/prospect-table.tsx
  why: UI patterns for displaying prospect data with interactive elements

- file: src/components/property-card.tsx
  why: Property display patterns with images, badges, and key information

- file: src/server/db/schema.ts
  why: Database schema definitions for prospects, listings, properties, locations tables

- docfile: public/claude/PRPs/templates/connectionseeker.md
  why: Complete feature specification with matching rules and examples
```

### Current Codebase Tree (relevant sections)

```bash
src/
├── app/(dashboard)/operaciones/prospects/page.tsx    # Main prospects page
├── components/
│   ├── prospects/
│   │   ├── conexiones-potenciales.tsx               # Target component (skeleton)
│   │   ├── prospect-table.tsx                       # UI patterns for prospects
│   │   └── simple-prospect-card.tsx                 # Card display patterns
│   ├── property-card.tsx                            # Property display patterns
│   └── ui/                                          # Reusable UI components
├── server/
│   ├── db/schema.ts                                 # Database schemas
│   └── queries/
│       ├── prospect.ts                              # Prospect queries
│       ├── operations-listings.ts                   # Listings queries  
│       └── listing.ts                               # Core listing queries
└── types/
    └── operations.ts                                # Type definitions
```

### Desired Codebase Tree with New Files

```bash
src/
├── server/queries/
│   └── connection-matches.ts                        # New: Complex matching queries
├── components/prospects/
│   ├── conexiones-potenciales.tsx                  # Enhanced: Full implementation
│   ├── match-card.tsx                              # New: Individual match display
│   └── match-filters.tsx                           # New: Filtering interface
└── types/
    └── connection-matches.ts                        # New: Matching type definitions
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for client-side components
"use client";

// GOTCHA: BigInt IDs from SingleStore must be converted for client-side use
const prospectId = prospect.prospects.id.toString();

// CRITICAL: preferredAreas is stored as JSON and needs parsing
const areas = JSON.parse(prospect.prospects.preferredAreas || '[]');

// PERFORMANCE: Use leftJoin instead of multiple queries for related data
.leftJoin(properties, eq(listings.propertyId, properties.propertyId))

// CRITICAL: SingleStore requires explicit casting for decimal comparisons
.where(and(
  gte(sql`CAST(${listings.price} AS DECIMAL(12,2))`, minPrice),
  lte(sql`CAST(${listings.price} AS DECIMAL(12,2))`, maxPrice)
))

// AUTH: All server functions must use getCurrentUserAccountId() for security
const accountId = await getCurrentUserAccountId();

// UI: Use Lucide icons consistently throughout the app
import { Home, Bed, Bath, Square, Euro, MapPin } from "lucide-react";

// CRITICAL: ±5% tolerance calculation must handle edge cases
const priceMin = minPrice ? parseFloat(minPrice) * 0.95 : 0;
const priceMax = maxPrice ? parseFloat(maxPrice) * 1.05 : Number.MAX_VALUE;
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core matching data structures ensuring type safety and consistency

// Match result with tolerance indicators
interface ProspectMatch {
  prospectId: bigint;
  listingId: bigint;
  matchType: 'strict' | 'near-strict';
  toleranceReasons: string[]; // e.g., ["Price +3.2%", "Area -4.1%"]
  
  // Embedded prospect and listing data
  prospect: ProspectWithContact;
  listing: ListingWithDetails;
  
  // Calculated match scores
  priceMatch: 'exact' | 'tolerance' | 'out-of-range';
  areaMatch: 'exact' | 'tolerance' | 'out-of-range';
  
  // Cross-account privacy
  isCrossAccount: boolean;
  canContact: boolean;
}

// Filtering options
interface MatchFilters {
  accountScope: 'current' | 'cross-account' | 'all';
  includeNearStrict: boolean;
  propertyTypes: string[];
  locationIds: bigint[];
  minPrice?: number;
  maxPrice?: number;
}

// Paginated results
interface MatchResults {
  matches: ProspectMatch[];
  totalCount: number;
  hasNextPage: boolean;
  filters: MatchFilters;
}
```

### List of Tasks (Ordered Implementation)

```yaml
Task 1:
CREATE src/types/connection-matches.ts:
  - DEFINE ProspectMatch interface with tolerance indicators
  - DEFINE MatchFilters for filtering options
  - DEFINE MatchResults for paginated responses
  - MIRROR pattern from: src/types/operations.ts

Task 2:  
CREATE src/server/queries/connection-matches.ts:
  - IMPLEMENT getMatchesForProspects function
  - MIRROR auth pattern from: src/server/queries/prospect.ts
  - USE complex JOIN pattern from: src/server/queries/operations-listings.ts
  - IMPLEMENT ±5% tolerance calculations with SQL CAST
  - ADD proper WHERE clauses for exact matching constraints

Task 3:
CREATE src/components/prospects/match-card.tsx:
  - MIRROR card pattern from: src/components/property-card.tsx
  - DISPLAY listing image, price, location, key features
  - SHOW match type badge (Strict/Near-strict) with reasons
  - IMPLEMENT save/dismiss/contact action buttons
  - HANDLE cross-account privacy masking

Task 4:
CREATE src/components/prospects/match-filters.tsx:
  - MIRROR filter pattern from: src/components/prospects/prospect-filter.tsx
  - IMPLEMENT account scope toggle
  - ADD near-strict inclusion toggle
  - ADD property type and location filters
  - USE URL params for filter persistence

Task 5:
ENHANCE src/components/prospects/conexiones-potenciales.tsx:
  - REPLACE skeleton with full implementation
  - INTEGRATE match-card and match-filters components
  - IMPLEMENT pagination using existing PaginationControls
  - ADD loading states and error handling
  - USE React hooks for data fetching and state management

Task 6:
ADD database indexes for performance:
  - CREATE index on listings(accountId, listingType, propertyId)
  - CREATE index on properties(propertyType, bedrooms, bathrooms)
  - CREATE index on properties(squareMeter, neighborhoodId)
  - OPTIMIZE for fast filtering and sorting
```

### Task 2 Pseudocode (Critical Implementation)

```typescript
// Complex matching query with tolerance calculations
export async function getMatchesForProspects({
  accountId, 
  prospectIds, 
  filters,
  pagination
}: MatchQueryParams): Promise<MatchResults> {
  // PATTERN: Always validate and get current user account
  const currentAccountId = await getCurrentUserAccountId();
  
  // CRITICAL: Build dynamic WHERE clauses for exact matching
  const baseQuery = db
    .select({
      // Prospect fields
      prospectId: prospects.id,
      prospectListingType: prospects.listingType,
      prospectPropertyType: prospects.propertyType,
      prospectMinPrice: prospects.minPrice,
      prospectMaxPrice: prospects.maxPrice,
      prospectMinBedrooms: prospects.minBedrooms,
      prospectMinBathrooms: prospects.minBathrooms,
      prospectMinSquareMeters: prospects.minSquareMeters,
      prospectMaxSquareMeters: prospects.maxSquareMeters,
      prospectPreferredAreas: prospects.preferredAreas,
      prospectExtras: prospects.extras,
      
      // Listing + Property fields (flattened for performance)
      listingId: listings.listingId,
      listingPrice: listings.price,
      listingType: listings.listingType,
      listingAccountId: listings.accountId,
      propertyType: properties.propertyType,
      propertyBedrooms: properties.bedrooms,
      propertyBathrooms: properties.bathrooms,
      propertySquareMeters: properties.squareMeter,
      propertyNeighborhoodId: properties.neighborhoodId,
      
      // Location and contact info
      neighborhoodName: locations.neighborhood,
      municipality: locations.municipality,
      ownerContactId: contacts.contactId,
      ownerName: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      
      // Property features for must-have matching
      hasElevator: properties.hasElevator,
      hasGarage: properties.hasGarage,
      hasStorageRoom: properties.hasStorageRoom,
      terrace: properties.terrace,
    })
    .from(prospects)
    .innerJoin(
      listings,
      and(
        // EXACT MATCH: Operation type (Sale/Rent)
        eq(prospects.listingType, listings.listingType),
        
        // ACCOUNT SCOPE: Current account or cross-account based on filters
        filters.accountScope === 'current' 
          ? eq(listings.accountId, BigInt(currentAccountId))
          : ne(listings.status, 'Draft'), // Active listings only
        
        // STATUS: Only active listings
        eq(listings.isActive, true)
      )
    )
    .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
    .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
    .leftJoin(listingContacts, and(
      eq(listingContacts.listingId, listings.listingId),
      eq(listingContacts.contactType, 'owner')
    ))
    .leftJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
    .where(
      and(
        // EXACT MATCH: Property type
        eq(prospects.propertyType, properties.propertyType),
        
        // MINIMUM REQUIREMENTS: Bedrooms and bathrooms
        gte(properties.bedrooms, prospects.minBedrooms),
        gte(properties.bathrooms, sql`CAST(${prospects.minBathrooms} AS DECIMAL(3,1))`),
        
        // PRICE TOLERANCE: ±5% expansion of prospect budget
        gte(
          sql`CAST(${listings.price} AS DECIMAL(12,2))`, 
          sql`CAST(${prospects.minPrice} AS DECIMAL(12,2)) * 0.95`
        ),
        lte(
          sql`CAST(${listings.price} AS DECIMAL(12,2))`, 
          sql`CAST(${prospects.maxPrice} AS DECIMAL(12,2)) * 1.05`
        ),
        
        // AREA TOLERANCE: ±5% expansion if specified
        or(
          isNull(prospects.minSquareMeters),
          gte(properties.squareMeter, sql`${prospects.minSquareMeters} * 0.95`)
        ),
        or(
          isNull(prospects.maxSquareMeters),
          lte(properties.squareMeter, sql`${prospects.maxSquareMeters} * 1.05`)
        ),
        
        // LOCATION MATCH: Must be in preferred areas (JSON array contains)
        or(
          isNull(prospects.preferredAreas),
          sql`JSON_CONTAINS(${prospects.preferredAreas}, JSON_OBJECT('neighborhoodId', ${properties.neighborhoodId}))`
        )
      )
    );

  // EXECUTE and post-process for tolerance classification
  const rawResults = await baseQuery;
  
  // CRITICAL: Classify matches as strict vs near-strict
  const processedMatches = rawResults.map(result => {
    const toleranceReasons: string[] = [];
    let matchType: 'strict' | 'near-strict' = 'strict';
    
    // Check price tolerance
    const originalMinPrice = parseFloat(result.prospectMinPrice || '0');
    const originalMaxPrice = parseFloat(result.prospectMaxPrice || '999999999');
    const listingPrice = parseFloat(result.listingPrice);
    
    if (listingPrice < originalMinPrice) {
      const percentBelow = ((originalMinPrice - listingPrice) / originalMinPrice * 100).toFixed(1);
      toleranceReasons.push(`Price -${percentBelow}%`);
      matchType = 'near-strict';
    } else if (listingPrice > originalMaxPrice) {
      const percentAbove = ((listingPrice - originalMaxPrice) / originalMaxPrice * 100).toFixed(1);
      toleranceReasons.push(`Price +${percentAbove}%`);
      matchType = 'near-strict';
    }
    
    // Check area tolerance (similar logic)
    // ... area tolerance calculation
    
    return {
      ...result,
      matchType,
      toleranceReasons,
      isCrossAccount: result.listingAccountId.toString() !== currentAccountId,
      canContact: result.listingAccountId.toString() === currentAccountId
    };
  });
  
  // FILTER: Apply near-strict inclusion filter
  const filteredMatches = filters.includeNearStrict 
    ? processedMatches
    : processedMatches.filter(m => m.matchType === 'strict');
    
  // PAGINATION: Apply offset and limit
  const paginatedMatches = filteredMatches.slice(
    pagination.offset, 
    pagination.offset + pagination.limit
  );
  
  return {
    matches: paginatedMatches,
    totalCount: filteredMatches.length,
    hasNextPage: filteredMatches.length > pagination.offset + pagination.limit,
    filters
  };
}
```

### Integration Points

```yaml
DATABASE:
  - indexes: 
    - "CREATE INDEX idx_prospects_search ON prospects(listingType, propertyType, minPrice, maxPrice)"
    - "CREATE INDEX idx_listings_match ON listings(listingType, accountId, isActive, status)"
    - "CREATE INDEX idx_properties_features ON properties(propertyType, bedrooms, bathrooms, squareMeter)"
    - "CREATE INDEX idx_properties_location ON properties(neighborhoodId, propertyId)"

ROUTES:
  - add server action: getMatchesForProspects
  - pattern: "use server" directive at top of file

UI_COMPONENTS:
  - integrate: src/components/prospects/conexiones-potenciales.tsx
  - pattern: Card-based layout with filters and pagination
  - reuse: Badge, Button, Card components from ui/
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                           # TypeScript validation
pnpm lint:fix                           # ESLint with auto-fix
pnpm format:write                       # Prettier formatting

# Expected: No errors. If errors, READ the message and fix root cause.
```

### Level 2: Unit Tests

```typescript
// CREATE __tests__/connection-matches.test.ts
describe('getMatchesForProspects', () => {
  it('should return strict matches within original budget', async () => {
    const mockProspect = {
      listingType: 'Rent',
      propertyType: 'piso', 
      minPrice: '1000',
      maxPrice: '1500',
      minBedrooms: 2
    };
    
    const result = await getMatchesForProspects({
      prospectIds: [mockProspect.id],
      filters: { includeNearStrict: false }
    });
    
    expect(result.matches).toHaveLength(2); // Based on test data
    expect(result.matches[0].matchType).toBe('strict');
  });

  it('should apply ±5% price tolerance for near-strict matches', async () => {
    const result = await getMatchesForProspects({
      prospectIds: [testProspectId],
      filters: { includeNearStrict: true }
    });
    
    const nearStrictMatch = result.matches.find(m => m.matchType === 'near-strict');
    expect(nearStrictMatch.toleranceReasons).toContain(expect.stringMatching(/Price [+-]\d+\.\d+%/));
  });

  it('should exclude listings missing required features', async () => {
    // Test that listings without elevator are excluded when prospect requires it
    const prospectWithElevator = { extras: { elevator: true } };
    
    const result = await getMatchesForProspects({
      prospectIds: [prospectWithElevator.id]
    });
    
    result.matches.forEach(match => {
      expect(match.listing.properties.hasElevator).toBe(true);
    });
  });
});
```

```bash
# Run and iterate until passing:
pnpm test connection-matches.test.ts
# If failing: Read error message, understand root cause, fix code logic
```

### Level 3: Integration Test  

```bash
# Start development server
pnpm dev

# Test the matching component in browser
open http://localhost:3000/operaciones/prospects

# Manual test checklist:
echo "✓ Connection seeker component loads without errors"
echo "✓ Shows prospect matches with correct property details"
echo "✓ Displays match type badges (Strict/Near-strict) correctly"
echo "✓ Filter toggles work (account scope, near-strict inclusion)"
echo "✓ Pagination controls function properly"
echo "✓ Save/Dismiss/Contact actions respond correctly"
```

### Level 4: Creative Validation

```bash
# Performance testing with realistic data
echo "✓ Response time <2s with 100+ prospects and 1000+ listings"
echo "✓ Memory usage stable during filtering operations"
echo "✓ SQL query execution time <500ms for complex matches"

# Edge case validation
echo "✓ Handles prospects with missing price ranges gracefully"
echo "✓ Correctly processes JSON preferred areas with malformed data"
echo "✓ Cross-account privacy masking works as expected"
echo "✓ Tolerance calculations handle edge cases (0 values, very large numbers)"

# User experience validation  
echo "✓ Loading states appear during data fetching"
echo "✓ Error messages are helpful and actionable"
echo "✓ Empty states guide users to adjust filters"
echo "✓ Match cards display essential information clearly"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Component renders without errors: Manual browser test
- [ ] Database queries perform efficiently: Check execution time
- [ ] Matches are accurate: Verify against manual calculations
- [ ] Cross-account privacy respected: Test with multi-account data
- [ ] Responsive design works on mobile: Test viewport scaling

---

## Anti-Patterns to Avoid

- ❌ Don't fetch all prospects and listings then filter in JavaScript (use SQL WHERE clauses)
- ❌ Don't ignore the ±5% tolerance requirement (implement precise calculations)
- ❌ Don't expose cross-account contact info before acceptance
- ❌ Don't use client-side filtering for large datasets (server-side pagination)
- ❌ Don't hardcode property type mappings (use schema enums)
- ❌ Don't skip input validation on price ranges (prevent SQL injection)
- ❌ Don't create new card layouts (reuse existing property-card patterns)

---

## Confidence Score: 8.5/10

**Reasoning**: This PRP provides comprehensive context including:
- ✅ Complete database schema understanding
- ✅ Existing query and UI patterns to follow  
- ✅ Detailed matching algorithm requirements
- ✅ Performance optimization considerations
- ✅ Privacy and cross-account handling
- ✅ Specific tolerance calculation logic
- ✅ Comprehensive testing approach

**Risk Factors** (-1.5 points):
- Complex SQL with tolerance calculations may require iteration
- Cross-account privacy features add complexity
- Performance optimization with large datasets needs monitoring

**Success Indicators**: With this level of detail, the AI should successfully implement the core functionality in one pass, with minor refinements needed for performance optimization and edge cases.