"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "~/components/ui/badge";
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

interface ProspectKanbanColumnProps {
  id: string;
  title: string;
  prospects: ProspectWithContact[];
  isDragOver: boolean;
}

export function ProspectKanbanColumn({
  id,
  title,
  prospects,
  isDragOver,
}: ProspectKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const dropZoneStyle =
    isOver || isDragOver
      ? "bg-blue-50 border-blue-200"
      : "bg-gray-50 border-gray-200";

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-4 transition-colors ${dropZoneStyle}`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <Badge variant="secondary" className="rounded-full">
          {prospects.length}
        </Badge>
      </div>

      {/* Column Content */}
      <SortableContext
        items={prospects.map((p) => p.prospects.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {prospects.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
              Sin prospectos
            </div>
          ) : (
            prospects.map((prospect) => (
              <SimpleProspectCard
                key={prospect.prospects.id.toString()}
                prospect={prospect}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
