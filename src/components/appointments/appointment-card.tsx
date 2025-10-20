"use client";

import { Clock, MapPin, Car, Users, PenTool, Handshake, Train, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

// Appointment type colors and icons - Golden hour colors
const appointmentTypes = {
  Visita: {
    color: "bg-amber-100 text-amber-800",
    icon: null,
  },
  Reunión: {
    color: "bg-rose-100 text-rose-800",
    icon: <Users className="h-4 w-4" />,
  },
  Firma: {
    color: "bg-orange-100 text-orange-800",
    icon: <PenTool className="h-4 w-4" />,
  },
  Cierre: {
    color: "bg-amber-100 text-amber-800",
    icon: <Handshake className="h-4 w-4" />,
  },
  Viaje: {
    color: "bg-yellow-200 text-yellow-900",
    icon: <Train className="h-4 w-4" />,
  },
};

// Unified appointment data interface
export interface AppointmentData {
  appointmentId: bigint;
  type: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  datetimeStart: Date;
  datetimeEnd: Date;
  tripTimeMinutes?: number;
  notes?: string;
  contactName: string;
  propertyAddress?: string;
  agentName?: string;
  isOptimistic?: boolean;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  isSelected?: boolean;
  onClick?: (appointment: AppointmentData) => void;
  className?: string;
  // Optional navigation behavior - if not provided, will navigate to visit page
  navigateToVisit?: boolean;
}

export function AppointmentCard({
  appointment,
  isSelected = false,
  onClick,
  className = "",
  navigateToVisit = true,
}: AppointmentCardProps) {
  const router = useRouter();
  
  const typeConfig = appointmentTypes[
    appointment.type as keyof typeof appointmentTypes
  ] || {
    color: "bg-gray-100 text-gray-800",
    icon: <CalendarIcon className="h-4 w-4" />,
  };

  // Apply visual indicators for optimistic events
  const isOptimisticEvent = appointment.isOptimistic ?? false;
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
    
    if (onClick) {
      onClick(appointment);
    } else if (navigateToVisit) {
      router.push(`/calendario/visita/${appointment.appointmentId}`);
    }
  };

  return (
    <div
      className={cn(
        "calendar-event relative cursor-pointer rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 ring-offset-1",
        optimisticStyles,
        className,
      )}
      onClick={handleClick}
    >
      {/* Main content */}
      <div className="pr-32"> {/* Add right padding to avoid overlap with badges */}
        {/* Contact name */}
        <div className="font-medium text-gray-900 mb-2">
          {appointment.contactName}
        </div>

        {/* Details */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(appointment.datetimeStart)} • {formatTime(appointment.datetimeStart)} - {formatTime(appointment.datetimeEnd)}
          </span>
          {appointment.propertyAddress && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" />
                {appointment.propertyAddress}
              </span>
            </>
          )}
          {appointment.agentName && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>Agente: {appointment.agentName}</span>
              </span>
            </>
          )}
          {appointment.tripTimeMinutes && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                {formatTripTime(appointment.tripTimeMinutes)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badges - Centered in the middle */}
      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex flex-col gap-3">
        {/* Type badge */}
        <div
          className={cn(
            "flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            typeConfig.color,
          )}
        >
          {typeConfig.icon && typeConfig.icon}
          <span>{appointment.type}</span>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            appointment.status === "Scheduled" && "bg-gray-100 text-gray-700",
            appointment.status === "Completed" && "bg-gray-200 text-gray-800",
            appointment.status === "Cancelled" && "bg-gray-100 text-gray-600",
            appointment.status === "Rescheduled" && "bg-gray-150 text-gray-700",
            appointment.status === "NoShow" && "bg-gray-100 text-gray-500",
          )}
        >
          {appointment.status === "Scheduled" ? "Programado" : 
           appointment.status === "Completed" ? "Completado" :
           appointment.status === "Cancelled" ? "Cancelado" :
           appointment.status === "Rescheduled" ? "Reprogramado" :
           appointment.status === "NoShow" ? "No asistió" :
           appointment.status}
        </span>
      </div>
    </div>
  );
}
