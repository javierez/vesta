"use server";

import { db } from "../db";
import {
  listingContacts,
  contacts,
  listings,
  properties,
} from "../db/schema";
import { eq, and, like, or, aliasedTable, countDistinct, desc, asc } from "drizzle-orm";
import type { Lead } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
export async function createLeadWithAuth(
  data: Omit<Lead, "listingContactId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return createLead(data, accountId);
}

export async function getLeadByIdWithAuth(listingContactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadById(listingContactId, accountId);
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
  listingContactId: number,
  data: Omit<Partial<Lead>, "listingContactId">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateLead(listingContactId, data, accountId);
}

export async function deleteLeadWithAuth(listingContactId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteLead(listingContactId, accountId);
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
  data: Omit<Lead, "listingContactId" | "createdAt" | "updatedAt">,
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

    const leadData = {
      contactId: data.contactId,
      listingId: data.listingId,
      contactType: "buyer" as const,
      prospectId: data.prospectId,
      source: data.source,
      status: data.status,
      isActive: true
    };

    const [result] = await db.insert(listingContacts).values(leadData).$returningId();
    if (!result) throw new Error("Failed to create lead");
    const [newLead] = await db
      .select()
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingContactId, BigInt(result.listingContactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
        ),
      );
    return newLead;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

// Get lead by ID
export async function getLeadById(listingContactId: number, accountId: number) {
  try {
    const [lead] = await db
      .select()
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingContactId, BigInt(listingContactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
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
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
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
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
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
  listingContactId: number,
  data: Omit<Partial<Lead>, "listingContactId">,
  accountId: number,
) {
  try {
    // Verify the lead belongs to this account
    const [existingLead] = await db
      .select({ listingContactId: listingContacts.listingContactId })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingContactId, BigInt(listingContactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
        ),
      );

    if (!existingLead) {
      throw new Error("Lead not found or access denied");
    }

    await db
      .update(listingContacts)
      .set(data)
      .where(eq(listingContacts.listingContactId, BigInt(listingContactId)));
    const [updatedLead] = await db
      .select()
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingContactId, BigInt(listingContactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
        ),
      );
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

// Delete lead
export async function deleteLead(listingContactId: number, accountId: number) {
  try {
    // Verify the lead belongs to this account
    const [existingLead] = await db
      .select({ listingContactId: listingContacts.listingContactId })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingContactId, BigInt(listingContactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(listingContacts.contactType, "buyer"),
        ),
      );

    if (!existingLead) {
      throw new Error("Lead not found or access denied");
    }

    await db.delete(listingContacts).where(eq(listingContacts.listingContactId, BigInt(listingContactId)));
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
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(and(
        eq(contacts.accountId, BigInt(accountId)),
        eq(listingContacts.contactType, "buyer")
      ))
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
        eq(listingContacts.status, status),
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
        eq(listingContacts.source, source),
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

    // Create aliases for owner tables to avoid naming conflicts
    const ownerListingContacts = aliasedTable(listingContacts, "ownerListingContacts");
    const ownerContacts = aliasedTable(contacts, "ownerContacts");

    // Main query with all joins
    const allLeads = await db
      .select({
        // Lead data
        listingContactId: listingContacts.listingContactId,
        contactId: listingContacts.contactId,
        listingId: listingContacts.listingId,
        prospectId: listingContacts.prospectId,
        source: listingContacts.source,
        status: listingContacts.status,
        createdAt: listingContacts.createdAt,
        updatedAt: listingContacts.updatedAt,

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
          title: properties.title,
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
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .leftJoin(listings, eq(listingContacts.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      // Join owner data via listing_contacts with contactType="owner"
      .leftJoin(
        ownerListingContacts,
        and(
          eq(listings.listingId, ownerListingContacts.listingId),
          eq(ownerListingContacts.contactType, "owner")
        )
      )
      .leftJoin(ownerContacts, eq(ownerListingContacts.contactId, ownerContacts.contactId))
      .where(and(
        eq(listingContacts.contactType, "buyer"),
        ...whereConditions
      ))
      .orderBy(desc(listingContacts.createdAt), asc(listingContacts.status))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination (count distinct to handle duplicates)
    const totalResults = await db
      .select({ count: countDistinct(listingContacts.listingContactId) })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .leftJoin(listings, eq(listingContacts.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      // Add same owner joins to maintain consistency
      .leftJoin(
        ownerListingContacts,
        and(
          eq(listings.listingId, ownerListingContacts.listingId),
          eq(ownerListingContacts.contactType, "owner")
        )
      )
      .leftJoin(ownerContacts, eq(ownerListingContacts.contactId, ownerContacts.contactId))
      .where(and(
        eq(listingContacts.contactType, "buyer"),
        ...whereConditions
      ));

    const totalCount = totalResults[0] && 'count' in totalResults[0]
      ? Number((totalResults[0] as {count: unknown}).count)
      : 0;

    // Deduplicate results by listingContactId in case of duplicate rows from joins
    const uniqueLeads = allLeads.reduce((acc, lead) => {
      const key = String((lead as Record<string, unknown>).listingContactId);
      if (!acc.has(key)) {
        acc.set(key, lead);
      }
      return acc;
    }, new Map());

    const deduplicatedLeads = Array.from(uniqueLeads.values());

    return {
      leads: deduplicatedLeads,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error listing leads with details:", error);
    throw error;
  }
}
