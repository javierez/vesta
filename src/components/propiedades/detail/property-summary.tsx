"use client";

import React, { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  User,
  Users,
  CheckSquare,
  Key,
  Globe,
  Building2,
  Star,
  TrendingUp,
  CheckCircle2,
  Edit3,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Zap,
  FileText,
} from "lucide-react";

// Add date formatting function
const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface PropertySummaryProps {
  agent?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  owners?: Array<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
  }>;
  status: "prospeccion" | "lead" | "deal";
  hasKeys: boolean;
  isPublished: boolean;
  publishedPlatforms?: Array<{
    name: string;
    isActive: boolean;
    lastSync?: Date;
  }>;
}

// Mock tasks data with priorities and types
const mockTasks = [
  {
    id: 1,
    title: "Contactar propietario",
    completed: true,
    priority: "high",
    type: "contact",
    dueDate: new Date(2024, 2, 15),
  },
  {
    id: 2,
    title: "Programar visita",
    completed: false,
    priority: "medium",
    type: "visit",
    dueDate: new Date(2024, 2, 20),
  },
  {
    id: 3,
    title: "Actualizar fotos",
    completed: false,
    priority: "low",
    type: "media",
    dueDate: new Date(2024, 2, 25),
  },
  {
    id: 4,
    title: "Revisar documentación",
    completed: false,
    priority: "high",
    type: "document",
    dueDate: new Date(2024, 2, 22),
  },
];

