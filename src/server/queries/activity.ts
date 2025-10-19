"use server";

import { db } from "../db";
import {
  appointments,
  contacts,
  listingContacts,
  users,
  documents,
} from "../db/schema";
import { eq, and, or, sql, desc, inArray, isNull } from "drizzle-orm";
import { getCurrentUserAccountId } from "../../lib/dal";

/**
 * Get visits summary for a listing
 * Returns all appointments with type 'Visita' including contact, agent, and signature info
 */
export async function getListingVisitsSummary(listingId: bigint) {
  try {
    const accountId = await getCurrentUserAccountId();

    // Get all visit appointments for this listing
    const allVisits = await db
      .select({
        appointmentId: appointments.appointmentId,
        datetimeStart: appointments.datetimeStart,
        datetimeEnd: appointments.datetimeEnd,
        status: appointments.status,
        tripTimeMinutes: appointments.tripTimeMinutes,
        notes: appointments.notes,
        type: appointments.type,
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        contactEmail: contacts.email,
        contactPhone: contacts.phone,
        agentName: users.name,
        googleEventId: appointments.googleEventId,
      })
      .from(appointments)
      .leftJoin(contacts, eq(appointments.contactId, contacts.contactId))
      .leftJoin(users, eq(appointments.userId, users.id))
      .where(
        and(
          eq(appointments.listingId, listingId),
          eq(appointments.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
          or(
            eq(appointments.type, "Visita"),
            isNull(appointments.type)
          )
        )
      )
      .orderBy(desc(appointments.datetimeStart));

    // Get appointment IDs for signature check
    const appointmentIds = allVisits.map((v) => v.appointmentId);

    // Check for signatures for each appointment
    let signatures: Array<{ appointmentId: bigint; count: number }> = [];
    if (appointmentIds.length > 0) {
      const signatureResults = await db
        .select({
          appointmentId: documents.appointmentId,
          count: sql<number>`COUNT(*)`.as('count'),
        })
        .from(documents)
        .where(
          and(
            inArray(documents.appointmentId, appointmentIds),
            eq(documents.documentTag, "firma-visita"),
            eq(documents.isActive, true)
          )
        )
        .groupBy(documents.appointmentId);

      signatures = signatureResults
        .filter((s): s is { appointmentId: bigint; count: number } => s.appointmentId !== null)
        .map((s) => ({
          appointmentId: s.appointmentId,
          count: Number(s.count),
        }));
    }

    const signatureMap = new Map(
      signatures.map((s) => [s.appointmentId.toString(), s.count])
    );

    return allVisits.map((visit) => ({
      ...visit,
      hasSignatures: (signatureMap.get(visit.appointmentId.toString()) ?? 0) >= 2,
    }));
  } catch (error) {
    console.error("Error fetching listing visits summary:", error);
    throw error;
  }
}

/**
 * Get contacts summary for a listing
 * Returns contacts interested in this listing with visit counts
 */
export async function getListingContactsSummary(listingId: bigint) {
  try {
    const accountId = await getCurrentUserAccountId();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all contacts for this listing (buyers and viewers)
    const allContacts = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        contactType: listingContacts.contactType,
        source: listingContacts.source,
        status: listingContacts.status,
        createdAt: listingContacts.createdAt,
      })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingId, listingId),
          eq(listingContacts.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
          or(
            eq(listingContacts.contactType, "buyer"),
            eq(listingContacts.contactType, "viewer")
          )
        )
      )
      .orderBy(desc(listingContacts.createdAt));

    // Get visit counts for each contact
    const contactIds = allContacts.map((c) => c.contactId);
    let visitCounts: Array<{
      contactId: bigint;
      totalVisits: number;
      upcomingVisits: number;
      missedVisits: number;
      completedVisits: number;
    }> = [];

    if (contactIds.length > 0) {
      const visitCountResults = await db
        .select({
          contactId: appointments.contactId,
          totalVisits: sql<number>`COUNT(*)`.as('totalVisits'),
          upcomingVisits: sql<number>`SUM(CASE WHEN ${appointments.datetimeStart} > NOW() AND ${appointments.status} = 'Scheduled' THEN 1 ELSE 0 END)`.as('upcomingVisits'),
          missedVisits: sql<number>`SUM(CASE WHEN ${appointments.datetimeStart} < NOW() AND ${appointments.status} = 'Scheduled' THEN 1 ELSE 0 END)`.as('missedVisits'),
          completedVisits: sql<number>`SUM(CASE WHEN ${appointments.datetimeStart} < NOW() AND ${appointments.status} = 'Completed' THEN 1 ELSE 0 END)`.as('completedVisits'),
        })
        .from(appointments)
        .where(
          and(
            inArray(appointments.contactId, contactIds),
            eq(appointments.listingId, listingId),
            eq(appointments.isActive, true)
          )
        )
        .groupBy(appointments.contactId);

      visitCounts = visitCountResults
        .filter((v): v is { contactId: bigint; totalVisits: number; upcomingVisits: number; missedVisits: number; completedVisits: number } => v.contactId !== null)
        .map((v) => ({
          contactId: v.contactId,
          totalVisits: Number(v.totalVisits),
          upcomingVisits: Number(v.upcomingVisits),
          missedVisits: Number(v.missedVisits),
          completedVisits: Number(v.completedVisits),
        }));
    }

    const visitMap = new Map(
      visitCounts.map((v) => [v.contactId.toString(), v])
    );

    const contactsWithVisitStatus = allContacts.map((contact) => {
      const hasUpcomingVisit = (visitMap.get(contact.contactId.toString())?.upcomingVisits ?? 0) > 0;
      const hasMissedVisit = (visitMap.get(contact.contactId.toString())?.missedVisits ?? 0) > 0;
      const hasDoneVisit = (visitMap.get(contact.contactId.toString())?.completedVisits ?? 0) > 0;

      // Priority for sorting: 1=crear visita, 2=missed, 3=upcoming, 4=done
      let sortPriority = 4;
      if (!hasUpcomingVisit && !hasMissedVisit && !hasDoneVisit) {
        sortPriority = 1; // Crear visita
      } else if (hasMissedVisit) {
        sortPriority = 2; // Missed visit
      } else if (hasUpcomingVisit) {
        sortPriority = 3; // Upcoming visit
      }

      return {
        ...contact,
        visitCount: visitMap.get(contact.contactId.toString())?.totalVisits ?? 0,
        hasUpcomingVisit,
        hasMissedVisit,
        hasDoneVisit,
        isNew: contact.createdAt >= thirtyDaysAgo,
        sortPriority,
      };
    });

    // Sort by priority, then by creation date
    return contactsWithVisitStatus.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error) {
    console.error("Error fetching listing contacts summary:", error);
    throw error;
  }
}
