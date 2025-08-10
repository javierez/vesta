"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { OperationType, ListingTypeFilter, KanbanColumn, OperationCard } from "~/types/operations";
import { getStatusesForOperationType, isValidStatusTransition } from "~/types/operations";
import KanbanColumnComponent from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { updateOperationStatus } from "~/server/actions/operations";

interface KanbanBoardProps {
  operationType: OperationType;
  listingType: ListingTypeFilter;
  columns: KanbanColumn[];
  selectedItems: Set<string>;
  onItemSelect: (itemId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function KanbanBoard({
  operationType,
  listingType: _listingType,
  columns: initialColumns,
  selectedItems,
  onItemSelect,
  onSelectAll: _onSelectAll
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<OperationCard | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get all card IDs for SortableContext
  const _cardIds = useMemo(() => {
    return columns.flatMap(column => column.items.map(item => item.id.toString()));
  }, [columns]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns
      .flatMap(col => col.items)
      .find(item => item.id.toString() === active.id);
    
    if (card) {
      setActiveCard(card);
    }
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (_event: DragOverEvent) => {
    // TODO: Implement visual feedback for drag over if needed
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    // Find the active card and determine source/destination columns
    let activeCard: OperationCard | null = null;
    let sourceColumnId: string | null = null;
    let destinationColumnId: string | null = null;

    // Find source card and column
    for (const column of columns) {
      const card = column.items.find(item => item.id.toString() === activeId);
      if (card) {
        activeCard = card;
        sourceColumnId = column.id;
        break;
      }
    }

    // Determine destination column
    const destinationColumn = columns.find(col => col.id === overId);
    if (destinationColumn) {
      destinationColumnId = destinationColumn.id;
    } else {
      // Check if dropped on a card (move to that card's column)
      for (const column of columns) {
        if (column.items.some(item => item.id.toString() === overId)) {
          destinationColumnId = column.id;
          break;
        }
      }
    }

    if (!activeCard || !sourceColumnId || !destinationColumnId || sourceColumnId === destinationColumnId) {
      return;
    }

    // Validate status transition
    if (!isValidStatusTransition(operationType, activeCard.status, destinationColumnId)) {
      const typeNames = { prospects: 'prospecto', leads: 'lead', deals: 'negocio' };
      toast.error(`No se puede mover ${typeNames[operationType]} de ${activeCard.status} a ${destinationColumnId}`);
      return;
    }

    // Optimistic update: move card between columns immediately
    const originalColumns = columns;
    const newColumns = moveCardBetweenColumns(
      columns,
      activeCard.id,
      sourceColumnId,
      destinationColumnId
    );
    setColumns(newColumns);

    try {
      // Update status on server
      const result = await updateOperationStatus({
        operationId: activeCard.id.toString(),
        operationType,
        fromStatus: activeCard.status,
        toStatus: destinationColumnId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      const typeNames = { prospects: 'prospecto', leads: 'lead', deals: 'negocio' };
      toast.success(`${typeNames[operationType]} movido a ${destinationColumnId}`);

    } catch (error) {
      // Rollback on error
      setColumns(originalColumns);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar estado');
      console.error('Error updating operation status:', error);
    }
  };

  // Helper function to move card between columns
  const moveCardBetweenColumns = (
    columns: KanbanColumn[],
    cardId: bigint,
    fromColumnId: string,
    toColumnId: string
  ): KanbanColumn[] => {
    const newColumns = [...columns];
    
    // Find source and destination columns
    const sourceColumn = newColumns.find(col => col.id === fromColumnId);
    const destinationColumn = newColumns.find(col => col.id === toColumnId);
    
    if (!sourceColumn || !destinationColumn) return columns;

    // Find and remove card from source column
    const cardIndex = sourceColumn.items.findIndex(item => item.id === cardId);
    if (cardIndex === -1) return columns;

    const [card] = sourceColumn.items.splice(cardIndex, 1);
    if (!card) return columns; // Safety check
    
    // Update card status and add to destination column
    const updatedCard: OperationCard = { 
      ...card, 
      status: toColumnId,
      // Ensure required properties are defined
      id: card.id,
      type: card.type ?? 'prospect',
      listingType: card.listingType ?? 'Sale'
    };
    destinationColumn.items.push(updatedCard);

    // Update item counts
    sourceColumn.itemCount = sourceColumn.items.length;
    destinationColumn.itemCount = destinationColumn.items.length;

    return newColumns;
  };

  // Create columns based on operation type if none provided
  const displayColumns = columns.length > 0 ? columns : getStatusesForOperationType(operationType).map(status => ({
    id: status,
    title: status,
    status,
    items: [],
    itemCount: 0
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {displayColumns.map((column) => (
          <SortableContext 
            key={column.id} 
            items={column.items.map(item => item.id.toString())}
            strategy={rectSortingStrategy}
          >
            <KanbanColumnComponent
              column={column}
              operationType={operationType}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 opacity-95">
            <KanbanCard 
              card={activeCard}
              operationType={operationType}
              isSelected={selectedItems.has(activeCard.id.toString())}
              onSelect={() => { 
                // No selection during drag - intentionally empty
              }}
              isDragOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}