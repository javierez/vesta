## FEATURE:

Build a comprehensive Operations Dashboard at `/operations` that provides a unified view of all real estate operations (prospects, leads, and deals) for both sales and rentals. The dashboard should display KPI summaries, urgent tasks, today's appointments, and provide quick navigation to detailed pipeline views while maintaining the app's minimalist design aesthetic.

### Key Requirements:

1. **Operations Summary Dashboard** (`/operations`):
   - Display consolidated KPI cards for Sale vs Rent operations
   - Show counts and status breakdowns for prospects, leads, and deals
   - Present urgent work queue (tasks due in next 5 working days)
   - Display today's and tomorrow's appointments
   - Provide quick actions for common workflows

2. **Status Workflow Integration**:
   - **Sale Prospects**: New → Working → Qualified → Archived
   - **Sale Leads**: New → Working → Converted → Disqualified  
   - **Sale Deals**: Offer → UnderContract → Closed → Lost
   - **Rent Prospects**: New → Working → Qualified → Archived
   - **Rent Leads**: New → Working → Converted → Disqualified
   - **Rent Deals**: Offer → UnderContract → Closed → Lost

3. **Design Requirements**:
   - Maintain existing minimalist gray/white color scheme
   - Use consistent card-based layout with `rounded-2xl` and `shadow-md`
   - Implement Framer Motion animations for interactivity
   - Ensure mobile responsiveness with proper grid stacking
   - Include loading skeletons and empty states

4. **Performance Requirements**:
   - Always filter by `accountId` for multi-tenant security
   - Optimize queries with proper database indexes
   - Implement efficient counting queries for KPIs
   - Use skeleton loading states to prevent layout shift

## EXAMPLES:

### Relevant UI Components and Patterns:

**Dashboard Layout Structure:**
- `/src/app/(dashboard)/dashboard/page.tsx` - Main dashboard with card grid layout
  - Background: `bg-gray-50`
  - Container: `max-w-7xl mx-auto px-4 py-8`
  - Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Existing Dashboard Cards:**
- `/src/components/dashboard/OperacionesEnCursoCard.tsx` - Complex operations summary with:
  - Toggle between sale/rent operations
  - Animated counters (`text-5xl font-extrabold`)
  - Expandable process breakdowns with sub-items
  - Color-coded status indicators

- `/src/components/dashboard/AccionesRapidasCard.tsx` - Quick actions grid:
  - 2x2 grid layout (`grid-cols-2`) 
  - Icon + label pattern from Lucide React
  - Consistent hover animations

**Calendar and Appointments:**
- `/src/app/(dashboard)/calendario/page.tsx` - Multi-view appointment system:
  - List, Calendar, Weekly view toggles
  - Advanced popover-based filtering
  - Time-slot grid layouts for weekly view
  - Event details with fixed positioning

**UI Component System:**
- `/src/components/ui/card.tsx` - Consistent card system with variants
- `/src/components/ui/badge.tsx` - Status badges with `default`, `secondary`, `destructive` variants
- `/src/components/ui/button.tsx` - Multiple button variants and sizes
- `/src/components/ui/table.tsx` - Responsive table components with hover effects

**Animation Patterns:**
- Framer Motion integration with `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`
- `AnimatePresence` for conditional content transitions
- Motion components for smooth interactions

### Database Query Patterns:

**Existing Query Structure:**
- `/src/server/queries/prospect.ts` - Prospect CRUD with Drizzle ORM
- `/src/server/queries/lead.ts` - Lead management queries
- `/src/server/queries/deal.ts` - Deal tracking operations
- `/src/server/queries/task.ts` - Task management with due date filtering
- `/src/server/queries/appointment.ts` - Appointment scheduling queries

**Schema Relationships:**
- Multi-tenant structure via `accountId` foreign keys
- BetterAuth compatible user system (`varchar(36)` IDs)
- Entity linking via `entityType` and `entityId` for tasks/appointments
- Status workflows defined in operation notes

