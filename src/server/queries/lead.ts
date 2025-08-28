"use server";

import { db } from "../db";
import {
  leads,
  contacts,
  listings,
  properties,
  listingContacts,
} from "../db/schema";
import { eq, and, like, or, count, aliasedTable } from "drizzle-orm";
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

export async function listLeadsWithAuth(
  page = 1,
  limit = 10,
  search?: string,
  statusFilters?: string[],
  sourceFilters?: string[],
) {
  const accountId = await getCurrentUserAccountId();
  // Always use the detailed query to include listing and owner information
  return listLeadsWithDetails(
    page,
    limit,
    accountId,
    search,
    statusFilters,
    sourceFilters,
  );
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

// Enhanced function with complete joins and filtering
export async function listLeadsWithDetails(
  page = 1,
  limit = 10,
  accountId: number,
  search?: string,
  statusFilters?: string[],
  sourceFilters?: string[],
) {
  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(contacts.accountId, BigInt(accountId))];

    // Add search condition
    if (search) {
      const searchCondition = or(
        like(contacts.firstName, `%${search}%`),
        like(contacts.lastName, `%${search}%`),
        like(contacts.email, `%${search}%`),
      );
      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    // Add status filters
    if (statusFilters && statusFilters.length > 0) {
      const statusConditions = statusFilters.map((status) =>
        eq(leads.status, status),
      );
      if (statusConditions.length > 0) {
        const statusCondition =
          statusConditions.length === 1
            ? statusConditions[0]!
            : or(...statusConditions);
        if (statusCondition) {
          whereConditions.push(statusCondition);
        }
      }
    }

    // Add source filters
    if (sourceFilters && sourceFilters.length > 0) {
      const sourceConditions = sourceFilters.map((source) =>
        eq(leads.source, source),
      );
      if (sourceConditions.length > 0) {
        const sourceCondition =
          sourceConditions.length === 1
            ? sourceConditions[0]!
            : or(...sourceConditions);
        if (sourceCondition) {
          whereConditions.push(sourceCondition);
        }
      }
    }

    // Create alias for owner contacts to avoid naming conflicts
    const ownerContacts = aliasedTable(contacts, "ownerContacts");

    // Main query with all joins
    const allLeads = await db
      .select({
        // Lead data
        leadId: leads.leadId,
        contactId: leads.contactId,
        listingId: leads.listingId,
        prospectId: leads.prospectId,
        source: leads.source,
        status: leads.status,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,

        // Contact data (lead contact)
        contact: {
          contactId: contacts.contactId,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          email: contacts.email,
          phone: contacts.phone,
        },

        // Listing data (optional)
        listing: {
          listingId: listings.listingId,
          referenceNumber: properties.referenceNumber,
          street: properties.street,
          price: listings.price,
          listingType: listings.listingType,
          propertyType: properties.propertyType,
          bedrooms: properties.bedrooms,
          squareMeter: properties.squareMeter,
        },

        // Owner data (optional, from junction table)
        owner: {
          contactId: ownerContacts.contactId,
          firstName: ownerContacts.firstName,
          lastName: ownerContacts.lastName,
          email: ownerContacts.email,
          phone: ownerContacts.phone,
        },
      })
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .leftJoin(listings, eq(leads.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        listingContacts,
        and(
          eq(listings.listingId, listingContacts.listingId),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
        ),
      )
      .leftJoin(
        ownerContacts,
        eq(listingContacts.contactId, ownerContacts.contactId),
      )
      .where(and(...whereConditions))
      .orderBy(leads.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResults = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .leftJoin(listings, eq(leads.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        listingContacts,
        and(
          eq(listings.listingId, listingContacts.listingId),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
        ),
      )
      .leftJoin(
        ownerContacts,
        eq(listingContacts.contactId, ownerContacts.contactId),
      )
      .where(and(...whereConditions));

    const totalCount = totalResults[0] && 'count' in totalResults[0]
      ? Number((totalResults[0] as {count: unknown}).count)
      : 0;

    return {
      leads: allLeads,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error listing leads with details:", error);
    throw error;
  }
}
