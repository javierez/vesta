## FEATURE:

Implement comprehensive Kanban boards for operations management at `/operations/{prospects|leads|deals}` with List/Kanban view toggle, drag-and-drop functionality, bulk actions, and Sale/Rent filtering. Each operation type will have its own route with specific column layouts and status workflows, providing an interactive pipeline view that complements the existing operations dashboard.

### Key Requirements:

1. **Dynamic Route Structure** (`/operations/{prospects|leads|deals}`):
   - Support for three operation types with shared component architecture
   - Toggle between List and Kanban views (via URL params or separate routes for performance)
   - Sale/Rent filtering mechanism with persistent state
   - Responsive design maintaining existing aesthetic

2. **List View Specifications**:
   - **Prospects**: Contact, Need summary (price/area/rooms), Status, Urgency, Last activity, Next task
   - **Leads**: Contact, Listing, Source, Status, Last activity, Next task  
   - **Deals**: Listing, Stage, Amount, Close date, Participants, Last activity, Next task
   - Dense table layout with sorting and filtering capabilities

3. **Kanban View Specifications**:
   - **Prospects**: New → Working → Qualified → Archived
   - **Leads**: New → Working → Converted → Disqualified
   - **Deals**: Offer → UnderContract → Closed → Lost
   - Drag-and-drop cards between status columns
   - Visual indicators for urgency and deadlines
   - Card quick actions and bulk operations

4. **Bulk Actions**:
   - Assign operations to users
   - Update status across multiple items
   - Create tasks for selected operations
   - Export functionality

5. **Sale/Rent Filtering**:
   - Toggle filter UI component in top bar
   - Persistent filter state in URL params
   - Real-time data updates based on filter selection

## EXAMPLES:

### Relevant Existing Patterns:

**Dashboard Layout Structure:**
- `/src/app/(dashboard)/operaciones/page.tsx` - Current operations overview with card-based layout
  - Uses `bg-gray-50` background with `max-w-7xl mx-auto px-4 py-8` container
  - Implements Suspense with loading fallbacks and error boundaries
  - Server component pattern with parallel data fetching

**Toggle and Filter Patterns:**
- `/src/components/dashboard/OperacionesSummaryCard.tsx` - Sale/Rent toggle implementation
  - State management: `const [activeType, setActiveType] = useState<"sale" | "rent">("sale")`
  - Toggle buttons with visual feedback and active states
  - Framer Motion animations: `whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}`

**Data Query Patterns:**
- `/src/server/queries/operaciones-dashboard.ts` - Multi-tenant querying with accountId filtering
  - Shows prospects/leads/deals aggregation by status and listingType
  - Demonstrates proper JOIN patterns and SQL aggregation with `sql<number>` template literals
  - Account security: `eq(contacts.accountId, accountId)` in every query

**Table and List Patterns:**
- `/src/app/(dashboard)/contactos/page.tsx` - Dense table layout with sorting and pagination
- `/src/components/ui/table.tsx` - Reusable table components with hover effects
- Badge system for status indicators with color coding

**Database Schema:**
- **Prospects**: `src/server/db/schema.ts:507-527` - Status workflow, listingType (Sale/Rent), urgency levels
- **Leads**: `src/server/db/schema.ts:410-421` - Status tracking, source attribution, prospect lineage
- **Deals**: `src/server/db/schema.ts:422-433` - Deal stages, amounts, close dates, listing relationships

**Animation and Interaction:**
- Framer Motion patterns consistent across dashboard components
- `AnimatePresence` for conditional content transitions
- Hover states and visual feedback for interactive elements

## DOCUMENTATION:

### Frontend Framework and Routing:
- **Next.js App Router**: https://nextjs.org/docs/app/building-your-application/routing
  - Dynamic routes with `[type]` parameter for operation types
  - URL params for view toggle and filtering state
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - Bulk action implementations and status updates

### Kanban Board Implementation:
- **@dnd-kit/core**: https://docs.dndkit.com/introduction/getting-started
  - Drag-and-drop functionality for kanban cards
  - Accessibility-compliant interactions
- **@dnd-kit/sortable**: https://docs.dndkit.com/presets/sortable
  - Sortable list implementation for kanban columns

### UI Components and Styling:
- **shadcn/ui Table**: https://ui.shadcn.com/docs/components/table
  - Dense table layout for list views
- **shadcn/ui Tabs**: https://ui.shadcn.com/docs/components/tabs  
  - List/Kanban view toggle implementation
- **Framer Motion**: https://www.framer.com/motion/introduction/
  - Card animations and transitions
- **Lucide Icons**: https://lucide.dev/icons
  - Status indicators and action icons

### Database and Query Optimization:
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
  - Complex JOINs for operation data with related entities
  - Aggregation queries for status counts in kanban columns
