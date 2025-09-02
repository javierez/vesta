"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Plus,
  Search,
  CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  Filter,
  X,
  TableIcon,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Loader,
  Home,
  Users,
  PenTool,
  Handshake,
  Train,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Image from "next/image"; // Add Image import for optimized images
import { useWeeklyAppointments } from "~/hooks/use-appointments";
import CalendarEvent, {
  ListCalendarEvent,
  CompactCalendarEvent,
} from "~/components/appointments/calendar-event";
import AppointmentModal, {
  useAppointmentModal,
} from "~/components/appointments/appointment-modal";
import { getAgentsForFilterAction } from "~/server/actions/appointments";
import { useGoogleCalendarIntegration } from "~/hooks/use-google-calendar-integration";

// Appointment types configuration
const appointmentTypes = {
  Visita: {
    color: "bg-blue-100 text-blue-800",
    icon: <Home className="h-4 w-4" />,
  },
  Reunión: {
    color: "bg-purple-100 text-purple-800",
    icon: <Users className="h-4 w-4" />,
  },
  Firma: {
    color: "bg-green-100 text-green-800",
    icon: <PenTool className="h-4 w-4" />,
  },
  Cierre: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Handshake className="h-4 w-4" />,
  },
  Viaje: {
    color: "bg-emerald-100 text-emerald-800",
    icon: <Train className="h-4 w-4" />,
  },
};

// Helper to get date string in YYYY-MM-DD
const getDateString = (date: Date) => date.toISOString().split("T")[0];

// Helper to parse time string to hours and minutes
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
  return { hours, minutes };
};