export function PropertySummary({
  agent,
  owners = [],
  status,
  hasKeys,
  isPublished: _isPublished,
  publishedPlatforms = [],
}: PropertySummaryProps) {
  const [keysToggle, setKeysToggle] = useState(hasKeys);

  const getStatusConfig = (statusType: string, currentStatus: string) => {
    const isActive = statusType === currentStatus;
    const isPassed =
      (statusType === "prospeccion" &&
        (currentStatus === "lead" || currentStatus === "deal")) ||
      (statusType === "lead" && currentStatus === "deal");

    // Use same amber color for all active states
    if (isActive) {
      return {
        bgColor: "bg-amber-500",
        textColor: "text-amber-700",
        icon:
          statusType === "prospeccion"
            ? Building2
            : statusType === "lead"
              ? Star
              : TrendingUp,
        label:
          statusType === "prospeccion"
            ? "Prospección"
            : statusType === "lead"
              ? "Lead"
              : "Deal",
      };
    }

    if (isPassed) {
      return {
        bgColor: "bg-sage-500",
        textColor: "text-sage-700",
        icon:
          statusType === "prospeccion"
            ? Building2
            : statusType === "lead"
              ? Star
              : TrendingUp,
        label:
          statusType === "prospeccion"
            ? "Prospección"
            : statusType === "lead"
              ? "Lead"
              : "Deal",
      };
    }

    return {
      bgColor: "bg-stone-400",
      textColor: "text-stone-600",
      icon:
        statusType === "prospeccion"
          ? Building2
          : statusType === "lead"
            ? Star
            : TrendingUp,
      label:
        statusType === "prospeccion"
          ? "Prospección"
          : statusType === "lead"
            ? "Lead"
            : "Deal",
    };
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "from-terracotta-400 to-terracotta-500",
          bgColor: "bg-terracotta-500",
          textColor: "text-terracotta-700",
          label: "Alta",
        };
      case "medium":
        return {
          color: "from-amber-400 to-amber-500",
          bgColor: "bg-amber-500",
          textColor: "text-amber-700",
          label: "Media",
        };
      case "low":
        return {
          color: "from-sage-400 to-sage-500",
          bgColor: "bg-sage-500",
          textColor: "text-sage-700",
          label: "Baja",
        };
      default:
        return {
          color: "from-stone-300 to-stone-400",
          bgColor: "bg-stone-400",
          textColor: "text-stone-600",
          label: "Normal",
        };
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "contact":
        return User;
      case "visit":
        return Building2;
      case "media":
        return Zap;
      case "document":
        return FileText;
      default:
        return CheckCircle2;
    }
  };

  const getProgressWidth = () => {
    switch (status) {
      case "prospeccion":
        return "33.33%";
      case "lead":
        return "66.66%";
      case "deal":
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Progress Section */}
      <Card className="relative overflow-hidden border-0 bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Estado del Inmueble
            </h2>

            {/* Progress Steps */}
            <div className="relative flex items-center justify-between">
              {/* Progress Line Background - aligned with icon centers */}
              <div className="absolute left-5 right-5 top-5 z-0 h-1 rounded-full bg-stone-200" />

              {/* Active Progress Line - aligned with icon centers */}
              <div
                className="absolute left-5 top-5 z-0 h-1 rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `calc(${getProgressWidth()} - 40px)` }}
              />

              {/* Prospección */}
              <div className="relative z-10 flex flex-col items-center">
                {(() => {
                  const config = getStatusConfig("prospeccion", status);
                  const ProspeccionIcon = config.icon;
                  return (
                    <>
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-300",
                          config.bgColor,
                        )}
                      >
                        <ProspeccionIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors",
                            config.textColor,
                          )}
                        >
                          {config.label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Lead */}
              <div className="relative z-10 flex flex-col items-center">
                {(() => {
                  const config = getStatusConfig("lead", status);
                  const LeadIcon = config.icon;
                  return (
                    <>
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-300",
                          config.bgColor,
                        )}
                      >
                        <LeadIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors",
                            config.textColor,
                          )}
                        >
                          {config.label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Deal */}
              <div className="relative z-10 flex flex-col items-center">
                {(() => {
                  const config = getStatusConfig("deal", status);
                  const DealIcon = config.icon;
                  return (
                    <>
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-300",
                          config.bgColor,
                        )}
                      >
                        <DealIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors",
                            config.textColor,
                          )}
                        >
                          {config.label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* People Section */}
        <Card className="transition-all duration-300 hover:shadow-md md:col-span-2">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Agent */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      AGENTE
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
                {agent ? (
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-lg bg-stone-50 p-3 transition-all duration-200 hover:bg-stone-100 active:bg-stone-200"
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="to-terracotta-400 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 text-sm font-bold text-white shadow-sm">
                        {agent?.name ? agent.name.charAt(0) : "?"}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">
                          {agent?.name || "Sin nombre"}
                        </p>
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-3 text-center">
                    <p className="text-sm text-muted-foreground">No asignado</p>
                  </div>
                )}
              </div>

              {/* Owners */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      PROPIETARIOS
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {owners.length > 0 ? (
                    owners.map((owner) => (
                      <Button
                        key={owner.id}
                        variant="ghost"
                        className="h-auto w-full justify-start rounded-lg bg-stone-50 p-3 transition-all duration-200 hover:bg-stone-100 active:bg-stone-200"
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className="to-terracotta-400 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 text-sm font-bold text-white shadow-sm">
                            {owner.name.charAt(0)}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{owner.name}</p>
                          </div>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        No asignados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keys & Publication Card */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Redesigned Keys Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setKeysToggle(!keysToggle)}
                  className={cn(
                    "group relative transition-all duration-300 focus:outline-none",
                    "h-20 w-20 rounded-2xl border-2 shadow-lg",
                    "hover:scale-105 active:scale-95",
                    keysToggle
                      ? "border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/25"
                      : "border-stone-300 bg-gradient-to-br from-stone-200 to-stone-300 shadow-stone-500/25",
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {keysToggle ? (
                      <div className="relative">
                        <Key className="h-8 w-8 text-white drop-shadow-sm" />
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                          <CheckCircle2 className="h-3 w-3 text-amber-500" />
                        </div>
                      </div>
                    ) : (
                      <Key className="h-8 w-8 text-stone-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Publication Portals */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    PORTALES
                  </h3>
                </div>

                <div className="space-y-2">
                  {publishedPlatforms.map((platform) => (
                    <div
                      key={platform.name}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 transition-all duration-200",
                        platform.isActive
                          ? "bg-sage-50 border-sage-200 hover:bg-sage-100"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            platform.isActive ? "bg-sage-500" : "bg-stone-400",
                          )}
                        />
                        <span className="text-sm font-medium">
                          {platform.name}
                        </span>
                      </div>
                      <Badge
                        variant={platform.isActive ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          platform.isActive && "bg-sage-500 hover:bg-sage-600",
                        )}
                      >
                        {platform.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creative Tasks Board */}
        <Card className="transition-all duration-300 hover:shadow-md md:col-span-3">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header with Legend */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    TAREAS
                  </h3>
                </div>
              </div>

              {/* Priority Legend */}
              <div className="flex items-center gap-4 rounded-lg bg-stone-50 p-3">
                <span className="text-xs font-medium text-muted-foreground">
                  PRIORIDAD:
                </span>
                <div className="flex items-center gap-1">
                  <div className="bg-terracotta-500 h-3 w-3 rounded-full" />
                  <span className="text-xs text-muted-foreground">Alta</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Media</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="bg-sage-500 h-3 w-3 rounded-full" />
                  <span className="text-xs text-muted-foreground">Baja</span>
                </div>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {mockTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.type);
                  const isOverdue =
                    !task.completed && task.dueDate < new Date();
                  const priorityConfig = getPriorityConfig(task.priority);

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300",
                        task.completed
                          ? "bg-sage-50 border-sage-200 hover:bg-sage-100"
                          : isOverdue
                            ? "bg-terracotta-50 border-terracotta-200 hover:bg-terracotta-100"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-md",
                      )}
                    >
                      {/* Priority Indicator */}
                      <div
                        className={cn(
                          "absolute right-2 top-2 h-3 w-3 rounded-full",
                          priorityConfig.bgColor,
                        )}
                      />

                      {/* Task Icon */}
                      <div
                        className={cn(
                          "mb-3 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                          task.completed
                            ? "bg-sage-500 text-white"
                            : "bg-stone-100 text-stone-600 group-hover:bg-amber-400 group-hover:text-white",
                        )}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <TaskIcon className="h-4 w-4" />
                        )}
                      </div>

                      {/* Task Content */}
                      <div className="space-y-2">
                        <h4
                          className={cn(
                            "text-sm font-medium leading-tight",
                            task.completed &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={cn(
                              "text-xs",
                              isOverdue && !task.completed
                                ? "text-terracotta-600 font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {formatDate(task.dueDate)}
                          </span>
                          {isOverdue && !task.completed && (
                            <AlertCircle className="text-terracotta-500 h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
