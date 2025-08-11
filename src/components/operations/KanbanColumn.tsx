"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { KanbanColumn, OperationType } from "~/types/operations";
import { getTranslatedStatus } from "~/types/operations";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Calendar, MapPin, User } from "lucide-react";

interface KanbanColumnProps {
  column: KanbanColumn;
  operationType: OperationType;
  selectedItems: Set<string>;
  onItemSelect: (itemId: string, selected: boolean) => void;
}

// Status color mapping
const STATUS_COLORS = {
  // Prospects
  New: "bg-blue-100 text-blue-800 border-blue-200",
  Working: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Qualified: "bg-green-100 text-green-800 border-green-200",
  Archived: "bg-gray-100 text-gray-800 border-gray-200",

  // Leads
  Converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Disqualified: "bg-red-100 text-red-800 border-red-200",

  // Deals
  Offer: "bg-purple-100 text-purple-800 border-purple-200",
  UnderContract: "bg-blue-100 text-blue-800 border-blue-200",
  Closed: "bg-green-100 text-green-800 border-green-200",
  Lost: "bg-red-100 text-red-800 border-red-200",
} as const;

export default function KanbanColumnComponent({
  column,
  operationType,
  selectedItems,
  onItemSelect,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const statusColorClass =
    STATUS_COLORS[column.status as keyof typeof STATUS_COLORS] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div
      ref={setNodeRef}
      className={`flex h-fit min-h-[500px] flex-col rounded-lg border-2 bg-gray-50 p-4 transition-colors duration-200 ${
        isOver ? "border-blue-400 bg-blue-50/50" : "border-gray-200"
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${statusColorClass} font-medium`}
          >
            {getTranslatedStatus(column.title)}
          </Badge>
          <span className="text-sm font-medium text-gray-600">
            {column.itemCount}
          </span>
        </div>

        {/* Add New Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white"
          onClick={() => {
            // TODO: Handle adding new item to this column
            console.log(
              `Add new ${operationType.slice(0, -1)} to ${column.status}`,
            );
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add new {operationType.slice(0, -1)}</span>
        </Button>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3">
        {column.items.length > 0 ? (
          <SortableContext
            items={column.items.map((item) => item.id.toString())}
            strategy={rectSortingStrategy}
          >
            {column.items.map((card) => (
              <Card
                key={card.id.toString()}
                className="cursor-pointer p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedItems.has(card.id.toString())}
                    onCheckedChange={(checked) =>
                      onItemSelect(card.id.toString(), checked as boolean)
                    }
                  />
                  <div className="flex-1 space-y-2">
                    <div className="font-medium text-sm">
                      {card.contactName ?? card.listingAddress ?? "Sin nombre"}
                    </div>
                    {card.needSummary && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {card.needSummary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {card.lastActivity && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(card.lastActivity).toLocaleDateString()}
                        </div>
                      )}
                      {card.source && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {card.source}
                        </div>
                      )}
                      {card.listingAddress && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {card.listingAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </SortableContext>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <div className="mb-2 h-8 w-8 rounded-full bg-gray-100 p-2">
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              No {operationType.slice(0, -1).toLowerCase()}s in{" "}
              {column.title.toLowerCase()}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => {
                // TODO: Handle adding new item to this column
                console.log(
                  `Add new ${operationType.slice(0, -1)} to ${column.status}`,
                );
              }}
            >
              Add {operationType.slice(0, -1).toLowerCase()}
            </Button>
          </div>
        )}
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mt-2 rounded border-2 border-dashed border-blue-400 bg-blue-50 p-2 text-center text-sm text-blue-600">
          Drop here to move to {column.title}
        </div>
      )}
    </div>
  );
}