// Helper to calculate event position and height
const calculateEventStyle = (startTime: string, endTime: string) => {
  const start = parseTime(startTime);
  const end = parseTime(endTime || startTime);

  // Calculate position from top (each hour is 60px height)
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  // Calendar starts at 6:00 AM (360 minutes), so subtract that from position
  const calendarStartMinutes = 6 * 60; // 6:00 AM = 360 minutes
  const topPosition = ((startMinutes - calendarStartMinutes) / 60) * 60;

  // Height based on duration
  const durationMinutes = endMinutes - startMinutes;
  const height = (durationMinutes / 60) * 60;

  // Only show events that start at 6:00 AM or later
  if (startMinutes < calendarStartMinutes) {
    return {
      top: "0px",
      height: "0px",
      display: "none",
    };
  }

  return {
    top: `${Math.max(0, topPosition)}px`,
    height: `${height}px`,
  };
};

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agents, setAgents] = useState<
    Array<{ id: string; name: string; firstName: string; lastName: string }>
  >([]);
  const [view, setView] = useState<"list" | "calendar" | "weekly">("weekly");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  const [selectedEvent, setSelectedEvent] = useState<bigint | null>(null);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    bigint | null
  >(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use real appointments data
  const {
    appointments: realAppointments,
    loading,
    error,
    refetch,
  } = useWeeklyAppointments(weekStart);

  // Use appointment modal
  const {
    isOpen: isModalOpen,
    openModal,
    closeModal,
    initialData,
  } = useAppointmentModal();

  // Use Google Calendar integration
  const { integration, connect, disconnect, syncNow } =
    useGoogleCalendarIntegration();

  // Fetch agents for filter on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const result = await getAgentsForFilterAction();
        if (result.success) {
          setAgents(result.agents);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    void fetchAgents();
  }, []);

  // Filter appointments
  const filteredAppointments = realAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.contactName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (appointment.propertyAddress
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);
    const matchesType = typeFilter === "all" || appointment.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    const matchesAgent =
      selectedAgents.length === 0 ||
      (appointment.agentName &&
        selectedAgents.some(
          (agentId) =>
            agents.find((agent) => agent.id === agentId)?.name ===
            appointment.agentName,
        ));
    return matchesSearch && matchesType && matchesStatus && matchesAgent;
  });

  // Scroll to 10:00 AM on mount for weekly view
  useEffect(() => {
    if (view === "weekly" && scrollAreaRef.current) {
      // Calendar starts at 6:00 AM, so 10:00 AM is 4 hours down
      const scrollPosition = 4 * 60; // 4 hours from 6:00 AM = 240px (4 hours * 60px per hour)
      scrollAreaRef.current.scrollTop = scrollPosition;
    }
  }, [view, weekStart]);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
    }).format(date);
  };

  const formatWeekday = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    })
      .format(date)
      .toUpperCase();
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(
      newWeekStart.getDate() + (direction === "next" ? 7 : -7),
    );
    setWeekStart(newWeekStart);
  };

  // Handle modal for appointment creation
  const handleCreateAppointment = () => {
    setEditMode("create");
    setEditingAppointmentId(null);
    openModal({});
  };

  // Handle opening modal for editing
  const openModalWithEdit = ({
    appointmentId,
    initialData,
  }: {
    appointmentId: bigint;
    initialData: Partial<Record<string, unknown>>;
  }) => {
    setEditMode("edit");
    setEditingAppointmentId(appointmentId);
    openModal(initialData);
  };

  // Handle click on empty time slot for appointment creation
  const handleTimeSlotClick = (date: Date, hour: number, minute = 0) => {
    const clickedDate = new Date(date);
    const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Default to 1-hour appointment
    const endHour = hour + 1;
    const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    const dateString = getDateString(clickedDate);
    if (!dateString) return;

    // Set create mode and navigate with URL parameters to trigger modal
    setEditMode("create");
    setEditingAppointmentId(null);

    const params = new URLSearchParams();
    params.set("new", "true");
    params.set("date", dateString);
    params.set("time", startTime);
    params.set("endTime", endTime);

    router.push(`/calendario?${params.toString()}`, { scroll: false });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Calendario</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateAppointment}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Crear Evento</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar citas..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {/* Agent Filter - Multi-select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between sm:w-[180px]"
              >
                {selectedAgents.length === 0
                  ? "Todos los agentes"
                  : selectedAgents.length === 1
                    ? (() => {
                        const agent = agents.find(
                          (agent) => agent.id === selectedAgents[0],
                        );
                        return (
                          agent?.name ??
                          `${agent?.firstName} ${agent?.lastName}`
                        );
                      })()
                    : `${selectedAgents.length} agentes`}
                <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Agentes</h4>
                    {selectedAgents.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAgents([])}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {agents.map((agent) => {
                      const isSelected = selectedAgents.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAgents((prev) =>
                                prev.filter((id) => id !== agent.id),
                              );
                            } else {
                              setSelectedAgents((prev) => [...prev, agent.id]);
                            }
                          }}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-input"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm">
                            {agent.name ??
                              `${agent.firstName} ${agent.lastName}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setView(
                view === "list"
                  ? "calendar"
                  : view === "calendar"
                    ? "weekly"
                    : "list",
              )
            }
            title={
              view === "list"
                ? "Ver como calendario"
                : view === "calendar"
                  ? "Ver como semanal"
                  : "Ver como lista"
            }
          >
            {view === "list" ? (
              <CalendarIcon className="h-4 w-4" />
            ) : view === "calendar" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <TableIcon className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Integraciones">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {!integration.connected ? (
                <DropdownMenuItem
                  onClick={connect}
                  disabled={integration.loading}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Image
                      src="https://vesta-configuration-files.s3.us-east-1.amazonaws.com/logos/Google_Calendar_icon_(2020).svg.png"
                      alt="Google Calendar"
                      width={16}
                      height={16}
                      className="mr-2 h-4 w-4"
                    />
                    <span>Google Calendar</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    {integration.loading ? (
                      <Loader className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-1 h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {integration.loading ? "Conectando..." : "Conectar"}
                    </span>
                  </div>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open("https://calendar.google.com", "_blank")
                    }
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Image
                        src="https://vesta-configuration-files.s3.us-east-1.amazonaws.com/logos/Google_Calendar_icon_(2020).svg.png"
                        alt="Google Calendar"
                        width={24}
                        height={24}
                        className="mr-3 h-6 w-6"
                      />
                      {integration.lastSync && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          <span>
                            {integration.lastSync.toLocaleDateString()}{" "}
                            {integration.lastSync.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <RefreshCw
                        className={cn(
                          "h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-blue-600",
                          integration.loading && "animate-spin",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          void syncNow()
                            .then((result) => {
                              if (result.success) void refetch();
                            })
                            .catch(console.error);
                        }}
                      />
                      <XCircle
                        className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          void disconnect()
                            .then((result) => {
                              if (result.success) void refetch();
                            })
                            .catch(console.error);
                        }}
                      />
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              {integration.error && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled
                    className="flex items-center text-red-600"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span className="text-xs">{integration.error}</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src="https://vesta-configuration-files.s3.us-east-1.amazonaws.com/logos/outlook-calendar.png"
                    alt="Outlook Calendar"
                    width={24}
                    height={24}
                    className="mr-3 h-6 w-6"
                  />
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Próximamente</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-muted-foreground opacity-50" />
                  <RefreshCw className="h-4 w-4 text-muted-foreground opacity-50" />
                  <XCircle className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {(typeFilter !== "all" ||
                  statusFilter !== "all" ||
                  selectedAgents.length > 0) && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-sm px-1 font-normal"
                  >
                    {[typeFilter, statusFilter].filter((f) => f !== "all")
                      .length + (selectedAgents.length > 0 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 sm:w-80" align="end">
              <div className="flex flex-col">
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  <div className="space-y-6 p-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Tipo
                      </h5>
                      <div className="space-y-1">
                        {Object.keys(appointmentTypes).map((type) => (
                          <div
                            key={type}
                            className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                            onClick={() => {
                              setTypeFilter(typeFilter === type ? "all" : type);
                            }}
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border ${typeFilter === type ? "border-primary bg-primary" : "border-input"}`}
                            >
                              {typeFilter === type && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Estado
                      </h5>
                      <div className="space-y-1">
                        {["Programado", "Completado", "Cancelado"].map(
                          (status) => (
                            <div
                              key={status}
                              className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                              onClick={() => {
                                setStatusFilter(
                                  statusFilter === status ? "all" : status,
                                );
                              }}
                            >
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border ${statusFilter === status ? "border-primary bg-primary" : "border-input"}`}
                              >
                                {statusFilter === status && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="text-sm">{status}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                {(typeFilter !== "all" ||
                  statusFilter !== "all" ||
                  selectedAgents.length > 0) && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTypeFilter("all");
                        setStatusFilter("all");
                        setSelectedAgents([]);
                      }}
                      className="h-7 w-full text-xs"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Borrar filtros
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {view === "list" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando citas...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron citas
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <ListCalendarEvent
                key={appointment.appointmentId.toString()}
                event={appointment}
                isSelected={selectedEvent === appointment.appointmentId}
                onClick={() => setSelectedEvent(appointment.appointmentId)}
              />
            ))
          )}
        </div>
      )}

      {view === "calendar" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando citas...</span>
            </div>
          ) : error ? (
            <div className="col-span-full py-8 text-center text-red-600">
              {error}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No se encontraron citas
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <CompactCalendarEvent
                key={appointment.appointmentId.toString()}
                event={appointment}
                isSelected={selectedEvent === appointment.appointmentId}
                onClick={() => setSelectedEvent(appointment.appointmentId)}
              />
            ))
          )}
        </div>
      )}

      {view === "weekly" && (
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="mb-4 mt-4 flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-base font-semibold sm:text-lg">
                  {formatMonthYear(weekStart)}
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={() => setWeekStart(new Date())}
                className="w-full sm:ml-4 sm:w-auto"
              >
                Hoy
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto p-0">
            <div className="min-w-[640px]">
              {/* Day headers */}
              <div className="sticky top-0 z-10 grid grid-cols-8 border-b bg-white">
                {/* Time column header */}
                <div className="flex h-14 min-w-[60px] items-center justify-center border-r text-xs text-muted-foreground sm:text-sm">
                  GMT+02
                </div>

                {/* Day columns headers */}
                {getWeekDays().map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={cn(
                      "relative flex h-14 min-w-[80px] flex-col items-center justify-center sm:min-w-[100px]",
                      isToday(day) && "bg-blue-50",
                    )}
                  >
                    <div className="text-xs text-muted-foreground">
                      {formatWeekday(day)}
                    </div>
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium sm:h-10 sm:w-10 sm:text-xl",
                        isToday(day) && "bg-blue-600 text-white",
                      )}
                    >
                      {formatShortDate(day)}
                    </div>
                  </div>
                ))}
              </div>

              <ScrollArea
                className="h-[400px] sm:h-[500px] lg:h-[600px]"
                ref={scrollAreaRef}
              >
                <div className="grid grid-cols-8">
                  {/* Hours column */}
                  <div className="flex flex-col border-r">
                    {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                      <div
                        key={hour}
                        className="flex h-[60px] items-start justify-end border-b pr-1 pt-1 text-xs text-muted-foreground sm:pr-2"
                      >
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {/* Days columns */}
                  {getWeekDays().map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={cn(
                        "relative flex min-w-[80px] flex-col border-r sm:min-w-[100px]",
                        isToday(day) && "bg-blue-50/30",
                      )}
                    >
                      {/* Hour slots */}
                      {Array.from({ length: 18 }, (_, i) => i + 6).map(
                        (hour) => (
                          <div
                            key={hour}
                            className="relative h-[60px] border-b"
                          >
                            {/* First half-hour slot */}
                            <div
                              className="absolute left-0 right-0 top-0 h-1/2 cursor-pointer transition-colors hover:bg-blue-50/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTimeSlotClick(day, hour, 0);
                              }}
                              title={`Crear cita - ${hour.toString().padStart(2, "0")}:00`}
                            />

                            {/* Half-hour divider */}
                            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200"></div>

                            {/* Second half-hour slot */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer transition-colors hover:bg-blue-50/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTimeSlotClick(day, hour, 30);
                              }}
                              title={`Crear cita - ${hour.toString().padStart(2, "0")}:30`}
                            />
                          </div>
                        ),
                      )}

                      {/* Appointments for this day */}
                      {!loading &&
                        !error &&
                        filteredAppointments
                          .filter((app) => {
                            const appDate = new Date(app.startTime)
                              .toISOString()
                              .split("T")[0];
                            const dayDate = getDateString(day);
                            return appDate === dayDate;
                          })
                          .map((app) => {
                            const startTime = new Date(app.startTime)
                              .toTimeString()
                              .slice(0, 5);
                            const endTime = new Date(app.endTime)
                              .toTimeString()
                              .slice(0, 5);
                            const eventStyle = calculateEventStyle(
                              startTime,
                              endTime,
                            );

                            return (
                              <CalendarEvent
                                key={app.appointmentId.toString()}
                                event={app}
                                style={eventStyle}
                                isSelected={selectedEvent === app.appointmentId}
                                onClick={() =>
                                  setSelectedEvent(app.appointmentId)
                                }
                              />
                            );
                          })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Panel (shows when an event is selected) */}
      {selectedEvent !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 sm:max-h-none sm:w-80 sm:rounded-lg">
          {(() => {
            const event = realAppointments.find(
              (a) => a.appointmentId === selectedEvent,
            );
            if (!event) return null;

            const formatDate = (date: Date) => {
              return new Intl.DateTimeFormat("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(date);
            };

            const formatTime = (date: Date) => {
              return new Intl.DateTimeFormat("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(date);
            };

            const typeConfig = appointmentTypes[
              event.type as keyof typeof appointmentTypes
            ] || {
              color: "bg-gray-100 text-gray-800",
              icon: <CalendarIcon className="h-4 w-4" />,
            };

            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    {typeConfig.icon}
                    {event.type} - {event.contactName}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{event.type}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </span>
                  </div>
                  {event.propertyAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.propertyAddress}</span>
                    </div>
                  )}
                  {event.tripTimeMinutes && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Tiempo de viaje: {event.tripTimeMinutes} min</span>
                    </div>
                  )}
                  {event.notes && (
                    <div className="pt-2 text-sm">
                      <h5 className="mb-1 text-sm font-medium">Notas</h5>
                      <p>{event.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Open the appointment modal with the event data for editing
                      openModalWithEdit({
                        appointmentId: event.appointmentId,
                        initialData: {
                          contactId: event.contactId,
                          listingId: event.listingId ?? undefined,
                          listingContactId: event.listingContactId ?? undefined,
                          dealId: event.dealId ?? undefined,
                          prospectId: event.prospectId ?? undefined,
                          startDate: event.startTime
                            .toISOString()
                            .split("T")[0],
                          startTime: event.startTime.toTimeString().slice(0, 5),
                          endDate: event.endTime.toISOString().split("T")[0],
                          endTime: event.endTime.toTimeString().slice(0, 5),
                          tripTimeMinutes: event.tripTimeMinutes,
                          notes: event.notes,
                          appointmentType: event.type as
                            | "Visita"
                            | "Reunión"
                            | "Firma"
                            | "Cierre"
                            | "Viaje",
                        },
                      });
                      setSelectedEvent(null); // Close the detail panel
                    }}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  {!(
                    event.status === "Completed" && event.type === "Visita"
                  ) && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        router.push(
                          `/calendario/visita/${event.appointmentId}`,
                        );
                        setSelectedEvent(null); // Close the detail panel
                      }}
                      className="flex-1"
                    >
                      Visita
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={closeModal}
        initialData={initialData}
        mode={editMode}
        appointmentId={editingAppointmentId ?? undefined}
        onSuccess={() => {
          // Refresh appointments after successful creation/edit
          void refetch();
        }}
      />
    </div>
  );
}
