"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Clock, AlertCircle, User, MapPin, DollarSign, Calendar } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { OperationCard, OperationType } from "~/types/operations";

interface KanbanCardProps {
  card: OperationCard;
  operationType: OperationType;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  isDragOverlay?: boolean;
}

// Urgency level colors for prospects
const URGENCY_COLORS = {
  1: "bg-green-100 text-green-800 border-green-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-orange-100 text-orange-800 border-orange-200", 
  4: "bg-red-100 text-red-800 border-red-200",
  5: "bg-red-200 text-red-900 border-red-300",
} as const;

export default function KanbanCard({
  card,
  operationType,
  isSelected,
  onSelect,
  isDragOverlay = false
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id.toString(),
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format dates
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  // Render operation-specific content
  const renderOperationContent = () => {
    switch (operationType) {
      case 'prospects':
        return (
          <>
            {/* Contact Name */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {card.contactName ?? 'Unknown Contact'}
              </span>
            </div>

            {/* Need Summary */}
            {card.needSummary && (
              <div className="text-sm text-gray-600 line-clamp-2">
                {card.needSummary}
              </div>
            )}

            {/* Urgency Level */}
            {card.urgencyLevel && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <Badge 
                  variant="secondary"
                  className={URGENCY_COLORS[card.urgencyLevel as keyof typeof URGENCY_COLORS] || URGENCY_COLORS[1]}
                >
                  Prioridad {card.urgencyLevel}
                </Badge>
              </div>
            )}
          </>
        );

      case 'leads':
        return (
          <>
            {/* Contact Name */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {card.contactName ?? 'Unknown Contact'}
              </span>
            </div>

            {/* Listing Address */}
            {card.listingAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 line-clamp-1">
                  {card.listingAddress}
                </span>
              </div>
            )}

            {/* Source */}
            {card.source && (
              <Badge variant="outline" className="w-fit">
                {card.source}
              </Badge>
            )}
          </>
        );

      case 'deals':
        return (
          <>
            {/* Listing Address */}
            {card.listingAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900 line-clamp-1">
                  {card.listingAddress}
                </span>
              </div>
            )}

            {/* Amount */}
            {card.amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(card.amount)}
                </span>
              </div>
            )}

            {/* Close Date */}
            {card.closeDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatDate(card.closeDate)}
                </span>
              </div>
            )}

            {/* Participants */}
            {card.participants && card.participants.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Participantes:</span> {card.participants.join(', ')}
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-50' : 'hover:shadow-md'}
        ${isSelected ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'}
        ${isDragOverlay ? 'shadow-lg' : ''}
        cursor-grab active:cursor-grabbing
      `}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-2 top-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select item for bulk actions"
        />
      </div>

      {/* Listing Type Badge */}
      <div className="absolute right-2 top-2">
        <Badge 
          variant="secondary" 
          className={`text-xs ${
            card.listingType === 'Sale' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {card.listingType}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="mt-6 space-y-3" {...listeners}>
        {renderOperationContent()}

        {/* Last Activity */}
        {card.lastActivity && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(card.lastActivity)}</span>
          </div>
        )}

        {/* Next Task */}
        {card.nextTask && (
          <div className="rounded bg-yellow-50 p-2 text-xs text-yellow-800">
            <strong>Next:</strong> {card.nextTask}
          </div>
        )}
      </div>

      {/* Quick Actions Menu */}
      <div className="absolute bottom-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Add Task</DropdownMenuItem>
            <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}