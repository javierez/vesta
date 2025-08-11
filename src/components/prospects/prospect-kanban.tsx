"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ProspectKanbanColumn } from "./prospect-kanban-column";
import { ProspectDragOverlay } from "./prospect-drag-overlay";
import { PROSPECT_STATUSES } from "~/types/operations";

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

interface ProspectKanbanProps {
  prospects: ProspectWithContact[];
  onProspectUpdate: () => void;
}

export function ProspectKanban({
  prospects,
  onProspectUpdate,
}: ProspectKanbanProps) {
  const [activeProspect, setActiveProspect] =
    useState<ProspectWithContact | null>(null);
  const [_isDragging, setIsDragging] = useState(false);

  // Helper function to get display status (same logic as table)
  const getStatusDisplay = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "new":
      case "nuevo":
        return "En búsqueda";
      case "working":
      case "en proceso":
      case "en seguimiento":
        return "En preparación";
      case "qualified":
      case "calificado":
        return "Finalizado";
      case "archived":
      case "archivado":
        return "Archivado";
      // If it's already one of our 4 final statuses, keep it
      case "en búsqueda":
        return "En búsqueda";
      case "en preparación":
        return "En preparación";
      case "finalizado":
        return "Finalizado";
      case "archivado":
        return "Archivado";
      default:
        return "En búsqueda"; // Default fallback
    }
  }, []);

  // Group prospects by status into columns
  const kanbanData = useMemo(() => {
    // Use all 4 prospect statuses
    const allStatuses = PROSPECT_STATUSES;

    const columns = allStatuses.map((status) => {
      // Filter prospects by their displayed status (after mapping)
      const statusProspects = prospects.filter((prospect) => {
        const displayStatus = getStatusDisplay(prospect.prospects.status);
        return displayStatus === status;
      });

      return {
        id: status,
        title: status,
        prospects: statusProspects,
      };
    });

    // Show all 4 columns, but prioritize ones with prospects
    const coreStatuses = ["En búsqueda", "En preparación"];
    return columns.filter(
      (col) => col.prospects.length > 0 || coreStatuses.includes(col.id),
    );
  }, [prospects, getStatusDisplay]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const prospect = prospects.find(
      (p) => p.prospects.id.toString() === active.id,
    );
    if (prospect) {
      setActiveProspect(prospect);
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);
    setIsDragging(false);

    if (!over) return;

    const prospectId = active.id.toString();
    const newDisplayStatus = over.id.toString();
    const prospect = prospects.find(
      (p) => p.prospects.id.toString() === prospectId,
    );

    if (!prospect) return;

    const currentDisplayStatus = getStatusDisplay(prospect.prospects.status);
    if (currentDisplayStatus === newDisplayStatus) return;

    try {
      // Use the existing simple prospect update function
      const { updateProspectWithAuth } = await import(
        "~/server/queries/prospect"
      );
      await updateProspectWithAuth(prospect.prospects.id, {
        status: newDisplayStatus, // Use the display status as the new status
      });

      onProspectUpdate();
    } catch (error) {
      console.error("Error updating prospect status:", error);
      // TODO: Show error toast
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // We can add logic here if we need to handle drag over events
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kanbanData.map((column) => (
          <SortableContext
            key={column.id}
            id={column.id}
            items={column.prospects.map((p) => p.prospects.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <ProspectKanbanColumn
              id={column.id}
              title={column.title}
              prospects={column.prospects}
              isDragOver={false}
            />
          </SortableContext>
        ))}
      </div>

      <ProspectDragOverlay activeProspect={activeProspect} />
    </DndContext>
  );
}
