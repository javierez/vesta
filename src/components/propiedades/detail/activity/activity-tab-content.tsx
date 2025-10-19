"use client";

import { useState } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { AppointmentCard, type AppointmentData } from "~/components/appointments/appointment-card";
import { CompactContactCard } from "./compact-contact-card";
import { EmptyState } from "./empty-states";
import type { ActivityTabContentProps } from "~/types/activity";

type ActiveView = "visits" | "contacts" | null;

export function ActivityTabContent({
  visits,
  contacts,
  listingId,
}: ActivityTabContentProps) {
  const [activeView, setActiveView] = useState<ActiveView>("visits");

  const completedVisits = visits.filter((v) => v.status === "Completed");
  const scheduledVisits = visits.filter((v) => v.status === "Scheduled");
  const newContacts = contacts.filter((c) => c.isNew);

  const handleVisitsClick = () => {
    setActiveView(activeView === "visits" ? null : "visits");
  };

  const handleContactsClick = () => {
    setActiveView(activeView === "contacts" ? null : "contacts");
  };

  return (
    <div className="space-y-6">
      {/* KPI Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <VisitsKPICard
          completedCount={completedVisits.length}
          scheduledCount={scheduledVisits.length}
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
        <div className="space-y-3 animate-in fade-in duration-300">
          {/* Scheduled Visits */}
          {scheduledVisits.length === 0 ? (
            <EmptyState type="scheduled-visits" />
          ) : (
            scheduledVisits.map((visit) => {
              const appointmentData: AppointmentData = {
                appointmentId: visit.appointmentId,
                type: visit.type ?? "",
                status: (visit.status ?? "Scheduled") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                datetimeStart: visit.datetimeStart,
                datetimeEnd: visit.datetimeEnd,
                tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                notes: visit.notes ?? undefined,
                contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                propertyAddress: undefined, // Not available in visit data
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
            })
          )}

          {/* Soft separator line between scheduled and completed visits */}
          {scheduledVisits.length > 0 && completedVisits.length > 0 && (
            <div className="border-t border-gray-200 my-4"></div>
          )}

          {/* Completed Visits */}
          {completedVisits.length === 0 ? (
            <EmptyState type="completed-visits" />
          ) : (
            completedVisits.map((visit) => {
              const appointmentData: AppointmentData = {
                appointmentId: visit.appointmentId,
                type: visit.type ?? "",
                status: (visit.status ?? "Completed") as "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" | "NoShow",
                datetimeStart: visit.datetimeStart,
                datetimeEnd: visit.datetimeEnd,
                tripTimeMinutes: visit.tripTimeMinutes ?? undefined,
                notes: visit.notes ?? undefined,
                contactName: `${visit.contactFirstName ?? ""} ${visit.contactLastName ?? ""}`.trim(),
                propertyAddress: undefined, // Not available in visit data
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
            })
          )}
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
                  hasDoneVisit: contact.hasDoneVisit,
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
                    hasDoneVisit={contact.hasDoneVisit}
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
                    hasDoneVisit: contact.hasDoneVisit,
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
                      hasDoneVisit={contact.hasDoneVisit}
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
