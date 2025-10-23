"use client";

import { useState } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { AppointmentCard, type AppointmentData } from "~/components/appointments/appointment-card";
import { CompactContactCard } from "./compact-contact-card";
import { EmptyState } from "./empty-states";
import type { ActivityTabContentProps } from "~/types/activity";
import { Button } from "~/components/ui/button";
import { Filter, Check, ChevronDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";

type ActiveView = "visits" | "contacts" | null;
type VisitStatus = "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow";

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

export function ActivityTabContent({
  visits,
  contacts,
  listingId,
}: ActivityTabContentProps) {
  const [activeView, setActiveView] = useState<ActiveView>("visits");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<VisitStatus>>(
    new Set(["Completed", "Scheduled", "Cancelled", "Rescheduled", "NoShow"])
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["Visita", "Reunión", "Firma", "Cierre", "Viaje"])
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    status: true,
    type: true,
  });

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

  // Contacts filtering
  const newContacts = contacts.filter((c) => c.isNew);

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

  const clearFilters = () => {
    setSelectedStatuses(new Set(["Completed", "Scheduled", "Cancelled", "Rescheduled", "NoShow"]));
    setSelectedTypes(new Set(["Visita", "Reunión", "Firma", "Cierre", "Viaje"]));
  };

  const activeFilterCount =
    (5 - selectedStatuses.size) + (5 - selectedTypes.size); // Count deselected items

  // Get unique types from visits
  const availableTypes = Array.from(new Set(visits.map((v) => v.type).filter((t): t is string => t !== null)));

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
                <Button variant="outline" className="h-9 relative">
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
                        navigateToVisit={true}
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
                        navigateToVisit={true}
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
                        navigateToVisit={true}
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
                        navigateToVisit={true}
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
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-3">
            {newContacts.length === 0 ? (
              <EmptyState type="new-contacts" />
            ) : (
              newContacts.map((contact) => {
                console.log('📇 Contact card data:', {
                  contactId: contact.contactId.toString(),
                  name: `${contact.firstName} ${contact.lastName ?? ''}`,
                  contactType: contact.contactType,
                  status: contact.status,
                  source: contact.source,
                  hasUpcomingVisit: contact.hasUpcomingVisit,
                  hasMissedVisit: contact.hasMissedVisit,
                  hasCompletedVisit: contact.hasCompletedVisit,
                  hasCancelledVisit: contact.hasCancelledVisit,
                  hasOffer: contact.hasOffer,
                  visitCount: contact.visitCount,
                  createdAt: contact.createdAt,
                });
                return (
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
                  />
                );
              })
            )}
          </div>

          {/* All Contacts Section */}
          {contacts.length > newContacts.length && (
            <ExpandableSection
              title="Todos los Contactos"
              count={contacts.length}
              defaultExpanded={false}
              storageKey={`activity-all-contacts-${listingId}`}
            >
              <div className="space-y-3">
                {contacts.map((contact) => {
                  console.log('📇 All contacts - Contact card data:', {
                    contactId: contact.contactId.toString(),
                    name: `${contact.firstName} ${contact.lastName ?? ''}`,
                    contactType: contact.contactType,
                    status: contact.status,
                    source: contact.source,
                    hasUpcomingVisit: contact.hasUpcomingVisit,
                    hasMissedVisit: contact.hasMissedVisit,
                    hasCompletedVisit: contact.hasCompletedVisit,
                    hasCancelledVisit: contact.hasCancelledVisit,
                    hasOffer: contact.hasOffer,
                    visitCount: contact.visitCount,
                    createdAt: contact.createdAt,
                  });
                  return (
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
                    />
                  );
                })}
              </div>
            </ExpandableSection>
          )}
        </div>
      )}
    </div>
  );
}
