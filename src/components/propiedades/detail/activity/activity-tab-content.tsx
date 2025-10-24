"use client";

import { useState, useEffect } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { AppointmentCard, type AppointmentData } from "~/components/appointments/appointment-card";
import { CompactContactCard } from "./compact-contact-card";
import { EmptyState } from "./empty-states";
import type { ActivityTabContentProps, ContactSheetData, OwnerContact } from "~/types/activity";
import { getListingOwnerContact } from "~/server/queries/activity";
import { Button } from "~/components/ui/button";
import { Filter, Check, ChevronDown, X, Clock, MapPin, CalendarIcon, Home, Users, PenTool, Handshake, Train, Mail, Phone, CalendarPlus, MessageCircle, CircleDot, CheckCircle, Ban, RotateCw, UserX, Trash2, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { canEditCalendar, canDeleteCalendar } from "~/app/actions/permissions/check-permissions";
import { toast } from "sonner";
import { updateAppointmentStatusAction, deleteAppointmentAction } from "~/server/actions/appointments";
import { useRouter } from "next/navigation";
import AppointmentModal, { useAppointmentModal } from "~/components/appointments/appointment-modal";
import { cn } from "~/lib/utils";

type ActiveView = "visits" | "contacts" | null;
type VisitStatus = "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow";

// Mini component to display offer comparison
interface OfferComparisonCardProps {
  offer: number;
  listingPrice: string;
}

function OfferComparisonCard({ offer, listingPrice }: OfferComparisonCardProps) {
  const listingPriceNum = parseFloat(listingPrice);
  const difference = offer - listingPriceNum;
  const percentageDiff = ((difference / listingPriceNum) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDifferenceColor = () => {
    if (difference < 0) return "text-green-600";
    if (difference > 0) return "text-red-600";
    return "text-gray-600";
  };

  const getDifferenceSign = () => {
    if (difference > 0) return "+";
    return "";
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Comparación de Oferta</h4>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Oferta</p>
          <p className="font-semibold text-gray-900">{formatCurrency(offer)}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Precio de Venta</p>
          <p className="font-semibold text-gray-900">{formatCurrency(listingPriceNum)}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">Diferencia</p>
        <p className={`font-semibold ${getDifferenceColor()}`}>
          {getDifferenceSign()}{formatCurrency(Math.abs(difference))} ({getDifferenceSign()}{Math.abs(percentageDiff).toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}

// Appointment types configuration for detail panel
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

const STATUS_LABELS: Record<VisitStatus, string> = {
  Completed: "Completado",
  Scheduled: "Programado",
  Cancelled: "Cancelado",
  Rescheduled: "Reprogramado",
  NoShow: "No asistió",
};

const TYPE_LABELS: Record<string, string> = {
  Visita: "Visita",
  Reunión: "Reunión",
  Firma: "Firma",
  Cierre: "Cierre",
  Viaje: "Viaje",
};

const CONTACT_FLAG_LABELS: Record<string, string> = {
  hasUpcomingVisit: "Visita Pendiente",
  hasMissedVisit: "Visita Perdida",
  hasCancelledVisit: "Visita Cancelada",
  hasCompletedVisit: "Visita Completada",
  hasOffer: "Oferta Realizada",
  noVisits: "Sin Visitas",
};

export function ActivityTabContent({
  visits,
  contacts,
  listingId,
  listingPrice,
}: ActivityTabContentProps) {
  const router = useRouter();

  const [activeView, setActiveView] = useState<ActiveView>("visits");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSheetData | null>(null);
  const [ownerContact, setOwnerContact] = useState<OwnerContact | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<VisitStatus>>(
    new Set(["Completed", "Scheduled", "Cancelled", "Rescheduled", "NoShow"])
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["Visita", "Reunión", "Firma", "Cierre", "Viaje"])
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    status: true,
    type: true,
    contactStatus: true,
  });

  // Permission states
  const [hasEditCalendarPermission, setHasEditCalendarPermission] = useState<boolean>(false);
  const [hasDeleteCalendarPermission, setHasDeleteCalendarPermission] = useState<boolean>(false);

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete state
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);

  // Appointment modal state
  const {
    isOpen: isModalOpen,
    openModal,
    closeModal,
    initialData: modalInitialData,
  } = useAppointmentModal();
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [editingAppointmentId, setEditingAppointmentId] = useState<bigint | null>(null);

  // Contact filters - using badge flags instead of status
  const [selectedContactFlags, setSelectedContactFlags] = useState<Set<string>>(
    new Set(["hasUpcomingVisit", "hasMissedVisit", "hasCancelledVisit", "hasCompletedVisit", "hasOffer", "noVisits"])
  );

  // Fetch user permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      console.log("🔐 [Activity] Fetching calendar permissions...");
      try {
        const [editCalendarPerm, deleteCalendarPerm] = await Promise.all([
          canEditCalendar(),
          canDeleteCalendar(),
        ]);
        console.log("🔐 [Activity] Permissions fetched:", {
          editCalendar: editCalendarPerm,
          deleteCalendar: deleteCalendarPerm,
        });
        setHasEditCalendarPermission(editCalendarPerm);
        setHasDeleteCalendarPermission(deleteCalendarPerm);
      } catch (error) {
        console.error("❌ [Activity] Error fetching calendar permissions:", error);
        setHasEditCalendarPermission(false);
        setHasDeleteCalendarPermission(false);
      }
    };

    void fetchPermissions();
  }, []); // Run once on mount

  // Fetch owner contact when component mounts
  useEffect(() => {
    const fetchOwnerContact = async () => {
      try {
        const owner = await getListingOwnerContact(listingId);
        setOwnerContact(owner);
      } catch (error) {
        console.error("Error fetching owner contact:", error);
        setOwnerContact(null);
      }
    };

    void fetchOwnerContact();
  }, [listingId]);

  // Filter visits based on selected statuses and types
  const filteredVisits = visits.filter((v) =>
    selectedStatuses.has(v.status as VisitStatus) && selectedTypes.has(v.type ?? "")
  );

  // Group visits by category
  const urgentVisits = filteredVisits.filter(
    (v) => v.status === "NoShow" || v.status === "Rescheduled"
  ).sort((a, b) => {
    // Most recent first for urgent items
    return new Date(b.datetimeStart).getTime() - new Date(a.datetimeStart).getTime();
  });

  const activeVisits = filteredVisits.filter(
    (v) => v.status === "Scheduled"
  ).sort((a, b) => {
    // Soonest first for upcoming visits
    return new Date(a.datetimeStart).getTime() - new Date(b.datetimeStart).getTime();
  });

  const completedVisits = filteredVisits.filter(
    (v) => v.status === "Completed"
  ).sort((a, b) => {
    // Most recent first for completed
    return new Date(b.datetimeStart).getTime() - new Date(a.datetimeStart).getTime();
  });

  const cancelledVisits = filteredVisits.filter(
    (v) => v.status === "Cancelled"
  ).sort((a, b) => {
    // Most recent first for cancelled
    return new Date(b.datetimeStart).getTime() - new Date(a.datetimeStart).getTime();
  });

  // KPI counts (unfiltered - show total counts)
  const allCompletedVisits = visits.filter((v) => v.status === "Completed");
  const allScheduledVisits = visits.filter((v) => v.status === "Scheduled");
  const allCancelledVisits = visits.filter((v) => v.status === "Cancelled");

  // Filter contacts by badge flags
  const filteredContacts = contacts.filter((c) => {
    // Determine which flag applies to this contact (using same logic as badge)
    let contactFlag: string;

    if (c.hasUpcomingVisit) {
      contactFlag = "hasUpcomingVisit";
    } else if (c.hasOffer) {
      contactFlag = "hasOffer";
    } else if (c.hasMissedVisit && !c.hasCancelledVisit) {
      contactFlag = "hasMissedVisit";
    } else if (c.hasCancelledVisit) {
      contactFlag = "hasCancelledVisit";
    } else if (c.hasCompletedVisit) {
      contactFlag = "hasCompletedVisit";
    } else {
      // No visits at all
      contactFlag = "noVisits";
    }

    return selectedContactFlags.has(contactFlag);
  });

  // Sorting logic for contacts - Sales funnel priority
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // 1. HIGHEST: Has offer (potential deal in progress - closest to closing)
    if (a.hasOffer !== b.hasOffer) return a.hasOffer ? -1 : 1;

    // 2. URGENT: Has upcoming visit (scheduled, needs preparation)
    if (a.hasUpcomingVisit !== b.hasUpcomingVisit) return a.hasUpcomingVisit ? -1 : 1;

    // 3. ATTENTION: Has missed visit (needs immediate follow-up)
    if (a.hasMissedVisit !== b.hasMissedVisit) return a.hasMissedVisit ? -1 : 1;

    // 4. ATTENTION: Has cancelled visit (needs rescheduling)
    if (a.hasCancelledVisit !== b.hasCancelledVisit) return a.hasCancelledVisit ? -1 : 1;

    // 5. ENGAGEMENT: Visit count (more visits = warmer lead)
    if (a.visitCount !== b.visitCount) return b.visitCount - a.visitCount;

    // 6. RECENCY: Most recent first (fresher leads)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // New contacts with same sorting
  const newContacts = sortedContacts.filter((c) => c.isNew);

  const handleVisitsClick = () => {
    setActiveView(activeView === "visits" ? null : "visits");
  };

  const handleContactsClick = () => {
    setActiveView(activeView === "contacts" ? null : "contacts");
  };

  const toggleStatus = (status: VisitStatus) => {
    const newStatuses = new Set(selectedStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    setSelectedStatuses(newStatuses);
  };

  const toggleType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleContactFlag = (flag: string) => {
    const newFlags = new Set(selectedContactFlags);
    if (newFlags.has(flag)) {
      newFlags.delete(flag);
    } else {
      newFlags.add(flag);
    }
    setSelectedContactFlags(newFlags);
  };

  const clearFilters = () => {
    setSelectedStatuses(new Set(["Completed", "Scheduled", "Cancelled", "Rescheduled", "NoShow"]));
    setSelectedTypes(new Set(["Visita", "Reunión", "Firma", "Cierre", "Viaje"]));
  };

  const clearContactFilters = () => {
    setSelectedContactFlags(new Set(["hasUpcomingVisit", "hasMissedVisit", "hasCancelledVisit", "hasCompletedVisit", "hasOffer", "noVisits"]));
  };

  const activeFilterCount =
    (5 - selectedStatuses.size) + (5 - selectedTypes.size); // Count deselected items

  const activeContactFilterCount =
    (6 - selectedContactFlags.size); // Count deselected items

  // Get unique types from visits
  const availableTypes = Array.from(new Set(visits.map((v) => v.type).filter((t): t is string => t !== null)));

  // All available contact flags (static list)
  const availableContactFlags = ["hasUpcomingVisit", "hasMissedVisit", "hasCancelledVisit", "hasCompletedVisit", "hasOffer", "noVisits"];

  // Handle status update
  const handleStatusUpdate = async (
    appointmentId: bigint,
    newStatus: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow",
  ) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateAppointmentStatusAction(appointmentId, newStatus);

      if (result.success) {
        toast.success("Estado actualizado correctamente");
        // Close the sheet and trigger a page refresh to get updated data
        setSelectedAppointment(null);
        window.location.reload();
      } else {
        toast.error(result.error ?? "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId: bigint) => {
    // Confirm deletion
    if (!confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      return;
    }

    setIsDeletingAppointment(true);
    try {
      const result = await deleteAppointmentAction(appointmentId);

      if (result.success) {
        toast.success("Cita eliminada correctamente");
        // Close the detail panel and trigger a page refresh
        setSelectedAppointment(null);
        window.location.reload();
      } else {
        toast.error(result.error ?? "Error al eliminar la cita");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error al eliminar la cita");
    } finally {
      setIsDeletingAppointment(false);
    }
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

  return (
    <div className="space-y-6">
      {/* KPI Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <VisitsKPICard
          completedCount={allCompletedVisits.length}
          scheduledCount={allScheduledVisits.length}
          cancelledCount={allCancelledVisits.length}
          totalCount={visits.length}
          isActive={activeView === "visits"}
          onClick={handleVisitsClick}
          listingId={listingId}
        />
        <ContactsKPICard
          newContactsCount={newContacts.length}
          totalContactsCount={contacts.length}
          isActive={activeView === "contacts"}
          onClick={handleContactsClick}
          listingId={listingId}
        />
      </div>

      {/* Visits Content - shown when visits card is active */}
      {activeView === "visits" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filter Button */}
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-sm px-1 font-normal"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="flex flex-col">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-6 p-4">
                      {/* Status Filter Category */}
                      <div className="space-y-2">
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleCategory("status")}
                        >
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Estado
                          </h5>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories.status ? "rotate-180 transform" : ""}`}
                          />
                        </div>
                        {expandedCategories.status && (
                          <div className="space-y-1">
                            {(Object.entries(STATUS_LABELS) as [VisitStatus, string][]).map(
                              ([status, label]) => (
                                <div
                                  key={status}
                                  className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                                  onClick={() => toggleStatus(status)}
                                >
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded border ${selectedStatuses.has(status) ? "border-primary bg-primary" : "border-input"}`}
                                  >
                                    {selectedStatuses.has(status) && (
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                  </div>
                                  <span className="text-sm">{label}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Type Filter Category */}
                      <div className="space-y-2">
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleCategory("type")}
                        >
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Tipo
                          </h5>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories.type ? "rotate-180 transform" : ""}`}
                          />
                        </div>
                        {expandedCategories.type && (
                          <div className="space-y-1">
                            {availableTypes.map((type) => (
                              <div
                                key={type}
                                className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                                onClick={() => toggleType(type)}
                              >
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded border ${selectedTypes.has(type) ? "border-primary bg-primary" : "border-input"}`}
                                >
                                  {selectedTypes.has(type) && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <span className="text-sm">{TYPE_LABELS[type] ?? type}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  {activeFilterCount > 0 && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
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

          <div className="space-y-6">
            {/* No visits at all */}
            {filteredVisits.length === 0 && (
              <EmptyState type="completed-visits" />
            )}

            {/* 🔴 Urgent/Action Required Section */}
            {urgentVisits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-semibold text-rose-700 uppercase tracking-wide">
                    Requieren Atención ({urgentVisits.length})
                  </h3>
                </div>
                <div className="space-y-3 pl-4">
                  {urgentVisits.map((visit) => {
                    const appointmentData: AppointmentData = {
                      appointmentId: visit.appointmentId,
                      type: visit.type ?? "",
                      status: (visit.status ?? "Completed") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                      notes: visit.notes ?? undefined,
                      contactId: visit.contactId ?? undefined,
                      contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                      propertyAddress: undefined,
                      agentName: visit.agentName ?? undefined,
                      isOptimistic: false,
                    };

                    return (
                      <AppointmentCard
                        key={visit.appointmentId.toString()}
                        appointment={appointmentData}
                        onClick={(appointment) => {
                          console.log("🔍 [Activity] Appointment clicked:", appointment.appointmentId.toString());
                          setSelectedAppointment(appointment);
                        }}
                        navigateToVisit={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🟢 Active/Upcoming Visits Section */}
            {activeVisits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                    Próximas Visitas ({activeVisits.length})
                  </h3>
                </div>
                <div className="space-y-3 pl-4">
                  {activeVisits.map((visit) => {
                    const appointmentData: AppointmentData = {
                      appointmentId: visit.appointmentId,
                      type: visit.type ?? "",
                      status: (visit.status ?? "Completed") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                      notes: visit.notes ?? undefined,
                      contactId: visit.contactId ?? undefined,
                      contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                      propertyAddress: undefined,
                      agentName: visit.agentName ?? undefined,
                      isOptimistic: false,
                    };

                    return (
                      <AppointmentCard
                        key={visit.appointmentId.toString()}
                        appointment={appointmentData}
                        onClick={(appointment) => {
                          console.log("🔍 [Activity] Appointment clicked:", appointment.appointmentId.toString());
                          setSelectedAppointment(appointment);
                        }}
                        navigateToVisit={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✓ Completed Visits Section - Collapsible */}
            {completedVisits.length > 0 && (
              <ExpandableSection
                title="Completadas"
                count={completedVisits.length}
                defaultExpanded={false}
                storageKey={`activity-completed-visits-${listingId}`}
              >
                <div className="space-y-3">
                  {completedVisits.map((visit) => {
                    const appointmentData: AppointmentData = {
                      appointmentId: visit.appointmentId,
                      type: visit.type ?? "",
                      status: (visit.status ?? "Completed") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                      notes: visit.notes ?? undefined,
                      contactId: visit.contactId ?? undefined,
                      contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                      propertyAddress: undefined,
                      agentName: visit.agentName ?? undefined,
                      isOptimistic: false,
                    };

                    return (
                      <AppointmentCard
                        key={visit.appointmentId.toString()}
                        appointment={appointmentData}
                        onClick={(appointment) => {
                          console.log("🔍 [Activity] Appointment clicked:", appointment.appointmentId.toString());
                          setSelectedAppointment(appointment);
                        }}
                        navigateToVisit={false}
                      />
                    );
                  })}
                </div>
              </ExpandableSection>
            )}

            {/* ✕ Cancelled Visits Section - Collapsible */}
            {cancelledVisits.length > 0 && (
              <ExpandableSection
                title="Canceladas"
                count={cancelledVisits.length}
                defaultExpanded={false}
                storageKey={`activity-cancelled-visits-${listingId}`}
              >
                <div className="space-y-3">
                  {cancelledVisits.map((visit) => {
                    const appointmentData: AppointmentData = {
                      appointmentId: visit.appointmentId,
                      type: visit.type ?? "",
                      status: (visit.status ?? "Completed") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                      notes: visit.notes ?? undefined,
                      contactId: visit.contactId ?? undefined,
                      contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                      propertyAddress: undefined,
                      agentName: visit.agentName ?? undefined,
                      isOptimistic: false,
                    };

                    return (
                      <AppointmentCard
                        key={visit.appointmentId.toString()}
                        appointment={appointmentData}
                        onClick={(appointment) => {
                          console.log("🔍 [Activity] Appointment clicked:", appointment.appointmentId.toString());
                          setSelectedAppointment(appointment);
                        }}
                        navigateToVisit={false}
                      />
                    );
                  })}
                </div>
              </ExpandableSection>
            )}
          </div>
        </div>
      )}

      {/* Contacts Content - shown when contacts card is active */}
      {activeView === "contacts" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Contact Filter Button */}
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {activeContactFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-sm px-1 font-normal"
                    >
                      {activeContactFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="flex flex-col">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-6 p-4">
                      {/* Contact Badge Filters */}
                      <div className="space-y-2">
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() => toggleCategory("contactStatus")}
                        >
                          <h5 className="text-sm font-medium text-muted-foreground">
                            Estado de Visita
                          </h5>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories.contactStatus ? "rotate-180 transform" : ""}`}
                          />
                        </div>
                        {expandedCategories.contactStatus && (
                          <div className="space-y-1">
                            {availableContactFlags.map((flag) => (
                              <div
                                key={flag}
                                className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                                onClick={() => toggleContactFlag(flag)}
                              >
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded border ${selectedContactFlags.has(flag) ? "border-primary bg-primary" : "border-input"}`}
                                >
                                  {selectedContactFlags.has(flag) && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <span className="text-sm">{CONTACT_FLAG_LABELS[flag]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  {activeContactFilterCount > 0 && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearContactFilters}
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

          <div className="space-y-6">
            {/* No contacts at all */}
            {filteredContacts.length === 0 && (
              <EmptyState type="new-contacts" />
            )}

            {/* New Contacts Section */}
            {newContacts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                    Nuevos Contactos ({newContacts.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {newContacts.map((contact) => (
                  <CompactContactCard
                    key={contact.contactId.toString()}
                    contact={{
                      contactId: contact.contactId,
                      firstName: contact.firstName,
                      lastName: contact.lastName,
                      email: contact.email,
                      phone: contact.phone,
                      createdAt: contact.createdAt,
                    }}
                    listingContact={{
                      source: contact.source,
                      status: contact.status,
                      contactType: contact.contactType as "buyer" | "owner" | "viewer",
                    }}
                    hasUpcomingVisit={contact.hasUpcomingVisit}
                    hasMissedVisit={contact.hasMissedVisit}
                    hasCompletedVisit={contact.hasCompletedVisit}
                    hasCancelledVisit={contact.hasCancelledVisit}
                    hasOffer={contact.hasOffer}
                    offer={contact.offer}
                    visitCount={contact.visitCount}
                    listingId={listingId}
                    onContactClick={setSelectedContact}
                  />
                ))}
                </div>
              </div>
            )}

            {/* All Contacts Section */}
            {sortedContacts.length > newContacts.length && (
              <ExpandableSection
                title="Todos los Contactos"
                count={sortedContacts.length}
                defaultExpanded={false}
                storageKey={`activity-all-contacts-${listingId}`}
              >
                <div className="space-y-3">
                  {sortedContacts.map((contact) => (
                    <CompactContactCard
                      key={contact.contactId.toString()}
                      contact={{
                        contactId: contact.contactId,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        email: contact.email,
                        phone: contact.phone,
                        createdAt: contact.createdAt,
                      }}
                      listingContact={{
                        source: contact.source,
                        status: contact.status,
                        contactType: contact.contactType as "buyer" | "owner" | "viewer",
                      }}
                      hasUpcomingVisit={contact.hasUpcomingVisit}
                      hasMissedVisit={contact.hasMissedVisit}
                      hasCompletedVisit={contact.hasCompletedVisit}
                      hasCancelledVisit={contact.hasCancelledVisit}
                      hasOffer={contact.hasOffer}
                      offer={contact.offer}
                      visitCount={contact.visitCount}
                      listingId={listingId}
                      onContactClick={setSelectedContact}
                    />
                  ))}
              </div>
            </ExpandableSection>
          )}
          </div>
        </div>
      )}

      {/* Contact Detail Sheet */}
      <Sheet
        open={selectedContact !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedContact(null);
        }}
      >
        <SheetContent>
          {selectedContact && (() => {
            const contactName = `${selectedContact.contact.firstName} ${selectedContact.contact.lastName ?? ""}`.trim();

            // Determine badge type and config
            let badgeType: string;
            let badgeConfig: { color: string; icon: React.ReactElement; title: string };

            if (selectedContact.hasUpcomingVisit) {
              badgeType = "upcoming";
              badgeConfig = {
                color: "bg-blue-100 text-blue-800",
                icon: <CalendarIcon className="h-4 w-4" />,
                title: "Visita Pendiente",
              };
            } else if (selectedContact.hasOffer) {
              badgeType = "offer";
              badgeConfig = {
                color: "bg-green-100 text-green-800",
                icon: <Handshake className="h-4 w-4" />,
                title: "Oferta Realizada",
              };
            } else if (selectedContact.hasCancelledVisit) {
              badgeType = "cancelled";
              badgeConfig = {
                color: "bg-orange-100 text-orange-800",
                icon: <X className="h-4 w-4" />,
                title: "Visita Cancelada",
              };
            } else if (selectedContact.hasMissedVisit) {
              badgeType = "missed";
              badgeConfig = {
                color: "bg-red-100 text-red-800",
                icon: <Clock className="h-4 w-4" />,
                title: "Visita Perdida",
              };
            } else if (selectedContact.hasCompletedVisit) {
              badgeType = "completed";
              badgeConfig = {
                color: "bg-gray-100 text-gray-700",
                icon: <Check className="h-4 w-4" />,
                title: "Visita Completada",
              };
            } else {
              badgeType = "none";
              badgeConfig = {
                color: "bg-gray-100 text-gray-700",
                icon: <CalendarPlus className="h-4 w-4" />,
                title: "Sin Visitas",
              };
            }

            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span>{contactName}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                  {/* Badge Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={badgeConfig.color}>
                      <span className="flex items-center gap-1">
                        {badgeConfig.icon}
                        {badgeConfig.title}
                      </span>
                    </Badge>
                  </div>

                  {/* Content based on badge type */}
                  <div className="space-y-4">
                    {badgeType === "upcoming" && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Próxima Visita Programada</h4>
                        <p className="text-sm text-blue-700">
                          Este contacto tiene una visita programada próximamente.
                        </p>
                      </div>
                    )}

                    {badgeType === "offer" && selectedContact.offer && (
                      <OfferComparisonCard
                        offer={selectedContact.offer}
                        listingPrice={listingPrice}
                      />
                    )}

                    {badgeType === "cancelled" && (
                      <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                        <h4 className="font-medium text-orange-900 mb-2">Visita Cancelada</h4>
                        <p className="text-sm text-orange-700">
                          La visita de este contacto fue cancelada. Considera reprogramar.
                        </p>
                      </div>
                    )}

                    {badgeType === "missed" && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <h4 className="font-medium text-red-900 mb-2">Visita No Realizada</h4>
                        <p className="text-sm text-red-700">
                          Este contacto no asistió a su visita programada. Requiere seguimiento.
                        </p>
                      </div>
                    )}

                    {badgeType === "completed" && (
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Visita Realizada</h4>
                        <p className="text-sm text-gray-700">
                          Este contacto ha completado una visita a la propiedad.
                        </p>
                      </div>
                    )}

                    {badgeType === "none" && (
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sin Visitas Programadas</h4>
                        <p className="text-sm text-gray-700">
                          Este contacto aún no tiene visitas programadas. Considera agendar una.
                        </p>
                      </div>
                    )}

                    {/* Owner Contact Section */}
                    {ownerContact && (
                      <div className="space-y-3 pt-4 border-t">
                        <h5 className="text-sm font-medium text-muted-foreground">Contactar Propietario</h5>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900">
                            {ownerContact.firstName} {ownerContact.lastName ?? ""}
                          </p>

                          {ownerContact.email && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => window.open(`mailto:${ownerContact.email}`, "_blank")}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
                                title="Enviar email"
                              >
                                <Mail className="h-4 w-4" />
                                <span className="underline decoration-dotted underline-offset-2 hover:decoration-solid">
                                  {ownerContact.email}
                                </span>
                              </button>
                            </div>
                          )}

                          {ownerContact.phone && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => window.open(`tel:${ownerContact.phone}`, "_blank")}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
                                title="Llamar"
                              >
                                <Phone className="h-4 w-4" />
                                <span className="underline decoration-dotted underline-offset-2 hover:decoration-solid">
                                  {ownerContact.phone}
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  const cleanPhone = (ownerContact.phone ?? "").replace(/\D/g, "");
                                  window.open(`https://wa.me/${cleanPhone}`, "_blank");
                                }}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Appointment Detail Sheet */}
      <Sheet
        open={selectedAppointment !== null}
        onOpenChange={(open) => {
          console.log("🔍 [Activity] Sheet onOpenChange:", { open, hasAppointment: selectedAppointment !== null });
          if (!open) setSelectedAppointment(null);
        }}
      >
        <SheetContent>
          {selectedAppointment && (() => {
            console.log("🔍 [Activity] Rendering sheet content for:", selectedAppointment.appointmentId.toString());
            const typeConfig = appointmentTypes[
              selectedAppointment.type as keyof typeof appointmentTypes
            ] || {
              color: "bg-gray-100 text-gray-800",
              icon: <CalendarIcon className="h-4 w-4" />,
            };

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

            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {typeConfig.icon}
                    <span>{selectedAppointment.type} - {selectedAppointment.contactName}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{selectedAppointment.type}</p>

                  {/* Status Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={!hasEditCalendarPermission}
                      >
                        <span className={cn(
                          "rounded-full px-2 py-0.5",
                          selectedAppointment.status === "Scheduled" && "bg-gray-100 text-gray-700",
                          selectedAppointment.status === "Completed" && "bg-gray-200 text-gray-800",
                          selectedAppointment.status === "Cancelled" && "bg-gray-50 text-gray-400 line-through",
                          selectedAppointment.status === "Rescheduled" && "bg-gray-150 text-gray-700",
                          selectedAppointment.status === "NoShow" && "bg-gray-100 text-gray-500",
                        )}>
                          {STATUS_LABELS[selectedAppointment.status as VisitStatus]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => {
                          void handleStatusUpdate(selectedAppointment.appointmentId, "Scheduled");
                        }}
                        disabled={isUpdatingStatus || selectedAppointment.status === "Scheduled"}
                      >
                        <CircleDot className="mr-2 h-3 w-3 text-muted-foreground" />
                        Programado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void handleStatusUpdate(selectedAppointment.appointmentId, "Completed");
                        }}
                        disabled={isUpdatingStatus || selectedAppointment.status === "Completed"}
                      >
                        <CheckCircle className="mr-2 h-3 w-3 text-muted-foreground" />
                        Completado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void handleStatusUpdate(selectedAppointment.appointmentId, "Cancelled");
                        }}
                        disabled={isUpdatingStatus || selectedAppointment.status === "Cancelled"}
                      >
                        <Ban className="mr-2 h-3 w-3 text-muted-foreground" />
                        Cancelado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void handleStatusUpdate(selectedAppointment.appointmentId, "Rescheduled");
                        }}
                        disabled={isUpdatingStatus || selectedAppointment.status === "Rescheduled"}
                      >
                        <RotateCw className="mr-2 h-3 w-3 text-muted-foreground" />
                        Reprogramado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void handleStatusUpdate(selectedAppointment.appointmentId, "NoShow");
                        }}
                        disabled={isUpdatingStatus || selectedAppointment.status === "NoShow"}
                      >
                        <UserX className="mr-2 h-3 w-3 text-muted-foreground" />
                        No asistió
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedAppointment.datetimeStart)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTime(selectedAppointment.datetimeStart)} -{" "}
                      {formatTime(selectedAppointment.datetimeEnd)}
                    </span>
                  </div>
                  {selectedAppointment.propertyAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAppointment.propertyAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
                      >
                        {selectedAppointment.propertyAddress}
                      </a>
                    </div>
                  )}
                  {selectedAppointment.tripTimeMinutes && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Tiempo de viaje: {selectedAppointment.tripTimeMinutes} min</span>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div className="pt-2 text-sm">
                      <h5 className="mb-1 text-sm font-medium">Notas</h5>
                      <p>{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons Section */}
                <div className="flex gap-2 pt-4">
                  {(() => {
                    const canEdit = hasEditCalendarPermission;
                    const canDelete = canEdit && hasDeleteCalendarPermission;
                    const showVisitaButton = canEdit && !(selectedAppointment.status === "Completed" && selectedAppointment.type === "Visita");

                    console.log("🔘 [Activity] Action button conditions:", {
                      canEdit,
                      canDelete,
                      showVisitaButton,
                      status: selectedAppointment.status,
                      type: selectedAppointment.type,
                    });

                    return (
                      <>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log("✏️ [Activity] Edit button clicked");
                              // Open the appointment modal with the event data for editing
                              openModalWithEdit({
                                appointmentId: selectedAppointment.appointmentId,
                                initialData: {
                                  contactId: selectedAppointment.contactId,
                                  startDate: selectedAppointment.datetimeStart
                                    .toISOString()
                                    .split("T")[0],
                                  startTime: selectedAppointment.datetimeStart.toTimeString().slice(0, 5),
                                  endDate: selectedAppointment.datetimeEnd.toISOString().split("T")[0],
                                  endTime: selectedAppointment.datetimeEnd.toTimeString().slice(0, 5),
                                  tripTimeMinutes: selectedAppointment.tripTimeMinutes,
                                  notes: selectedAppointment.notes,
                                  appointmentType: selectedAppointment.type as
                                    | "Visita"
                                    | "Reunión"
                                    | "Firma"
                                    | "Cierre"
                                    | "Viaje",
                                },
                              });
                              setSelectedAppointment(null); // Close the detail panel
                            }}
                            className="flex-1"
                          >
                            Editar
                          </Button>
                        )}
                        {showVisitaButton && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              console.log("🏠 [Activity] Visita button clicked");
                              router.push(
                                `/calendario/visita/${selectedAppointment.appointmentId}`,
                              );
                              setSelectedAppointment(null); // Close the detail panel
                            }}
                            className="flex-1"
                          >
                            Visita
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              console.log("🗑️ [Activity] Delete button clicked");
                              void handleDeleteAppointment(selectedAppointment.appointmentId);
                            }}
                            disabled={isDeletingAppointment}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar"
                          >
                            {isDeletingAppointment ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Appointment Modal for editing */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={closeModal}
        initialData={modalInitialData}
        mode={editMode}
        appointmentId={editingAppointmentId ?? undefined}
        onSuccess={() => {
          // Trigger a page refresh to get updated data
          window.location.reload();
        }}
        // No optimistic updates for activity tab - undefined means modal won't use optimistic updates
        addOptimisticEvent={undefined}
        removeOptimisticEvent={undefined}
        updateOptimisticEvent={undefined}
      />
    </div>
  );
}
