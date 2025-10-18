"use client";

import { useState } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { CompactVisitCard } from "./compact-visit-card";
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
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Completed Visits Section */}
          <ExpandableSection
            title="Visitas Realizadas"
            count={completedVisits.length}
            defaultExpanded={true}
            storageKey={`activity-completed-visits-${listingId}`}
          >
            <div className="space-y-3">
              {completedVisits.length === 0 ? (
                <EmptyState type="completed-visits" />
              ) : (
                completedVisits.map((visit) => (
                  <CompactVisitCard
                    key={visit.appointmentId.toString()}
                    appointment={{
                      appointmentId: visit.appointmentId,
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      status: visit.status,
                      tripTimeMinutes: visit.tripTimeMinutes,
                      notes: visit.notes,
                      type: visit.type,
                    }}
                    contact={{
                      firstName: visit.contactFirstName,
                      lastName: visit.contactLastName,
                      email: visit.contactEmail,
                      phone: visit.contactPhone,
                    }}
                    agent={{
                      name: visit.agentName,
                    }}
                    hasSignatures={visit.hasSignatures}
                  />
                ))
              )}
            </div>
          </ExpandableSection>

          {/* Scheduled Visits Section */}
          <ExpandableSection
            title="Visitas Pendientes"
            count={scheduledVisits.length}
            defaultExpanded={true}
            storageKey={`activity-scheduled-visits-${listingId}`}
          >
            <div className="space-y-3">
              {scheduledVisits.length === 0 ? (
                <EmptyState type="scheduled-visits" />
              ) : (
                scheduledVisits.map((visit) => (
                  <CompactVisitCard
                    key={visit.appointmentId.toString()}
                    appointment={{
                      appointmentId: visit.appointmentId,
                      datetimeStart: visit.datetimeStart,
                      datetimeEnd: visit.datetimeEnd,
                      status: visit.status,
                      tripTimeMinutes: visit.tripTimeMinutes,
                      notes: visit.notes,
                      type: visit.type,
                    }}
                    contact={{
                      firstName: visit.contactFirstName,
                      lastName: visit.contactLastName,
                      email: visit.contactEmail,
                      phone: visit.contactPhone,
                    }}
                    agent={{
                      name: visit.agentName,
                    }}
                    hasSignatures={false}
                  />
                ))
              )}
            </div>
          </ExpandableSection>
        </div>
      )}

      {/* Contacts Content - shown when contacts card is active */}
      {activeView === "contacts" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ExpandableSection
            title="Nuevos Contactos"
            count={newContacts.length}
            defaultExpanded={true}
            storageKey={`activity-new-contacts-${listingId}`}
          >
            <div className="space-y-3">
              {newContacts.length === 0 ? (
                <EmptyState type="new-contacts" />
              ) : (
                newContacts.map((contact) => (
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
                    visitCount={contact.visitCount}
                  />
                ))
              )}
            </div>
          </ExpandableSection>

          {/* All Contacts Section */}
          {contacts.length > newContacts.length && (
            <ExpandableSection
              title="Todos los Contactos"
              count={contacts.length}
              defaultExpanded={false}
              storageKey={`activity-all-contacts-${listingId}`}
            >
              <div className="space-y-3">
                {contacts.map((contact) => (
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
                    visitCount={contact.visitCount}
                  />
                ))}
              </div>
            </ExpandableSection>
          )}
        </div>
      )}
    </div>
  );
}
