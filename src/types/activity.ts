/**
 * Types for the Property Activity Tab
 * Tracks visits and interested contacts for each listing
 */

// Visit-related types
export interface VisitWithDetails {
  appointmentId: bigint;
  datetimeStart: Date;
  datetimeEnd: Date;
  status: string | null;
  tripTimeMinutes: number | null;
  notes: string | null;
  type: string | null;
  contactId: bigint | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  agentName: string | null;
  googleEventId: string | null;
  hasSignatures: boolean;
}

export interface VisitsKPIProps {
  completedCount: number;
  scheduledCount: number;
  cancelledCount: number;
  totalCount: number;
}

export interface CompactVisitCardProps {
  appointment: {
    appointmentId: bigint;
    datetimeStart: Date;
    datetimeEnd: Date;
    status: string | null;
    tripTimeMinutes: number | null;
    notes: string | null;
    type: string | null;
  };
  contact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  };
  agent: {
    name: string | null;
  };
  hasSignatures: boolean;
}

// Contact-related types
export interface ContactWithDetails {
  contactId: bigint;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  contactType: string;
  source: string | null;
  status: string | null;
  createdAt: Date;
  visitCount: number;
  hasUpcomingVisit: boolean;
  hasMissedVisit: boolean;
  hasCompletedVisit: boolean;
  hasCancelledVisit: boolean;
  hasOffer: boolean;
  isNew: boolean;
}

export interface ContactsKPIProps {
  newContactsCount: number;
  totalContactsCount: number;
}

export interface CompactContactCardProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    createdAt: Date;
  };
  listingContact: {
    source: string | null;
    status: string | null;
    contactType: "buyer" | "owner" | "viewer";
  };
  hasUpcomingVisit: boolean;
  hasMissedVisit: boolean;
  hasCompletedVisit: boolean;
  hasCancelledVisit: boolean;
  hasOffer: boolean;
  visitCount: number;
  listingId: bigint;
}

// Section component types
export interface ExpandableSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  storageKey?: string;
}

// Main activity tab props
export interface ActivityTabContentProps {
  visits: VisitWithDetails[];
  contacts: ContactWithDetails[];
  listingId: bigint;
}

// Empty state types
export type EmptyStateType = "completed-visits" | "scheduled-visits" | "new-contacts";
