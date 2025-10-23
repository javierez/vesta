"use client";

import { Clock, MapPin, Car, Users, PenTool, Handshake, Train, CalendarIcon, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { getAppointmentTasksAction } from "~/server/actions/appointments";

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

// Task interface for appointment tasks
interface Task {
  taskId: bigint;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
}

// Unified appointment data interface
export interface AppointmentData {
  appointmentId: bigint;
  type: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  datetimeStart: Date;
  datetimeEnd: Date;
  tripTimeMinutes?: number;
  notes?: string;
  contactId?: bigint;
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
  // Optional tasks prop - if provided, will use these instead of fetching
  tasks?: Task[];
}

export function AppointmentCard({
  appointment,
  isSelected = false,
  onClick,
  className = "",
  navigateToVisit = true,
  tasks: propTasks,
}: AppointmentCardProps) {
  const router = useRouter();
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(propTasks ?? []);
  const [tasksLoaded, setTasksLoaded] = useState(!!propTasks);

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

  // Fetch tasks on mount only if not provided via props
  useEffect(() => {
    // If tasks were provided as props, use them and skip fetching
    if (propTasks !== undefined) {
      setTasks(propTasks);
      setTasksLoaded(true);
      return;
    }

    // Otherwise, fetch tasks from server
    const fetchTasks = async () => {
      try {
        console.log('🔍 Fetching tasks for appointment:', appointment.appointmentId.toString());
        const result = await getAppointmentTasksAction(Number(appointment.appointmentId));
        console.log('📋 Appointment tasks result:', {
          appointmentId: appointment.appointmentId.toString(),
          success: result.success,
          taskCount: result.tasks?.length ?? 0,
          tasks: result.tasks,
        });
        if (result.success) {
          setTasks(result.tasks as Task[]);
          setTasksLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching appointment tasks:", error);
      }
    };

    void fetchTasks();
  }, [appointment.appointmentId, propTasks]);

  const handleToggleTasks = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Just toggle visibility since tasks are already loaded
    setShowTasks(!showTasks);
  };

  return (
    <>
      <div
        className={cn(
          "calendar-event relative cursor-pointer rounded-lg border bg-white p-2.5 transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-blue-500 ring-offset-1",
          optimisticStyles,
          className,
        )}
        onClick={handleClick}
      >
      {/* Main content */}
      <div className="pr-28"> {/* Add right padding to avoid overlap with badges */}
        {/* Contact name */}
        <div className="font-medium text-sm mb-1">
          {appointment.contactId ? (
            <Link
              href={`/contactos/${appointment.contactId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-900 hover:text-blue-600 hover:underline transition-colors"
            >
              {appointment.contactName}
            </Link>
          ) : (
            <span className="text-gray-900">{appointment.contactName}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
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
          {/* Tasks Toggle - Only show if tasks exist, right after trip time */}
          {(tasksLoaded && tasks.length > 0) && (
            <>
              <span>•</span>
              <button
                onClick={handleToggleTasks}
                className="flex items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span>Tareas</span>
                {showTasks ? (
                  <ChevronUp className="h-2.5 w-2.5" />
                ) : (
                  <ChevronDown className="h-2.5 w-2.5" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Tasks Display - Inside card, super subtle */}
        {showTasks && tasks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
            {tasks.map((task) => (
              <div
                key={task.taskId.toString()}
                className="flex items-center gap-1.5 text-xs"
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex-shrink-0 w-3 h-3 rounded border flex items-center justify-center",
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-300"
                  )}
                >
                  {task.completed && <Check className="w-2 h-2" />}
                </div>

                {/* Task title only */}
                <span
                  className={cn(
                    "text-xs text-gray-500",
                    task.completed && "line-through"
                  )}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges - Top right */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        {/* Type badge */}
        <div
          className={cn(
            "flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            typeConfig.color,
          )}
        >
          {typeConfig.icon && typeConfig.icon}
          <span>{appointment.type}</span>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            appointment.status === "Scheduled" && "bg-gray-100 text-gray-700",
            appointment.status === "Completed" && "bg-gray-200 text-gray-800",
            appointment.status === "Cancelled" && "bg-rose-100 text-rose-800",
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
    </>
  );
}
