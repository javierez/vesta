"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  CheckSquare,
  Check,
  Trash2,
  Loader2,
  Home,
  Users,
  PenTool,
  Handshake,
  Train,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type {
  UrgentTask,
  TodayAppointment,
} from "~/server/queries/operaciones-dashboard";
import { type getMostUrgentTasksWithAuth, updateTaskWithAuth, deleteTaskWithAuth } from "~/server/queries/task";
import DaysDropdown from "~/components/ui/DaysDropdown";

type DetailedTask = Awaited<ReturnType<typeof getMostUrgentTasksWithAuth>>[0];

interface WorkQueueCardProps {
  tasks: UrgentTask[];
  appointments: TodayAppointment[];
  detailedTasks?: DetailedTask[];
  loading?: boolean;
  className?: string;
  onDaysChange?: (days: number) => void;
}

export default function WorkQueueCard({
  tasks,
  appointments,
  detailedTasks = [],
  loading = false,
  className = "",
  onDaysChange,
}: WorkQueueCardProps) {
  const [taskStates, setTaskStates] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [selectedDays, setSelectedDays] = useState(7);
  const [optimisticTasks, setOptimisticTasks] = useState<DetailedTask[]>([]);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{ id: number; title: string } | null>(null);

  // Update optimistic tasks when detailed tasks change
  useEffect(() => {
    setOptimisticTasks(detailedTasks);
  }, [detailedTasks]);

  // Use optimistic tasks or detailed tasks
  const tasksToDisplay = optimisticTasks.length > 0 ? optimisticTasks : detailedTasks;

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

  const getAppointmentIcon = (appointmentType: string) => {
    switch (appointmentType) {
      case "Visita":
        return { icon: Home, color: "text-blue-600" };
      case "Reunión":
        return { icon: Users, color: "text-purple-600" };
      case "Firma":
        return { icon: PenTool, color: "text-green-600" };
      case "Cierre":
        return { icon: Handshake, color: "text-yellow-600" };
      case "Viaje":
        return { icon: Train, color: "text-emerald-600" };
      default:
        return { icon: Calendar, color: "text-gray-600" };
    }
  };

  const getAppointmentTypeInSpanish = (appointmentType: string) => {
    // Map English appointment types to Spanish
    const typeMap: Record<string, string> = {
      "viewing": "visita",
      "visit": "visita", 
      "Visita": "visita",
      "meeting": "reunión",
      "reunion": "reunión",
      "Reunión": "reunión",
      "signing": "firma",
      "sign": "firma",
      "Firma": "firma",
      "closing": "cierre",
      "close": "cierre", 
      "Cierre": "cierre",
      "travel": "viaje",
      "trip": "viaje",
      "Viaje": "viaje",
    };
    
    return typeMap[appointmentType] ?? appointmentType?.toLowerCase() ?? "cita";
  };

  const getInitials = (firstName?: string, lastName?: string, name?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      } else if (parts[0]) {
        return parts[0].charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  const getRemainingTime = (dueDate?: Date | null) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const fullDueDateTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59);
    
    const diffMs = fullDueDateTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      const overdueHours = Math.abs(diffHours);
      if (overdueDays > 0) {
        return `${overdueDays} día${overdueDays !== 1 ? 's' : ''} vencido`;
      } else if (overdueHours > 0) {
        return `${overdueHours} hora${overdueHours !== 1 ? 's' : ''} vencido`;
      } else {
        return 'Vencido';
      }
    }
    
    if (taskDate.getTime() === today.getTime()) {
      if (diffHours > 0) {
        return `${diffHours} hora${diffHours !== 1 ? 's' : ''} restantes`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''} restantes`;
      } else {
        return 'Vence ahora';
      }
    } else {
      return `${diffDays} día${diffDays !== 1 ? 's' : ''} restantes`;
    }
  };

  const handleToggleCompleted = async (taskId: number, currentCompleted: boolean) => {
    const taskIdStr = taskId.toString();
    const newCompleted = !currentCompleted;
    
    // Optimistic update - immediately update the UI
    setOptimisticTasks(prev => 
      prev.map(task => 
        task.taskId === taskId 
          ? { ...task, completed: newCompleted }
          : task
      )
    );
    
    setTaskStates(prev => ({ ...prev, [taskIdStr]: 'saving' }));
    
    try {
      // Use the general task update function
      await updateTaskWithAuth(taskId, {
        completed: newCompleted,
      });
      
      setTaskStates(prev => ({ ...prev, [taskIdStr]: 'saved' }));
      
      // Clear the saved state after 2 seconds
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[taskIdStr];
          return newStates;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Revert optimistic update on error
      setOptimisticTasks(prev => 
        prev.map(task => 
          task.taskId === taskId 
            ? { ...task, completed: currentCompleted }
            : task
        )
      );
      
      setTaskStates(prev => ({ ...prev, [taskIdStr]: 'error' }));
      
      // Clear error state after 5 seconds
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[taskIdStr];
          return newStates;
        });
      }, 5000);
    }
  };

  const confirmDeleteTask = (taskId: number, taskTitle: string) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskIdStr = taskId.toString();

    // Store the task for potential reversion
    const taskToDeleteData = optimisticTasks.find(t => t.taskId === taskId);
    if (!taskToDeleteData) return;

    // Close the confirmation dialog
    setTaskToDelete(null);

    // Optimistic update - immediately remove from UI
    setOptimisticTasks(prev => prev.filter(task => task.taskId !== taskId));
    setTaskStates(prev => ({ ...prev, [taskIdStr]: 'saving' }));

    try {
      // Use the general task delete function
      await deleteTaskWithAuth(taskId);
      setTaskStates(prev => ({ ...prev, [taskIdStr]: 'saved' }));

      // Clear the saved state after 1 second
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[taskIdStr];
          return newStates;
        });
      }, 1000);

    } catch (error) {
      console.error('Error deleting task:', error);

      // Revert optimistic update on error - restore the task
      setOptimisticTasks(prev => [...prev, taskToDeleteData].sort((a, b) =>
        new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime()
      ));

      setTaskStates(prev => ({ ...prev, [taskIdStr]: 'error' }));

      // Clear error state after 5 seconds
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[taskIdStr];
          return newStates;
        });
      }, 5000);
    }
  };


  // Legacy handler for old task format
  const handleCompleteTask = async (taskId: bigint) => {
    await handleToggleCompleted(Number(taskId), false); // Assume task is not completed when using this legacy handler
  };

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    if (onDaysChange) {
      onDaysChange(days);
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
              <div className="flex items-center gap-3">
                <DaysDropdown
                  value={selectedDays}
                  onChange={handleDaysChange}
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg shadow-md p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (tasksToDisplay.length > 0 ? tasksToDisplay : tasks).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-2 h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-gray-900">
                  ¡Todo al día!
                </p>
                <p className="text-xs text-gray-500">
                  No hay tareas urgentes
                </p>
              </div>
            ) : tasksToDisplay.length > 0 ? (
              <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {tasksToDisplay.slice(0, 10).map((task) => {
                  const taskIdStr = task.taskId.toString();

                  return (
                    <div
                      key={taskIdStr}
                      className="relative rounded-lg"
                    >
                      {/* Red delete background - only shown when actively swiping this task */}
                      {draggingTask === taskIdStr && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end px-4 rounded-lg">
                          <Trash2 className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* Swipeable task card */}
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragStart={() => {
                          // Only enable swipe-to-delete on mobile
                          if (window.innerWidth < 640) {
                            setDraggingTask(taskIdStr);
                          }
                        }}
                        onDragEnd={(e, info) => {
                          setDraggingTask(null);

                          // Only enable swipe-to-delete on mobile (screen width < 640px which is sm breakpoint)
                          if (window.innerWidth >= 640) return;

                          // If swiped more than 100px to the right, show delete confirmation
                          if (info.offset.x > 100) {
                            confirmDeleteTask(task.taskId, task.title);
                          }
                        }}
                        className={`relative z-10 cursor-pointer p-2 sm:p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
                          task.completed ?? false ? 'bg-gray-50 opacity-75' : 'bg-white'
                        } ${taskStates[taskIdStr] === 'saving' ? 'opacity-70' : ''}`}
                        onClick={() => handleToggleCompleted(task.taskId, task.completed ?? false)}
                      >
                      {/* Avatar badge - top right */}
                      <Avatar className="absolute top-2 right-2 h-4 w-4 sm:h-5 sm:w-5 ring-1 ring-gray-100" title={task.userName ?? (`${task.userFirstName ?? ''} ${task.userLastName ?? ''}`.trim() || 'Usuario')}>
                        <AvatarFallback className="text-[9px] sm:text-xs font-medium">
                          {getInitials(task.userFirstName, task.userLastName ?? undefined, task.userName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Days remaining badge - bottom right on mobile, top right stacked on desktop */}
                      {task.dueDate && (
                        <span className={`absolute bottom-2 right-2 sm:top-8 sm:bottom-auto text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium leading-none border whitespace-nowrap ${
                          getRemainingTime(task.dueDate)?.includes('vencido') || getRemainingTime(task.dueDate) === 'Vencido'
                            ? 'text-rose-600 bg-rose-50 border-rose-200'
                            : 'text-amber-600 bg-amber-50 border-amber-200'
                        }`}>
                          {getRemainingTime(task.dueDate)}
                        </span>
                      )}

                      {/* Mobile: Compact layout, Desktop: Original layout */}
                      <div className="flex flex-col gap-1.5">
                        {/* Header row: Checkbox and Title */}
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          {/* Checkbox */}
                          <div
                            className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
                              task.completed ?? false
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {(task.completed ?? false) && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
                          </div>

                          {/* Title and status icons */}
                          <div className="flex-1 min-w-0 pr-20 sm:pr-24">
                            <div className="flex items-start gap-1.5 justify-between">
                              <h3 className={`font-semibold text-xs sm:text-sm leading-tight flex-1 min-w-0 break-words ${task.completed ?? false ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title.length > 45 ? `${task.title.substring(0, 45)}...` : task.title}
                              </h3>

                              {/* Status icons */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {taskStates[taskIdStr] === 'saving' && (
                                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                                )}
                                {taskStates[taskIdStr] === 'saved' && (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Property and Contact links - more compact on mobile */}
                        {(task.listingId && task.propertyTitle) || (task.contactId && (task.contactFirstName ?? task.contactLastName)) ? (
                          <div className="ml-5 sm:ml-6 flex flex-wrap items-center gap-1.5">
                            {/* Property Link */}
                            {task.listingId && task.propertyTitle && (
                              <Link
                                href={`/propiedades/${task.listingId}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                                  task.completed ?? false
                                    ? 'text-gray-400 bg-gray-50/50 shadow-sm hover:shadow-md hover:bg-gray-100/60'
                                    : 'text-gray-700 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
                                }`}
                              >
                                <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60 flex-shrink-0" />
                                <span className="break-words">{task.propertyTitle}</span>
                              </Link>
                            )}

                            {/* Contact Link */}
                            {task.contactId && (task.contactFirstName ?? task.contactLastName) && (
                              <Link
                                href={`/contactos/${task.contactId}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                                  task.completed ?? false
                                    ? 'text-gray-400 bg-gray-50/50 shadow-sm hover:shadow-md hover:bg-gray-100/60'
                                    : 'text-gray-700 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
                                }`}
                              >
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60 flex-shrink-0" />
                                <span className="break-words">
                                  {`${task.contactFirstName ?? ''} ${task.contactLastName ?? ''}`.trim()}
                                </span>
                              </Link>
                            )}

                            {/* Delete button - hidden on mobile, inline with badges on desktop */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteTask(task.taskId, task.title);
                              }}
                              className="hidden sm:flex h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 rounded ml-auto"
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        ) : (
                          /* Delete button alone when no links - hidden on mobile */
                          <div className="ml-5 sm:ml-6 hidden sm:flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteTask(task.taskId, task.title);
                              }}
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 rounded"
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      </motion.div>
                    </div>
                  );
                })}

                {tasksToDisplay.length > 10 && (
                  <div className="pt-2 text-center">
                    <Button variant="ghost" size="sm">
                      Ver todas las {tasksToDisplay.length} tareas
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {tasks.slice(0, 10).map((task, index) => (
                  <motion.div
                    key={task.taskId.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg bg-white p-3 shadow-md transition-all duration-200 hover:shadow-lg"
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

                {tasks.length > 10 && (
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
                            const { icon: Icon, color } = getAppointmentIcon(appointment.appointmentType);

                            return (
                              <motion.div
                                key={appointment.appointmentId.toString()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:shadow-md hover:ring-gray-200"
                              >
                                {/* Icon and Type Badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                    {getAppointmentTypeInSpanish(appointment.appointmentType)}
                                  </span>
                                  <div className={`rounded-full p-1.5 bg-gray-50 ${color}`}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                </div>

                                {/* Main content */}
                                <div className="pr-16">
                                  {/* Contact name */}
                                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                    {appointment.contactName}
                                  </h3>

                                  {/* Time */}
                                  <div className="flex items-center gap-1 mb-2">
                                    <div className="text-xs font-medium text-gray-600">
                                      {formatTime(appointment.startTime)}
                                    </div>
                                    <div className="w-3 h-px bg-gray-300"></div>
                                    <div className="text-xs text-gray-500">
                                      {formatTime(appointment.endTime)}
                                    </div>
                                  </div>

                                  {/* Address */}
                                  {appointment.propertyAddress && (
                                    <div className="flex items-start gap-1.5">
                                      <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                      <span className="text-xs text-gray-600 leading-relaxed line-clamp-2">
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

      {/* Delete confirmation dialog */}
      <Dialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta tarea?
            </DialogDescription>
          </DialogHeader>

          {taskToDelete && (
            <div className="py-4">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {taskToDelete.title}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setTaskToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (taskToDelete) {
                  void handleDeleteTask(taskToDelete.id);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
