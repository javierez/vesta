## FEATURE:

- **Lead Auto-Creation**: Automatically create/assign leads when appointments are scheduled
- **Status Synchronization**: Sync appointment and lead statuses throughout the visit lifecycle
- **Visit-to-Lead Pipeline**: Convert visits into qualified leads with proper status progression

## IMPLEMENTATION LOGIC:

### 1. Lead Creation (When Appointment is Created)
```typescript
// Check if lead exists for (contactId, listingId)
const existingLead = await findLead(contactId, listingId);

if (!existingLead) {
  // Create new lead with initial status
  const newLead = await createLead({
    contactId,
    listingId,
    prospectId: appointment.prospectId,
    status: "Fase 0: Información Incompleta",
    source: "Appointment"
  });
  appointment.leadId = newLead.leadId;
} else {
  // Use existing lead
  appointment.leadId = existingLead.leadId;
}
```

### 2. Lead Status Workflow
```typescript
const LEAD_STATUSES = [
  "Fase 0: Información Incompleta",    // Missing listing/property/contact/owner info
  "Información Solicitada",            // Info requested from either party
  "Respuesta Pendiente",               // Waiting for response
  "Visita Pendiente",   -- after we schedule the visita from calendar               // Visit scheduled 
  "Visita Realizada",    -- after we use calendar/visit/appoinment_id and click on Registrar Visita              // Visit completed
  "Oferta Presentada",                 // Offer made
  "Oferta Pendiente Aprobación",       // Offer under review
  "Oferta Aceptada",                   // Offer accepted
  "Oferta Rechazada",                  // Offer rejected
  "Cerrado"                            // Deal closed or lost
] as const;
```

### 3. Status Synchronization
```typescript
// When appointment status changes, update lead status
const APPOINTMENT_TO_LEAD_STATUS = {
  "Scheduled": "Visita Pendiente",
  "Completed": "Visita Realizada",
  "Cancelled": "Información Solicitada" // Back to info gathering
} as const;

// When visit is recorded, advance lead status
const VISIT_TO_LEAD_STATUS = {
  "visit_done": "Oferta Presentada",     // If offer made during visit
  "visit_done": "Información Solicitada" // If more info needed
} as const;
```

## WHY THIS APPROACH IS BETTER:

1. **Proactive Lead Creation**: Creates leads immediately when interest is shown (appointment), not when action happens (visit)
2. **Clear Status Progression**: Linear workflow that's easy to track and report on
3. **Status Consistency**: Appointment and lead statuses stay in sync
4. **Audit Trail**: Every status change is tracked with timestamps and reasons

  