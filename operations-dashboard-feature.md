## FEATURE:

Build a comprehensive Operations Dashboard at `/operations` that provides a unified view of all real estate operations (prospects, leads, and deals) for both sales and rentals. The dashboard should display KPI summaries, urgent tasks, today's appointments, and provide quick navigation to detailed pipeline views while maintaining the app's minimalist design aesthetic.

### Key Requirements:
1. **Operations Summary**: Display counts and status breakdowns for prospects, leads, and deals (separated by sale/rent)
2. **Work Queue**: Show urgent tasks (due in next 5 working days) and today/tomorrow appointments
3. **Quick Actions**: Add prospect, add task, view pipelines, mark tasks complete
4. **Visual Design**: Clean, minimal interface using existing gray/white color scheme with status badges
5. **Performance**: Fast loading with optimized queries filtering by accountId

## EXAMPLES:

### Relevant UI Components and Patterns:
- `/src/app/(dashboard)/dashboard/page.tsx` - Existing dashboard layout with card-based KPIs
- `/src/components/dashboard/OperacionesEnCursoCard.tsx` - Operations summary card pattern
- `/src/components/dashboard/AccionesRapidasCard.tsx` - Quick actions implementation
- `/src/app/(dashboard)/calendario/page.tsx` - Calendar/appointment view patterns
- `/src/components/ui/badge.tsx` - Status badge components
- `/src/components/ui/card.tsx` - Card layout components

### Database Query Patterns:
- `/src/server/queries/prospect.ts` - Prospect CRUD operations
- `/src/server/queries/lead.ts` - Lead CRUD operations  
- `/src/server/queries/deal.ts` - Deal CRUD operations
- `/src/server/queries/task.ts` - Task management queries
- `/src/server/queries/appointment.ts` - Appointment queries

## DOCUMENTATION:

### Design References:
- **Salesforce Lightning**: Executive summary with KPI cards and unified task management
- **HubSpot CRM**: Activity-centric timeline with contextual information
- **Monday.com**: Grid-based pipeline visualization with stage breakdowns
- **Pipedrive**: Visual pipeline management with drag-drop (for future kanban views)

### Technical Documentation:
- **Next.js App Router**: https://nextjs.org/docs/app/building-your-application/routing
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Tailwind CSS**: https://tailwindcss.com/docs - for consistent styling
- **Lucide Icons**: https://lucide.dev/icons - for consistent iconography

### Database Schema Reference:
- Operations notes define the status workflows for each operation type
- Prospects, leads, and deals tables already exist with proper relationships
- Tasks and appointments tables support linking to any entity via entityType/entityId

## OTHER CONSIDERATIONS:

### Performance Optimization:
- **Always filter by accountId** in all queries to ensure data isolation
- **Use database indexes** on: status, createdAt, accountId, listingId, contactId
- **Implement pagination** for task lists and operation counts
- **Consider caching** operation counts that don't change frequently

### UI/UX Gotchas:
- **Avoid information overload** - Dashboard should be scannable in 5 seconds
- **Mobile responsiveness** - All cards should stack properly on mobile
- **Loading states** - Show skeletons while data loads to prevent layout shift
- **Empty states** - Design for new users with no operations yet
- **Color accessibility** - Status colors should have sufficient contrast

### Implementation Order:
1. Create base `/operations/page.tsx` with layout structure
2. Build operation summary cards with real-time counts
3. Implement work queue (tasks + appointments)
4. Add quick action buttons with proper routing
5. Add filters and search functionality
6. Optimize queries and add proper error handling

### Status Workflow Compliance:
- **Enforce status values** from operation notes document
- **Prospects statuses**: New → Working → Qualified → Archived
- **Lead statuses**: New → Working → Converted/Disqualified  
- **Deal statuses**: Offer → UnderContract → Closed/Lost
- Different statuses for Sale vs Rent operations as defined

### Common AI Assistant Mistakes:
- **Don't create new database tables** - Use existing schema
- **Don't over-engineer** - Start simple, iterate based on feedback
- **Don't forget accountId filtering** - Critical for multi-tenant security
- **Don't hardcode status values** - Use enums or constants
- **Don't create documentation files** unless explicitly requested
- **Use existing UI components** - Don't reinvent the wheel