## DOCUMENTATION:

### CRM Dashboard Design References:

**Industry Standards:**
- **HubSpot CRM Dashboard**: Activity-centric design with KPI cards and unified task management
  - URL: https://www.hubspot.com/products/crm
  - Pattern: Top KPI row, middle activity feed, bottom quick actions
  
- **Salesforce Lightning Dashboard**: Executive summary with customizable widgets
  - URL: https://trailhead.salesforce.com/en/content/learn/modules/lightning_dashboard
  - Pattern: Widget-based layout with drag-and-drop customization

- **Pipedrive Dashboard**: Pipeline-focused with visual stage representations  
  - URL: https://www.pipedrive.com/en/features/sales-dashboard
  - Pattern: Pipeline overview with deal progression visualization

### Technical Documentation:

**Frontend Framework:**
- **Next.js App Router**: https://nextjs.org/docs/app/building-your-application/routing
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **React Hook Form**: https://react-hook-form.com/docs - for form handling

**Styling and UI:**
- **Tailwind CSS**: https://tailwindcss.com/docs - consistent utility classes
- **shadcn/ui**: https://ui.shadcn.com/docs/components - component library patterns
- **Framer Motion**: https://www.framer.com/motion/introduction/ - animation system
- **Lucide Icons**: https://lucide.dev/icons - consistent iconography

**Database and Queries:**
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview - type-safe database queries
- **SingleStore**: https://docs.singlestore.com/ - database optimization patterns

### Real Estate CRM Workflows:

**Status Management References:**
- Operation notes document defines complete status workflows for sales and rentals
- Color coding system: 🟥 (required), 🟨 (optional), ⬜️ (no database process)
- Process stages from prospect capture to deal closure with post-sale activities

## OTHER CONSIDERATIONS:

### Performance Optimization:

**Critical Database Patterns:**
- **Always filter by accountId** in ALL queries for multi-tenant security
- **Required indexes**: status, createdAt, accountId, listingId, contactId
- **Query optimization**: Use aggregation functions for counts, avoid N+1 queries
- **Pagination**: Implement for task lists and large operation sets
- **Caching strategy**: Consider caching operation counts that change infrequently

### UI/UX Critical Requirements:

**Dashboard Usability:**
- **5-second rule**: Dashboard must be scannable and actionable within 5 seconds
- **Mobile-first**: All cards must stack properly on mobile devices (`grid-cols-1`)
- **Loading states**: Skeleton components prevent layout shift during data loading
- **Empty states**: Design for new users with no operations (onboarding flow)
- **Accessibility**: Status colors must have sufficient contrast ratios

**Animation and Interaction:**
- **Consistent motion**: Use existing Framer Motion patterns from other dashboard cards
- **Hover feedback**: All interactive elements should have hover states
- **Focus management**: Proper focus indicators for keyboard navigation
- **Error handling**: Graceful error states with retry mechanisms

### Implementation Strategy:

