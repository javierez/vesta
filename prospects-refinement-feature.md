## FEATURE:

Enhanced Prospects Management System with Dual-Type Kanban Workflow. All in Spanish, file names in english.

Based on the prospects template and existing codebase analysis, this feature requires refining the current prospects management system to handle two distinct prospect types:

1. **Listing Prospects**: Clients wanting to sell/rent properties (data stored in `listing` + `property` + `contact` tables)
2. **Search Prospects**: Clients looking for properties (data stored in `prospect` + `contact` tables)

The feature should implement a sophisticated kanban board at `/operaciones/prospects` that:
- Dynamically renders different card layouts based on prospect type
- Supports different status workflows for listing vs. search prospects
- Provides filtering between listing types (Sale/Rent) and prospect types
- Maintains the existing drag-and-drop functionality while handling two different data models
- Includes proper validation for status transitions specific to each prospect type

### Key Enhancements Required:

**Status Workflows to Implement:**
- **Listing Prospects**: "basic information retrieved & created" → "valoración (aceptar, visita, valor)" → "hoja de encargo (firmar)" → "En búsqueda"
- **Search Prospects**: "basic info retrieved & created" → "En búsqueda"

**UI/UX Requirements:**
- Cards show listing characteristics for selling/renting prospects
- Cards show search criteria fields for demand prospects  
- Conditional status columns based on prospect type
- Smart filtering system that accounts for both prospect types

## EXAMPLES:

**Existing Kanban Implementation:**
- `/Users/javierperezgarcia/Downloads/vesta/src/components/operations/KanbanBoard.tsx` - Sophisticated drag-and-drop implementation with @dnd-kit
- `/Users/javierperezgarcia/Downloads/vesta/src/components/operations/KanbanCard.tsx` - Card component with operation-specific rendering
- `/Users/javierperezgarcia/Downloads/vesta/src/components/operations/KanbanColumn.tsx` - Column structure with status management

**Existing Operations Structure:**
- `/Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/operaciones/[type]/page.tsx` - Dynamic routing for operations types
- `/Users/javierperezgarcia/Downloads/vesta/src/server/queries/operations-kanban.ts` - Complex queries joining prospects, contacts, listings, properties

**Data Model Examples:**
- `/Users/javierperezgarcia/Downloads/vesta/src/server/queries/prospect.ts` - CRUD operations for prospect table
- `/Users/javierperezgarcia/Downloads/vesta/src/types/listing.ts` - Comprehensive listing interfaces
- `/Users/javierperezgarcia/Downloads/vesta/src/types/property-listing.ts` - 150+ property attributes

**UI Pattern Examples:**
- `/Users/javierperezgarcia/Downloads/vesta/src/components/dashboard/OperacionesSummaryCard.tsx` - Sale/Rent toggle implementation  
- `/Users/javierperezgarcia/Downloads/vesta/src/components/contactos/detail/forms/contact-prospect-compact.tsx` - Prospect form patterns

Note: The `public/examples/` folder is currently empty, so all examples are drawn from the existing codebase implementation.

## DOCUMENTATION:

**@dnd-kit Documentation:**
- https://docs.dndkit.com/introduction/getting-started - Core drag-and-drop implementation patterns
- https://docs.dndkit.com/presets/sortable - Sortable list implementation for kanban columns
- https://docs.dndkit.com/api-documentation/sensors - Touch and keyboard sensor configuration

**Next.js App Router:**
- https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes - Dynamic route implementation for `/operations/[type]`
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions - Server actions for status updates

**shadcn/ui Components:**
- https://ui.shadcn.com/docs/components/table - Dense table layout patterns for List view
- https://ui.shadcn.com/docs/components/tabs - List/Kanban toggle implementation
- https://ui.shadcn.com/docs/components/badge - Status indicator components

**Database Schema References:**
- Existing prospects table schema in codebase with all fields documented
- Listing and property relationship patterns already implemented
- Contact table relationships with multi-tenant accountId filtering

**Security Patterns:**
- Multi-tenant architecture documentation in existing queries
- Account-based filtering patterns in `/src/server/queries/operaciones-dashboard.ts`
- getCurrentUserAccountId() implementation in `/src/lib/dal.ts`

## OTHER CONSIDERATIONS:

**Critical Gotchas for AI Coding Assistants:**

1. **Dual Data Model Complexity**: Unlike standard kanban implementations, this feature requires handling two completely different data models (listing-based vs. prospect-based) in the same UI. The kanban cards must conditionally render different fields and the status workflows have different steps.

2. **Status Workflow Validation**: The status transitions are NOT the same for both prospect types:
   - Listing prospects: 4-step workflow ending in "En búsqueda"  
   - Search prospects: 2-step workflow directly to "En búsqueda"
   - The kanban columns must dynamically change based on filtering

3. **Multi-Tenant Security Gap**: The existing `/src/server/queries/prospect.ts` file is MISSING accountId filtering on all functions. This is a critical security vulnerability that must be fixed before implementing the enhanced UI.

4. **BigInt Database ID Handling**: All prospect, listing, and contact IDs are BigInt in the database. Conversion to/from string is required for URL params and drag-and-drop operations.

5. **Complex Query Optimization**: The kanban view requires joining across 4+ tables (prospects, contacts, listings, properties) with proper accountId filtering. Watch for N+1 query problems with large datasets.

6. **Mobile Drag-and-Drop**: The existing implementation uses @dnd-kit but needs verification for touch interactions on mobile kanban boards, especially with horizontal scrolling.

7. **State Management Complexity**: Optimistic updates during drag-and-drop must handle rollback scenarios while maintaining data consistency across both prospect types.

8. **Spanish UI Labels**: All status labels and UI text should be in Spanish to match the existing application ("En búsqueda", "valoración", "hoja de encargo").

9. **Filtering Logic**: The Sale/Rent filter needs to work differently for the two prospect types - for listing prospects it filters by listing.type, for search prospects it filters by prospect.listingType.

10. **Concurrent User Updates**: With multiple agents potentially dragging cards simultaneously, implement proper conflict resolution and real-time updates.

**Required Environment Setup:**
- @dnd-kit dependencies need to be installed (not currently in package.json)
- TypeScript strict mode compliance for all new interfaces
- Existing Framer Motion animations should be maintained for consistency
- Mobile viewport testing required for drag interactions

**Performance Considerations:**
- Implement pagination for kanban boards with 100+ prospects
- Use React.memo for drag-and-drop performance optimization
