"use server";

import { db } from "../db";
import { leads, contacts } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { Lead } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
export async function createLeadWithAuth(
  data: Omit<Lead, "leadId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return createLead(data, accountId);
}

export async function getLeadByIdWithAuth(leadId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadById(leadId, accountId);
}

export async function getLeadsByContactIdWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadsByContactId(contactId, accountId);
}

export async function getLeadsByListingIdWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadsByListingId(listingId, accountId);
}

export async function updateLeadWithAuth(
  leadId: number,
  data: Omit<Partial<Lead>, "leadId">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateLead(leadId, data, accountId);
}

export async function deleteLeadWithAuth(leadId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteLead(leadId, accountId);
}

export async function listLeadsWithAuth(page = 1, limit = 10) {
  const accountId = await getCurrentUserAccountId();
  return listLeads(page, limit, accountId);
}

// Create a new lead
export async function createLead(
  data: Omit<Lead, "leadId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // Verify the contact belongs to this account
    const [contact] = await db
      .select({ contactId: contacts.contactId })
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, data.contactId),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );

    if (!contact) {
      throw new Error("Contact not found or access denied");
    }

    const [result] = await db.insert(leads).values(data).$returningId();
    if (!result) throw new Error("Failed to create lead");
    const [newLead] = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.leadId, BigInt(result.leadId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return newLead;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

// Get lead by ID
export async function getLeadById(leadId: number, accountId: number) {
  try {
    const [lead] = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.leadId, BigInt(leadId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return lead;
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
}

// Get leads by contact ID
export async function getLeadsByContactId(
  contactId: number,
  accountId: number,
) {
  try {
    // Verify the contact belongs to this account
    const [contact] = await db
      .select({ contactId: contacts.contactId })
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );

    if (!contact) {
      throw new Error("Contact not found or access denied");
    }

    const contactLeads = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return contactLeads;
  } catch (error) {
    console.error("Error fetching leads by contact:", error);
    throw error;
  }
}

// Get leads by listing ID
export async function getLeadsByListingId(
  listingId: number,
  accountId: number,
) {
  try {
    const listingLeads = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.listingId, BigInt(listingId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return listingLeads;
  } catch (error) {
    console.error("Error fetching leads by listing:", error);
    throw error;
  }
}

// Update lead
export async function updateLead(
  leadId: number,
  data: Omit<Partial<Lead>, "leadId">,
  accountId: number,
) {
  try {
    // Verify the lead belongs to this account
    const [existingLead] = await db
      .select({ leadId: leads.leadId })
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.leadId, BigInt(leadId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!existingLead) {
      throw new Error("Lead not found or access denied");
    }

    await db
      .update(leads)
      .set(data)
      .where(eq(leads.leadId, BigInt(leadId)));
    const [updatedLead] = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.leadId, BigInt(leadId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

// Delete lead
export async function deleteLead(leadId: number, accountId: number) {
  try {
    // Verify the lead belongs to this account
    const [existingLead] = await db
      .select({ leadId: leads.leadId })
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(leads.leadId, BigInt(leadId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!existingLead) {
      throw new Error("Lead not found or access denied");
    }

    await db.delete(leads).where(eq(leads.leadId, BigInt(leadId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

// List all leads (with pagination)
export async function listLeads(page = 1, limit = 10, accountId: number) {
  try {
    const offset = (page - 1) * limit;
    const allLeads = await db
      .select()
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(eq(contacts.accountId, BigInt(accountId)))
      .limit(limit)
      .offset(offset);
    return allLeads;
  } catch (error) {
    console.error("Error listing leads:", error);
    throw error;
  }
}