**Development Phases:**
1. **Phase 1**: Create `/operations/page.tsx` with basic layout structure
2. **Phase 2**: Implement KPI summary cards with real-time operation counts  
3. **Phase 3**: Build work queue component (urgent tasks + today's appointments)
4. **Phase 4**: Add quick action buttons with proper routing to pipelines
5. **Phase 5**: Implement filters, search, and advanced functionality
6. **Phase 6**: Performance optimization and error handling

**Status Workflow Compliance:**
- **Enforce status enums**: Use TypeScript enums or constants, never hardcode strings
- **Validate transitions**: Ensure status changes follow defined workflows
- **Audit trail**: Track status changes with timestamps and user attribution
- **Color coding**: Implement visual indicators matching operation notes system

### Security and Data Integrity:

**Multi-tenant Security:**
- **Mandatory accountId filtering**: Every query MUST include accountId constraint
- **User permissions**: Respect user role-based access to different operations
- **Data isolation**: Prevent cross-account data leakage in aggregated views
- **Audit logging**: Track all operations dashboard actions for compliance

### Common Implementation Pitfalls:

**Database Mistakes:**
- **Don't create new tables** - use existing schema with proper relationships
- **Don't forget accountId** - critical for multi-tenant security
- **Don't hardcode statuses** - use enums from operation notes definitions
- **Don't over-fetch data** - optimize queries for dashboard-specific needs

**UI/UX Mistakes:**
- **Don't over-engineer** - start with simple layouts, iterate based on feedback
- **Don't break existing patterns** - follow established design system
- **Don't create heavy dashboards** - focus on actionable information only
- **Don't ignore mobile** - responsive design is mandatory

**Performance Mistakes:**
- **Don't create N+1 queries** - batch data fetching appropriately  
- **Don't skip loading states** - users need feedback during data loading
- **Don't forget error boundaries** - implement proper error handling
- **Don't ignore caching** - optimize for frequently accessed data

### Dashboard Layout Design Options:

Based on CRM best practices and the request for three different approaches:

**Option 1: Executive Summary Layout (Recommended)**
- Top row: 4 KPI cards (Sale Prospects/Leads/Deals + Rent Prospects/Leads/Deals)
- Middle section: Work queue (urgent tasks + today's appointments) in 2-column layout
- Bottom: Quick actions grid (2x4) with most-used workflows
- Rationale: Matches existing OperacionesEnCursoCard pattern, scannable in 5 seconds

**Option 2: Activity-Centric Layout**
- Left column (2/3 width): Combined timeline of tasks, appointments, and recent activities
- Right sidebar (1/3 width): KPI summary cards stacked vertically + quick actions
- Rationale: Focuses on immediate work, similar to HubSpot's approach

**Option 3: Pipeline-Focused Layout**
- Top: Mini pipeline visualizations showing deal stages for Sale vs Rent
- Middle: Combined work queue with status-based groupings
- Bottom: KPI summary with trend indicators + quick actions
- Rationale: Visual pipeline representation for stage-based workflows

### Quick Actions Analysis & Recommendations:

**Essential Actions (must include):**
1. **Add New Prospect** ✅
   - Reasoning: Primary lead generation workflow
   - Implementation: Direct route to `/prospects/new`

2. **Add Task** ✅
   - Reasoning: Most frequent daily action for follow-ups
   - Implementation: Quick modal with entity linking dropdown

3. **View Sales Pipeline** ✅
   - Reasoning: Core business visibility
   - Implementation: Navigate to `/operations/deals?type=sale`

4. **View Rent Pipeline** ✅
   - Reasoning: Second core business line
   - Implementation: Navigate to `/operations/deals?type=rent`

**Consider Including:**
5. **Schedule Appointment** 🟨
   - Reasoning: High-frequency action but complex (requires calendar integration)
   - Implementation: Link to calendar with pre-filled context

6. **Add Property Listing** 🟨
   - Reasoning: Important but not daily workflow
   - Implementation: Route to property management section

**Avoid (too complex for dashboard):**
- **Create Lead from Prospect**: Requires multi-step selection
- **Bulk Status Updates**: Better suited for pipeline views
- **Generate Reports**: Belongs in dedicated analytics section
- **Manage Documents**: Better in individual operation details

### CRM Comparison Insights:

**HubSpot Pattern**: Activity feed with contextual cards
**Salesforce Lightning**: Widget-based customizable layout  
**Pipedrive**: Pipeline visualization with quick add buttons
**Monday.com**: Status-based grid organization

**Recommendation**: Follow Option 1 (Executive Summary) as it aligns with existing codebase patterns while providing the comprehensive overview needed for daily real estate operations.

The operations dashboard should serve as the daily driver for real estate agents, providing immediate visibility into their workload while maintaining the clean, professional aesthetic established in the current design system.