"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  CheckSquare,
  Car,
} from "lucide-react";
import { motion } from "framer-motion";
import type {
  UrgentTask,
  TodayAppointment,
} from "~/server/queries/operaciones-dashboard";

interface WorkQueueCardProps {
  tasks: UrgentTask[];
  appointments: TodayAppointment[];
  className?: string;
}

export default function WorkQueueCard({
  tasks,
  appointments,
  className = "",
}: WorkQueueCardProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const taskDate = new Date(date);

    if (taskDate.toDateString() === today.toDateString()) {
      return "Hoy";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (taskDate.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    }

    return new Intl.DateTimeFormat("es-ES", {
      month: "short",
      day: "numeric",
    }).format(taskDate);
  };

  const getDaysUntilDueColor = (days: number) => {
    if (days <= 1) return "bg-red-100 text-red-800 border-red-200";
    if (days <= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getEntityTypeIcon = (entityType: UrgentTask["entityType"]) => {
    switch (entityType) {
      case "prospect":
        return <User className="h-3 w-3" />;
      case "lead":
        return <User className="h-3 w-3" />;
      case "deal":
        return <CheckCircle2 className="h-3 w-3" />;
      case "listing":
        return <MapPin className="h-3 w-3" />;
      case "appointment":
        return <Calendar className="h-3 w-3" />;
      default:
        return <CheckSquare className="h-3 w-3" />;
    }
  };

  const formatAppointmentDate = (date: Date) => {
    const today = new Date();
    const appointmentDate = new Date(date);

    if (appointmentDate.toDateString() === today.toDateString()) {
      return "Hoy";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    }

    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
      day: "numeric",
    }).format(appointmentDate);
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

  const getAppointmentColor = (appointmentType: string) => {
    switch (appointmentType.toLowerCase()) {
      case "visit":
      case "visita":
      case "viewing":
        return {
          border: "border-l-green-500",
          bg: "bg-gray-50",
          icon: "text-green-600",
        };
      case "sign":
      case "firma":
      case "signing":
        return {
          border: "border-l-gray-500",
          bg: "bg-gray-50",
          icon: "text-gray-600",
        };
      case "valuation":
      case "tasacion":
        return {
          border: "border-l-blue-500",
          bg: "bg-gray-50",
          icon: "text-blue-600",
        };
      default:
        return {
          border: "border-l-purple-500",
          bg: "bg-gray-50",
          icon: "text-purple-600",
        };
    }
  };

  // Manejar acción rápida de completar tarea
  const handleCompleteTask = async (taskId: bigint) => {
    try {
      // Esto se implementaría con una acción del servidor
      console.log(`Complete task ${taskId}`);
      // TODO: Implementar acción del servidor para marcar tarea como completada
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <Card className={className}>
      <CardContent>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {/* Columna de Tareas Urgentes */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Tareas Urgentes</h3>
              <Badge variant="secondary">{tasks.length} tareas</Badge>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-2 h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-gray-900">
                  ¡Todo al día!
                </p>
                <p className="text-xs text-gray-500">
                  No hay tareas urgentes en los próximos 5 días
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.taskId.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {getEntityTypeIcon(task.entityType)}
                          <span className="text-xs font-medium capitalize text-gray-600">
                            {task.entityType ?? "General"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDaysUntilDueColor(task.daysUntilDue)}`}
                          >
                            {task.daysUntilDue === 1
                              ? "Vence Mañana"
                              : `${task.daysUntilDue} días`}
                          </Badge>
                        </div>

                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                          {task.description}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.entityName}</span>
                          <span>•</span>
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteTask(task.taskId)}
                        className="flex-shrink-0"
                      >
                        <CheckSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {tasks.length > 5 && (
                  <div className="pt-2 text-center">
                    <Button variant="ghost" size="sm">
                      Ver todas las {tasks.length} tareas
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna de Citas */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Próximos Eventos</h3>
              <Badge variant="secondary">{appointments.length} eventos</Badge>
            </div>

            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Sin eventos</p>
                <p className="text-xs text-gray-500">
                  No hay eventos programados para hoy o mañana
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  // Group appointments by date
                  const groupedAppointments = appointments.reduce(
                    (groups, appointment) => {
                      const dateLabel = formatAppointmentDate(
                        appointment.startTime,
                      );
                      groups[dateLabel] ??= [];
                      groups[dateLabel].push(appointment);
                      return groups;
                    },
                    {} as Record<string, typeof appointments>,
                  );

                  return Object.entries(groupedAppointments).map(
                    ([dateLabel, dayAppointments]) => (
                      <div key={dateLabel} className="space-y-2">
                        {/* Date Separator */}
                        <div className="flex items-center py-1">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            {dateLabel}
                          </span>
                        </div>

                        {/* Appointments for this date */}
                        <div className="space-y-2">
                          {dayAppointments.map((appointment, index) => {
                            const tripTime = formatTripTime(
                              appointment.tripTimeMinutes,
                            );
                            const colors = getAppointmentColor(
                              appointment.appointmentType,
                            );

                            return (
                              <motion.div
                                key={appointment.appointmentId.toString()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group relative flex items-center rounded-lg border-l-4 ${colors.border} ${colors.bg} py-3 pr-3 transition-all duration-200 hover:bg-white hover:shadow-sm`}
                              >
                                {/* Time - Top Right */}
                                <div className="absolute right-3 top-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatTime(appointment.startTime)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      -
                                    </span>
                                    <span className="text-xs font-medium text-gray-600">
                                      {formatTime(appointment.endTime)}
                                    </span>
                                  </div>
                                </div>

                                {/* Left side: Trip time indicator */}
                                <div className="mr-3 flex flex-col items-center">
                                  {tripTime ? (
                                    <>
                                      <Car
                                        className={`h-4 w-4 ${colors.icon} mb-1`}
                                      />
                                      <span className="text-xs font-medium text-gray-600">
                                        {tripTime}
                                      </span>
                                    </>
                                  ) : null}
                                </div>

                                {/* Main content */}
                                <div className="min-w-0 flex-1 pr-16">
                                  <div className="flex items-baseline justify-between">
                                    <h4 className="truncate text-sm font-semibold text-gray-900">
                                      {appointment.contactName}
                                    </h4>
                                  </div>

                                  {appointment.propertyAddress && (
                                    <div className="mt-1 flex items-center text-xs text-gray-500">
                                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {appointment.propertyAddress}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
