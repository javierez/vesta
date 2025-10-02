/**
 * Lead Status Constants and Workflow
 *
 * Defines the simplified lead status workflow with three stages:
 * Appointment Pending → Offer Pending → Offer Accept. Pending
 */

export const LEAD_STATUSES = [
  "Cita Pendiente", // Appointment Pending
  "Oferta Pendiente", // Offer Pending
  "Oferta Aceptada Pendiente", // Offer Accept. Pending
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Maps appointment statuses to corresponding lead statuses
 * Used when appointment status changes to keep lead status in sync
 */
export const APPOINTMENT_TO_LEAD_STATUS: Record<string, LeadStatus> = {
  Scheduled: "Cita Pendiente", // When appointment is scheduled
  Completed: "Oferta Pendiente", // When visit is completed, ready for offer
  Cancelled: "Cita Pendiente", // When appointment cancelled, back to pending appointment
};

/**
 * Maps visit outcomes to lead status progression
 * Used when visit is recorded to advance lead through workflow
 */
export const VISIT_OUTCOME_TO_LEAD_STATUS = {
  offer_made: "Oferta Pendiente" as LeadStatus, // Offer made during visit
  info_needed: "Cita Pendiente" as LeadStatus, // More info needed, back to appointment pending
};

/**
 * Default lead status for newly created leads from appointments
 */
export const DEFAULT_APPOINTMENT_LEAD_STATUS: LeadStatus = "Cita Pendiente";

/**
 * Lead source constant for appointment-created leads
 */
export const APPOINTMENT_LEAD_SOURCE = "Appointment";
