## FEATURE:

- Calendar Visit Flow: a dedicated page to record a property visit from a calendar appointment.
- When the user clicks "Visita" on an event panel, navigate to `/calendario/visita/[appointment_id]`.
- On that page, capture and confirm the visit details:
  - Listing (property) associated to the visit
  - Agent who performed the visit
  - Contact who attended the visit
  - Date and time of the visit
  - Two signatures: one from the agent and one from the contact/visitor
- Out of scope for v1: PDF generation of the visit document (to be implemented later). v1 focuses on the form + persistence.

How it works (simple reasoning):
1. User clicks "Visita" on a calendar event → we route to `/calendario/visita/[appointment_id]`.
2. The page preloads the appointment data (listing, contact, scheduled date/time) so the user only fills what's missing or edits if needed.
3. The user selects/validates the agent and confirms listing/contact/date/time.
4. Both parties add signatures (drawn via a signature pad).
5. The user saves the visit. We persist the data (and signatures as images).
6. Later, we'll generate a PDF from this record.

## EXAMPLES:

- Example user flow:
  - From the calendar, open an event and click "Visita".
  - Land on `/calendario/visita/12345`.
  - See pre-filled: listing "Piso Calle Mayor 10", contact "María López", date "2025-08-12 17:30".
  - Select agent "Juan Pérez".
  - Both sign on screen.
  - Press "Guardar visita" and see a confirmation toast and redirect back to the calendar or property detail.

- Example states:
  - Missing signature: show validation message "Falta la firma del visitante".
  - Appointment not found: show error and a button "Volver al calendario".

- Example data saved (conceptual):
  - appointmentId, listingId, contactId, agentId, visitedAt (ISO), signatureVisitorUrl, signatureAgentUrl, createdBy, createdAt.

## DOCUMENTATION:

- Internal references (as prior art/entry points):
  - Calendar page and appointments:
    - `src/app/(dashboard)/calendario/page.tsx`
    - `src/components/appointments/appointment-form.tsx`
    - `src/server/actions/appointments.ts`
    - `src/server/queries/appointment.ts`
  - Storage helper (for signatures as images):
    - `src/server/s3.ts`
  - UI components and patterns:
    - `src/components/ui/*` (form, inputs, buttons)
    - Tailwind styles: `src/app/globals.css`, `src/styles/*`

- External docs (implementation helpers):
  - Next.js App Router dynamic routes (`/calendario/visita/[appointment_id]`)
  - React Hook Form + Zod for form validation
  - A canvas signature library (e.g., `signature_pad`) to capture signatures
  - Tailwind CSS for layout/styling
  - Lucide icons for UI affordances

## OTHER CONSIDERATIONS:

- Validation:
  - Ensure `appointment_id` exists and belongs to the current account.
  - Confirm listing/contact/agent are consistent with the appointment.
  - Enforce both signatures before save.

- Data model and storage:
  - Store signatures as images (PNG) in S3 via existing helpers; persist URLs in DB.
  - Normalize timestamps and handle time zones consistently.

- UX:
  - Mobile-first (signatures must be easy on touch devices).
  - Clear success/error toasts; simple back navigation.
  - Spanish copy by default; align with existing i18n tone.

- Security & permissions:
  - Only authenticated users with sufficient role can record a visit.
  - Prevent editing visits after a certain status (e.g., once PDF is generated; future step).

- Future (out of scope for v1):
  - Generate a PDF "Acta de Visita" from the saved record.
  - Optional witness signature fields.
  - Attach the PDF to the property's documents.

- Gotchas:
  - Be careful with time zones (calendar vs. visit record).
  - Handle network interruptions while signing (avoid losing drawings).
  - Keep the form resilient if preloaded data is incomplete.

- Implementation snapshot (v1 minimal):
  - Dynamic route page to load appointment context.
  - Form with controlled inputs (listing, agent, contact, date/time).
  - Two signature canvases (save as images to S3 on submit).
  - Persist visit record; redirect/confirm.

- Tech alignment:
  - Next.js App Router
  - TypeScript + TSX components
  - Tailwind CSS styling
  - Lucide icons
  - SingleStore via existing DB access layer
