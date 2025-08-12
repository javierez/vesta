## FEATURE:

- Implement a dedicated Leads page at `/operaciones/leads` under the Operations section.
- Unlock the navbar "Leads" item by adding the page and wiring navigation (remove the `disabled` flag once the page exists).
- Initial scope: table view only (no Kanban yet). Keep the view toggle visible for parity but disabled.
- The Leads page represents a relationship between supply and demand: it links the listing OWNER (from `listings.owner_id` which is tied to `contacts`) and the DEMANDANTE (from `contacts`).
- Functionally similar to the existing Prospects page, but without the Potential Connections component and without Kanban (for now).

## EXAMPLES:

### Relevant UI and patterns already in the codebase
- `src/app/(dashboard)/operaciones/prospects/page.tsx`: Overall page structure, header, view toggle, pagination logic, and loading states.
- `src/components/prospects/prospect-table.tsx`: Example of list view rendering, columns, pagination, and update callbacks.
- `src/components/prospects/prospect-filter.tsx`: Pattern for a compact filter bar and a view toggle control. For Leads, reuse the control but disable the toggle.
- `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`: Consistent UI primitives for actions and status badges.

### Leads page MVP (table-only) – suggested structure
- Route: `src/app/(dashboard)/operaciones/leads/page.tsx` (client component, mimic the prospects page structure).
- Data source: `listLeadsWithAuth()` from `src/server/queries/lead.ts` (already account-scoped).
- Table component: create `src/components/leads/lead-table.tsx` modeled after `prospect-table.tsx` with these columns:
  - Contact (Demandante)
  - Listing (Owner/listing reference)
  - Status (use the statuses defined in `public/claude/PRPs/templates/leads.md`)
  - Source (e.g., Appointment, Web form, Manual)
  - Created / Updated
  - Actions (View lead, open related contact/listing)
- Filter/header:
  - Title: "Leads"
  - Subtitle explaining the concept succinctly
  - Keep the view toggle control but render it disabled; default to list view
  - Basic filters (search by contact, listing, status) can follow the `ProspectFilter` pattern
- Omit for MVP: Kanban board and `ConexionesPotenciales`.

## DOCUMENTATION:

### Domain definition
- A Lead links an interested person (Demandante, `contacts.contactId`) with a specific offering (Listing, `listings.listingId`) and tracks the progression from initial interest to negotiation and closing.
- This differs from Prospects (which can represent a generic demand without a specific property) and from Listings (which are supply-side entities).

### Status workflow and synchronization
- Use the lifecycle defined in `public/claude/PRPs/templates/leads.md` (Lead Auto-Creation, Status Synchronization with Appointments/Visits, Visit-to-Lead pipeline).
- Map appointment updates to lead status changes according to that document.

### Code references
- Navigation location (to unlock later): `src/components/layout/dashboard-layout.tsx` → `operacionesItems` contains `{ name: "Leads", href: "/operaciones/leads", disabled: true }`.
- Leads queries (account-scoped): `src/server/queries/lead.ts` (`listLeadsWithAuth`, `getLeadByIdWithAuth`, etc.).
- Prospects reference implementation to mirror structure: `src/app/(dashboard)/operaciones/prospects/page.tsx` and `src/components/prospects/*`.

## OTHER CONSIDERATIONS:
- Performance and pagination: follow the prospects pattern (`ITEMS_PER_PAGE`) and calculate `totalPages` from the leads count. Consider server-side pagination for large datasets.
- Permissions: rely on `getCurrentUserAccountId()`-based scoping in `src/server/queries/lead.ts` to ensure cross-account isolation.
- UX copy/i18n: align with existing Spanish labels used across Operations (e.g., "Leads", "Conexiones", "Operaciones").
- Future work: enable Kanban view for Leads later; keep the toggle UI in place but disabled to set expectations.
- Testing/QA: verify navigation works, empty states and loading skeletons render correctly, and that status badges reflect the workflow from `leads.md`.


