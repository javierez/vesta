"use client";

import { useState } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { AppointmentCard, type AppointmentData } from "~/components/appointments/appointment-card";
import { CompactContactCard } from "./compact-contact-card";
import { EmptyState } from "./empty-states";
import type { ActivityTabContentProps, ContactSheetData } from "~/types/activity";
import { Button } from "~/components/ui/button";
import { Filter, Check, ChevronDown, X, Clock, MapPin, CalendarIcon, Home, Users, PenTool, Handshake, Train, Mail, Phone, CalendarPlus } from "lucide-react";
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

type ActiveView = "visits" | "contacts" | null;
type VisitStatus = "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow";

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
}: ActivityTabContentProps) {
  const [activeView, setActiveView] = useState<ActiveView>("visits");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSheetData | null>(null);
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

  // Contact filters - using badge flags instead of status
  const [selectedContactFlags, setSelectedContactFlags] = useState<Set<string>>(
    new Set(["hasUpcomingVisit", "hasMissedVisit", "hasCancelledVisit", "hasCompletedVisit", "hasOffer", "noVisits"])
  );

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

  // Sorting logic for contacts - Priority based
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // 1. Priority: Has upcoming visit (highest priority)
    if (a.hasUpcomingVisit !== b.hasUpcomingVisit) return a.hasUpcomingVisit ? -1 : 1;

    // 2. Priority: Has offer
    if (a.hasOffer !== b.hasOffer) return a.hasOffer ? -1 : 1;

    // 3. Priority: Has missed visit (needs attention)
    if (a.hasMissedVisit !== b.hasMissedVisit) return a.hasMissedVisit ? -1 : 1;

    // 4. Priority: Visit count (more engaged contacts first)
    if (a.visitCount !== b.visitCount) return b.visitCount - a.visitCount;

    // 5. Finally: Most recent first
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

                    {badgeType === "offer" && (
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <h4 className="font-medium text-green-900 mb-2">Oferta en Curso</h4>
                        <p className="text-sm text-green-700">
                          Este contacto ha realizado una oferta por la propiedad.
                        </p>
                      </div>
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

                    {/* Contact Information */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Información de Contacto</h5>

                      {selectedContact.contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${selectedContact.contact.email}`}
                            className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
                          >
                            {selectedContact.contact.email}
                          </a>
                        </div>
                      )}

                      {selectedContact.contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${selectedContact.contact.phone}`}
                            className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
                          >
                            {selectedContact.contact.phone}
                          </a>
                        </div>
                      )}

                      {selectedContact.contact.createdAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Contacto desde{" "}
                            {new Intl.DateTimeFormat("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(selectedContact.contact.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
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
                    <Badge variant="secondary" className="text-xs">
                      {STATUS_LABELS[selectedAppointment.status as VisitStatus]}
                    </Badge>
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
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
