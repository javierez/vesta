"use client";

import {
  Clock,
  MapPin,
  Car,
  Home,
  Users,
  PenTool,
  Handshake,
  Train,
  CalendarIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Calendar Event Display Type from PRP
interface CalendarEvent {
  appointmentId: bigint;
  contactName: string;
  propertyAddress?: string;
  startTime: Date;
  endTime: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  type: string;
  tripTimeMinutes?: number;
  notes?: string;
  // Optimistic update flag
  isOptimistic?: boolean;
}

interface CalendarEventProps {
  event: CalendarEvent;
  style: {
    top: string;
    height: string;
  };
  isSelected?: boolean;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
}

// Appointment type colors and icons from PRP
const appointmentTypes = {
  Visita: {
    color: "bg-blue-500",
    icon: <Home className="h-3 w-3" />,
    textColor: "text-white",
  },
  Reunión: {
    color: "bg-purple-500",
    icon: <Users className="h-3 w-3" />,
    textColor: "text-white",
  },
  Firma: {
    color: "bg-green-500",
    icon: <PenTool className="h-3 w-3" />,
    textColor: "text-white",
  },
  Cierre: {
    color: "bg-yellow-500",
    icon: <Handshake className="h-3 w-3" />,
    textColor: "text-white",
  },
  Viaje: {
    color: "bg-emerald-500",
    icon: <Train className="h-3 w-3" />,
    textColor: "text-white",
  },
};

// Status colors
const statusColors = {
  Scheduled: "opacity-100",
  Completed: "opacity-75 bg-green-600",
  Cancelled: "opacity-50 bg-gray-400",
  Rescheduled: "opacity-75 bg-orange-500",
  NoShow: "opacity-50 bg-red-400",
};

export default function CalendarEvent({
  event,
  style,
  isSelected = false,
  onClick,
  className = "",
}: CalendarEventProps) {
  const typeConfig = appointmentTypes[
    event.type as keyof typeof appointmentTypes
  ] || {
    color: "bg-gray-500",
    icon: <CalendarIcon className="h-3 w-3" />,
    textColor: "text-white",
  };

  const statusConfig = statusColors[event.status] || statusColors.Scheduled;
  
  // Apply visual indicators for optimistic events
  const isOptimisticEvent = event.isOptimistic ?? false;
  const optimisticStyles = isOptimisticEvent 
    ? "opacity-75 ring-1 ring-blue-400 ring-opacity-50 animate-pulse" 
    : "";

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTripTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Calculate height in pixels to determine what content to show
  const heightPx = parseInt(style.height.replace("px", "")) || 60;
  const showDetails = heightPx > 50;
  const showExtended = heightPx > 80;
  const showFull = heightPx > 120;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  // Calculate travel time block height (1px per minute on calendar)
  const travelTimeHeight = event.tripTimeMinutes ?? 0;

  // Get the base color for fading travel blocks
  const getBaseColor = () => {
    switch (event.type) {
      case 'Visita': return '59, 130, 246'; // blue-500 RGB
      case 'Reunión': return '147, 51, 234'; // purple-500 RGB
      case 'Firma': return '34, 197, 94'; // green-500 RGB
      case 'Cierre': return '234, 179, 8'; // yellow-500 RGB
      case 'Viaje': return '16, 185, 129'; // emerald-500 RGB
      default: return '107, 114, 128'; // gray-500 RGB
    }
  };
  const baseColorRGB = getBaseColor();

  return (
    <>
      {/* Travel Time Block - positioned above appointment */}
      {travelTimeHeight > 0 && (
        <div
          className="absolute left-0.5 right-0.5 pointer-events-none rounded-t-lg backdrop-blur-sm"
          style={{
            top: `${parseInt(style.top) - travelTimeHeight}px`,
            height: `${travelTimeHeight}px`,
            background: `linear-gradient(to bottom, 
              rgba(${baseColorRGB}, 0.12), 
              rgba(${baseColorRGB}, 0.25)
            )`,
          }}
        >
          {/* Subtle travel indicator */}
          {travelTimeHeight >= 12 && (
            <div className="absolute top-1 right-2">
              <Car className="h-2.5 w-2.5" style={{ color: `rgba(${baseColorRGB}, 0.5)` }} />
            </div>
          )}
        </div>
      )}
      
      {/* Main Appointment Block */}
      <div
        className={cn(
          "calendar-event absolute left-0.5 right-0.5 cursor-pointer overflow-hidden px-2 py-1 transition-all duration-200 hover:ring-2 hover:ring-black hover:ring-offset-1 shadow-sm",
          travelTimeHeight > 0 ? "" : "rounded-lg", // No rounding if travel blocks exist (they handle the rounding)
          typeConfig.color,
          typeConfig.textColor,
          statusConfig,
          isSelected && "ring-2 ring-black ring-offset-1",
          optimisticStyles,
          className,
        )}
        style={style}
        onClick={handleClick}
      >
        {/* Always show: Event type and contact name */}
        <div className="flex items-center gap-1 truncate text-xs font-medium leading-tight">
          {typeConfig.icon}
          <span>
            {event.type} {event.contactName}
          </span>
        </div>

        {/* Show time if height > 50px */}
        {showDetails && (
          <div className="mt-0.5 flex items-center gap-1 truncate text-xs opacity-90">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
        )}

        {/* Show address if height > 80px and address exists */}
        {showExtended && event.propertyAddress && (
          <div className="mt-0.5 flex items-center gap-1 truncate text-xs opacity-90">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{event.propertyAddress}</span>
          </div>
        )}

        {/* Show trip time if height > 80px and trip time exists */}
        {showExtended && event.tripTimeMinutes && (
          <div className="mt-0.5 flex items-center gap-1 truncate text-xs opacity-90">
            <Car className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {formatTripTime(event.tripTimeMinutes)}
            </span>
          </div>
        )}

        {/* Show notes if height > 120px and notes exist */}
        {showFull && event.notes && (
          <div className="mt-1 line-clamp-2 text-xs opacity-75">
            {event.notes}
          </div>
        )}

        {/* Status indicator for non-scheduled appointments */}
        {event.status !== "Scheduled" && (
          <div className="absolute right-1 top-1">
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-white",
                event.status === "Completed" ? "bg-opacity-0" : "bg-opacity-80",
              )}
            />
          </div>
        )}
      </div>
      
      {/* Return Travel Time Block - positioned below appointment */}
      {travelTimeHeight > 0 && (
        <div
          className="absolute left-0.5 right-0.5 pointer-events-none rounded-b-lg backdrop-blur-sm"
          style={{
            top: `${parseInt(style.top) + parseInt(style.height)}px`,
            height: `${travelTimeHeight}px`,
            background: `linear-gradient(to top, 
              rgba(${baseColorRGB}, 0.12), 
              rgba(${baseColorRGB}, 0.25)
            )`,
          }}
        >
          {/* Subtle travel indicator */}
          {travelTimeHeight >= 12 && (
            <div className="absolute bottom-1 right-2">
              <Car className="h-2.5 w-2.5" style={{ color: `rgba(${baseColorRGB}, 0.5)` }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Compact version for mobile or small spaces
// TODO: Work in progress - New compact view design coming soon
export function CompactCalendarEvent({
  event,
  isSelected = false,
  onClick,
  className = "",
}: Omit<CalendarEventProps, "style">) {
  return (
    <div
      className={cn(
        "calendar-event flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6",
        className,
      )}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Vista Compacta en Desarrollo
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Próximamente: Nueva experiencia de visualización
        </p>
      </div>
    </div>
  );
}

// List version for list view
export function ListCalendarEvent({
  event,
  isSelected = false,
  onClick,
  className = "",
}: Omit<CalendarEventProps, "style">) {
  const typeConfig = appointmentTypes[
    event.type as keyof typeof appointmentTypes
  ] || {
    color: "bg-gray-100 text-gray-800",
    icon: <CalendarIcon className="h-4 w-4" />,
    textColor: "text-gray-800",
  };

  // Apply visual indicators for optimistic events
  const isOptimisticEvent = event.isOptimistic ?? false;
  const optimisticStyles = isOptimisticEvent 
    ? "opacity-75 ring-1 ring-blue-400 ring-opacity-50 animate-pulse" 
    : "";

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  const formatTripTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  return (
    <div
      className={cn(
        "calendar-event flex cursor-pointer items-center gap-4 rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 ring-offset-1",
        optimisticStyles,
        className,
      )}
      onClick={handleClick}
    >
      {/* Date */}
      <div className="flex-shrink-0 text-center">
        <div className="text-sm font-medium text-muted-foreground">
          {formatDate(event.startTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTime(event.startTime)}
        </div>
      </div>

      {/* Type badge */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            typeConfig.color,
          )}
        >
          {typeConfig.icon}
          <span>{event.type}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900">
          {event.type} {event.contactName}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </span>
          {event.propertyAddress && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {event.propertyAddress}
              </span>
            </>
          )}
          {event.tripTimeMinutes && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                {formatTripTime(event.tripTimeMinutes)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            event.status === "Scheduled" && "bg-blue-100 text-blue-800",
            event.status === "Completed" && "bg-green-100 text-green-800",
            event.status === "Cancelled" && "bg-red-100 text-red-800",
            event.status === "Rescheduled" && "bg-yellow-100 text-yellow-800",
            event.status === "NoShow" && "bg-gray-100 text-gray-800",
          )}
        >
          {event.status}
        </span>
      </div>
    </div>
  );
}
