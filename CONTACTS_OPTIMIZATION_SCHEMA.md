## FEATURE: 

**Progressive Contact Data Loading with Optimized UX**

Redesign the contacts page (`src/app/(dashboard)/contactos/`) to implement progressive data loading that:
- Renders UI immediately without waiting for data queries
- Loads owner data first, displays table immediately when ready
- Fetches buyer/demand data in background for instant toggle switching
- Fixes filtering inconsistencies between table and detail views
- Optimizes for maximum UX responsiveness

## EXAMPLES:

**Current Structure Analysis:**
- Main page: `src/app/(dashboard)/contactos/page.tsx` - Currently blocks entire UI on data fetch
- Table component: `src/components/contactos/table/contact-table.tsx` - Displays 4 columns (Nombre, Contacto, Propiedades, Recordatorios)
- Query function: `listContactsWithTypesWithAuth()` in `src/server/queries/contact.ts` - Single query that fetches all data

**Current Data Flow:**
```typescript
// Current: Everything waits for one big query
useEffect(() => {
  const fetchContacts = async () => {
    setIsLoading(true); // UI shows loading state
    const rawContacts = await listContactsWithTypesWithAuth(1, 100, filters);
    setContactsList(contacts); // Table renders after everything loads
    setIsLoading(false);
  };
}, [searchParams]);
```

**Target Data Flow:**
```typescript
// Target: Progressive loading
useEffect(() => {
  // 1. Render UI immediately (no loading state)
  
  // 2. Fetch owner data first
  const fetchOwnerData = async () => {
    const ownerContacts = await listContactsOwnerDataWithAuth(filters);
    setContactsList(ownerContacts); // Table renders with owner data
    
    // 3. Background fetch buyer data
    setTimeout(async () => {
      const buyerData = await listContactsBuyerDataWithAuth(filters);
      setBuyerDataCache(buyerData); // Ready for instant toggle
    }, 0);
  };
}, [searchParams]);
```

## DOCUMENTATION:

**Current Query Analysis:**
- `listContactsWithTypes()` returns: contact info + allListings[] + prospectTitles[]
- Table columns use:
  - **Nombre**: `firstName`, `lastName`, `isActive`, `updatedAt`, role flags
  - **Contacto**: `email`, `phone`, `contactId`
  - **Propiedades**: `allListings[]` (filtered by `currentFilter`), `prospectTitles[]`
  - **Recordatorios**: Currently just placeholder

**Filtering Logic Problem:**
- **Table**: Respects URL filter (`?roles=owner|buyer`) - server-side filtering
- **Detail**: Ignores URL filter - uses contact's intrinsic roles with `else if` precedence
- **Result**: Same contact shows different data in table vs detail view

**Data Requirements:**
- **Owner View**: Need `allListings` where `contactType === "owner"`
- **Buyer View**: Need `allListings` where `contactType === "buyer"` + `prospectTitles`
- **Table Display**: Basic fields (street, city, propertyType, listingType, status)

## OTHER CONSIDERATIONS:

**Key Implementation Steps:**
1. **Create Separate Queries:**
   - `listContactsOwnerDataWithAuth()` - Returns contacts with only owner listings
   - `listContactsBuyerDataWithAuth()` - Returns contacts with only buyer listings + prospects
   - Both should return same contact structure but filtered `allListings`

2. **Progressive Loading Strategy:**
   - Render header, filters, buttons immediately (no data dependency)
   - Default to owner view, fetch owner data first
   - Display table as soon as owner data arrives
   - Background fetch buyer data, cache for instant toggle

3. **Fix Filtering Consistency:**
   - Table and detail views must respect same URL filter parameter
   - Remove `else if` precedence logic in detail view
   - Both views should show same filtered data scope

4. **State Management:**
   - `ownerContacts` state for owner view data
   - `buyerContacts` state for buyer view data  
   - `activeView` state tracks current toggle position
   - Instant switching between cached datasets

5. **Performance Optimizations:**
   - Keep existing table component unchanged (UI consistency)
   - Only modify data fetching and state management
   - Implement proper loading states per data type
   - Debounce filter changes to avoid excessive queries

**Technical Constraints:**
- Must maintain existing UI/UX exactly as is
- No changes to table component visual structure
- Use existing query infrastructure where possible
- Maintain TypeScript type safety
- Follow Next.js app directory patterns

**Success Criteria:**
- Page renders instantly without loading spinner
- Owner data table appears within 200ms of page load
- Toggle switching is instantaneous (no loading delay)
- Filtering behavior is consistent between table and detail views
- No regressions in existing functionality