- **SingleStore**: https://docs.singlestore.com/
  - Index optimization for status and date filtering

### Real Estate CRM References:
- **Pipedrive Kanban**: https://www.pipedrive.com/en/features/pipeline-view
  - Visual pipeline representation and drag-and-drop interactions
- **HubSpot Deal Board**: https://www.hubspot.com/products/crm/deal-management
  - Deal stages and bulk action patterns

## OTHER CONSIDERATIONS:

### Performance Optimization:

**Route Performance Strategy:**
- Consider separate routes (`/operations/prospects-list`, `/operations/prospects-kanban`) vs URL params
- URL params offer better user experience but may impact initial load performance
- Implement client-side view switching after initial data load for speed

**Database Query Optimization:**
- **Kanban Column Counts**: Pre-calculate status counts with efficient aggregation
- **Card Data**: Lazy load detailed card information on demand
- **Filtering**: Use database-level filtering rather than client-side for large datasets
- **Pagination**: Implement virtual scrolling for kanban columns with 100+ cards

### Drag-and-Drop Implementation:

**Status Transition Validation:**
- Enforce valid status transitions (e.g., can't go from "New" directly to "Closed")
- Implement optimistic updates with rollback on server validation failure
- Visual feedback during drag operations with proper collision detection

**Multi-tenant Security:**
- Validate accountId on all drag-and-drop status updates
- Prevent cross-account data manipulation in bulk operations
- Audit trail for all status changes with user attribution

### Mobile Responsiveness:

**Kanban Mobile Strategy:**
- Horizontal scrolling for kanban columns on mobile
- Touch-friendly drag interactions with haptic feedback
- Collapsible column headers to save vertical space
- Alternative mobile view: card list grouped by status

**List View Mobile:**
- Responsive table with collapsible columns
- Priority column visibility (contact name, status always visible)
- Swipe actions for quick status updates

### Filter and State Management:

**Sale/Rent Filter Implementation:**
```typescript
// URL-based filter state
const searchParams = useSearchParams();
const filterType = searchParams.get('type') || 'all'; // 'sale', 'rent', 'all'

// Filter persistence
const updateFilter = (type: 'sale' | 'rent' | 'all') => {
  const params = new URLSearchParams(searchParams);
  params.set('type', type);
  router.push(`${pathname}?${params.toString()}`);
};
```

**View Toggle Strategy:**
```typescript
// Optimized for speed - client-side toggle after data load
const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
// Or URL-based for shareable links
const view = searchParams.get('view') || 'list';
```

### Bulk Actions Implementation:

**Selection Management:**
- Checkbox selection in list view, multi-select in kanban
- "Select All" functionality with page/filter awareness
- Visual indicators for selected items count

**Action Types:**
1. **Assign to User**: Dropdown with user list, update assignedTo field
2. **Update Status**: Batch status updates with transition validation
3. **Create Tasks**: Bulk task creation with template selection
4. **Export Data**: CSV/Excel export with current filter/selection

### Common Implementation Gotchas:

**Database Schema Alignment:**
- Status values must match existing enum definitions in operation notes
- Ensure listingType field exists and is properly indexed for Sale/Rent filtering
- Foreign key relationships for contact names, listing addresses, user assignments

**Authentication and Authorization:**
- All operations must include accountId filtering
- User role-based access control for bulk actions
- Session validation for drag-and-drop API calls

**State Management Complexity:**
- Avoid over-engineering state management - use React state for UI, server state for data
- Implement proper error boundaries for drag-and-drop failures
- Handle concurrent updates from multiple users gracefully

**Animation Performance:**
- Throttle drag animations to prevent performance issues
- Use CSS transforms instead of layout changes for smooth interactions
- Implement skeleton loading for kanban column data

### Integration Points:

**Navigation Integration:**
- Update main navigation to include operations board links
- Breadcrumb navigation for operation type context
- Quick switcher between operation types

**Existing Dashboard Integration:**
- Link from operations dashboard summary cards to specific kanban boards
- Maintain filter context when navigating between views
- Share query logic between dashboard and kanban views

**Task Management Integration:**
- Quick task creation from kanban cards
- Task completion updates reflected in card data
- Due date indicators on kanban cards

### Success Metrics:

**User Experience:**
- < 2 seconds initial load time for kanban view
- Smooth 60fps drag-and-drop interactions
- Mobile-friendly touch interactions
- Zero data loss during drag operations

**Data Integrity:**
- 100% accountId filtering compliance
- Audit trail for all status changes
- Proper error handling for concurrent updates

**Performance Benchmarks:**
- Support 1000+ operations per kanban board
- Bulk actions complete in < 5 seconds
- Real-time updates without page refresh