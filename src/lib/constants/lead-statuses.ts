/**
 * Lead Status Constants and Workflow
 *
 * Defines the complete lead status workflow from initial appointment
 * through visit completion and deal closure.
 */

export const LEAD_STATUSES = [
  "Info Incompleta", // Missing listing/property/contact/owner info (was: Fase 0: Información Incompleta)
  "Info Solicitada", // Info requested from either party (was: Información Solicitada)
  "Respuesta Pendiente", // Waiting for response
  "Visita Pendiente", // Visit scheduled (after appointment created)
  "Visita Realizada", // Visit completed (after visit recorded)
  "Oferta Presentada", // Offer made during/after visit
  "Oferta Pendiente", // Offer under review (was: Oferta Pendiente Aprobación)
  "Oferta Aceptada", // Offer accepted
  "Oferta Rechazada", // Offer rejected
  "Cerrado", // Deal closed or lost
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Maps appointment statuses to corresponding lead statuses
 * Used when appointment status changes to keep lead status in sync
 */
export const APPOINTMENT_TO_LEAD_STATUS: Record<string, LeadStatus> = {
  Scheduled: "Visita Pendiente", // When appointment is scheduled
  Completed: "Visita Realizada", // When visit is completed
  Cancelled: "Info Solicitada", // When appointment cancelled, back to info gathering
};

/**
 * Maps visit outcomes to lead status progression
 * Used when visit is recorded to advance lead through workflow
 */
export const VISIT_OUTCOME_TO_LEAD_STATUS = {
  offer_made: "Oferta Presentada" as LeadStatus, // Offer made during visit
  info_needed: "Info Solicitada" as LeadStatus, // More info needed, back to gathering
};

/**
 * Default lead status for newly created leads from appointments
 */
export const DEFAULT_APPOINTMENT_LEAD_STATUS: LeadStatus = "Info Incompleta";

/**
 * Lead source constant for appointment-created leads
 */
export const APPOINTMENT_LEAD_SOURCE = "Appointment";
