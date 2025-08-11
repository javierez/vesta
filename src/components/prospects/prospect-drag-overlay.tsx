"use client";

import { DragOverlay } from "@dnd-kit/core";
import { SimpleProspectCard } from "./simple-prospect-card";

// Simple type for prospect with contact data (matching ACTUAL database structure)
type ProspectWithContact = {
  prospects: {
    id: bigint;
    contactId: bigint;
    status: string;
    listingType: string | null;
    propertyType: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    preferredAreas: unknown;
    minBedrooms: number | null;
    minBathrooms: number | null;
    minSquareMeters: number | null;
    maxSquareMeters: number | null;
    moveInBy: Date | null;
    extras: unknown;
    urgencyLevel: number | null;
    fundingReady: boolean | null;
    notesInternal: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  contacts: {
    contactId: bigint;
    accountId: bigint;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    additionalInfo: unknown;
    orgId: bigint | null;
    isActive: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

interface ProspectDragOverlayProps {
  activeProspect: ProspectWithContact | null;
}

export function ProspectDragOverlay({
  activeProspect,
}: ProspectDragOverlayProps) {
  return (
    <DragOverlay>
      {activeProspect ? (
        <div className="rotate-3 opacity-95 shadow-2xl">
          <SimpleProspectCard prospect={activeProspect} />
        </div>
      ) : null}
    </DragOverlay>
  );
}
