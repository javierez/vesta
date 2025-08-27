"use server";

import { db } from "../db";
import {
  contacts,
  listings,
  properties,
  locations,
  prospects,
} from "../db/schema";
import { eq, and, or, like, sql, inArray } from "drizzle-orm";
import type { Contact } from "../../lib/data";
import { listingContacts } from "../db/schema";
import { prospectUtils } from "../../lib/utils";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
// These maintain backward compatibility while adding account filtering

export async function getContactByIdWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getContactById(contactId, accountId);
}

export async function getContactsByOrgIdWithAuth(orgId: number) {
  const accountId = await getCurrentUserAccountId();
  return getContactsByOrgId(orgId, accountId);
}

export async function searchContactsWithAuth(query: string) {
  const accountId = await getCurrentUserAccountId();
  return searchContacts(query, accountId);
}

export async function updateContactWithAuth(
  contactId: number,
  data: Parameters<typeof updateContact>[2],
) {
  const accountId = await getCurrentUserAccountId();
  return updateContact(contactId, accountId, data);
}

export async function softDeleteContactWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return softDeleteContact(contactId, accountId);
}

export async function deleteContactWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteContact(contactId, accountId);
}

export async function listContactsWithTypesWithAuth(
  page = 1,
  limit = 100,
  filters?: Parameters<typeof listContactsWithTypes>[3],
) {
  const accountId = await getCurrentUserAccountId();
  return listContactsWithTypes(accountId, page, limit, filters);
}

export async function listContactsWithAuth(
  page = 1,
  limit = 10,
  filters?: Parameters<typeof listContacts>[3],
) {
  const accountId = await getCurrentUserAccountId();
  return listContacts(accountId, page, limit, filters);
}

export async function getAllPotentialOwnersWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getAllPotentialOwners(accountId);
}

export async function getCurrentListingOwnersWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return getCurrentListingOwners(listingId, accountId);
}

export async function updateListingOwnersWithAuth(
  listingId: number,
  ownerIds: number[],
) {
  const accountId = await getCurrentUserAccountId();
  return updateListingOwners(listingId, ownerIds, accountId);
}

export async function getDraftContactsWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getDraftContacts(accountId);
}

export async function deleteDraftContactWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteDraftContact(contactId, accountId);
}

// Get draft contacts (contacts with no classification: not owners, buyers, or prospects)
export async function getDraftContacts(accountId: number) {
  try {
    // Get contacts with their role counts and flags
    const draftContacts = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        additionalInfo: contacts.additionalInfo,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
        // Calculate role counts and flags
        ownerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        buyerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        prospectCount: sql<number>`
          (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId})
        `,
        isOwner: sql<boolean>`
          CASE WHEN COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END) > 0 THEN true ELSE false END
        `,
        isBuyer: sql<boolean>`
          CASE WHEN COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END) > 0 THEN true ELSE false END
        `,
        isInteresado: sql<boolean>`
          CASE WHEN (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId}) > 0 THEN true ELSE false END
        `,
      })
      .from(contacts)
      .leftJoin(
        listingContacts,
        and(
          eq(contacts.contactId, listingContacts.contactId),
          eq(listingContacts.isActive, true),
        ),
      )
      .where(
        and(
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      )
      .groupBy(
        contacts.contactId,
        contacts.firstName,
        contacts.lastName,
        contacts.email,
        contacts.phone,
        contacts.additionalInfo,
        contacts.isActive,
        contacts.createdAt,
        contacts.updatedAt,
      )
      .having(
        and(
          // Draft contacts have no owner relationships
          sql`COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END) = 0`,
          // Draft contacts have no buyer relationships
          sql`COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END) = 0`,
          // Draft contacts have no prospects
          sql`(SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId}) = 0`
        ),
      )
      .orderBy(contacts.createdAt);

    return draftContacts;
  } catch (error) {
    console.error("Error fetching draft contacts:", error);
    throw error;
  }
}

// Delete a draft contact (hard delete since it's unclassified)
export async function deleteDraftContact(contactId: number, accountId: number) {
  try {
    // First verify the contact is indeed a draft (has no relationships)
    const [contact] = await db
      .select({
        contactId: contacts.contactId,
        ownerCount: sql<number>`
          (SELECT COUNT(*) FROM listing_contacts 
           WHERE contact_id = ${contacts.contactId} 
           AND contact_type = 'owner' 
           AND is_active = true)
        `,
        buyerCount: sql<number>`
          (SELECT COUNT(*) FROM listing_contacts 
           WHERE contact_id = ${contacts.contactId} 
           AND contact_type = 'buyer' 
           AND is_active = true)
        `,
        prospectCount: sql<number>`
          (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId})
        `,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Only delete if it's truly a draft (no relationships)
    if (contact.ownerCount > 0 || contact.buyerCount > 0 || contact.prospectCount > 0) {
      throw new Error("Cannot delete contact with existing relationships");
    }

    // Hard delete the contact since it has no relationships
    await db
      .delete(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting draft contact:", error);
    throw error;
  }
}

export async function getContactByIdWithTypeWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getContactByIdWithType(contactId, accountId);
}

export async function getOwnerListingsWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getOwnerListings(contactId, accountId);
}

export async function getBuyerListingsWithAuth(contactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getBuyerListings(contactId, accountId);
}

// Helper function to get preferred area from prospect data
type PreferredArea = { neighborhoodId?: number | string; name?: string };
type ProspectWithPreferredAreas = { preferredAreas?: string | PreferredArea[] };
async function getPreferredAreaFromProspect(
  prospect: ProspectWithPreferredAreas,
): Promise<string | undefined> {
  if (!prospect?.preferredAreas) {
    return undefined;
  }
  let areas: PreferredArea[] = [];
  if (typeof prospect.preferredAreas === "string") {
    try {
      areas = JSON.parse(prospect.preferredAreas) as PreferredArea[];
    } catch {
      return prospect.preferredAreas;
    }
  } else if (Array.isArray(prospect.preferredAreas)) {
    areas = prospect.preferredAreas;
  }
  if (!Array.isArray(areas) || areas.length === 0) {
    return undefined;
  }
  if (areas.length === 1) {
    return areas[0]?.name;
  }
  if (areas.length > 1 && areas[0]?.neighborhoodId) {
    try {
      const area = areas[0];
      const [location] = await db
        .select({ city: locations.city })
        .from(locations)
        .where(eq(locations.neighborhoodId, BigInt(area.neighborhoodId!)))
        .limit(1);
      return location?.city ?? areas[0]?.name;
    } catch (error) {
      console.error("Error fetching city for neighborhood:", error);
      return areas[0]?.name;
    }
  }
  return areas[0]?.name;
}

// Create a new contact
export async function createContact(
  data: Omit<Contact, "contactId" | "createdAt" | "updatedAt">,
) {
  try {
    const accountId = await getCurrentUserAccountId();
    const [result] = await db
      .insert(contacts)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        additionalInfo: data.additionalInfo ?? {},
        accountId: BigInt(accountId),
        isActive: true,
      })
      .$returningId();
    if (!result) throw new Error("Failed to create contact");
    const [newContact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(result.contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return newContact;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Create a new contact with listing relationships
export async function createContactWithListings(
  contactData: Omit<Contact, "contactId" | "createdAt" | "updatedAt">,
  selectedListings: bigint[],
  contactType: "owner" | "buyer",
  ownershipAction?: "change" | "add",
) {
  try {
    const accountId = await getCurrentUserAccountId();
    // First, create the contact
    const [result] = await db
      .insert(contacts)
      .values({
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        additionalInfo: contactData.additionalInfo ?? {},
        accountId: BigInt(accountId),
        isActive: true,
      })
      .$returningId();

    if (!result) throw new Error("Failed to create contact");

    const newContactId = BigInt(result.contactId);

    // Handle listing relationships
    if (selectedListings.length > 0) {
      // If contact type is owner and we have an ownership action
      if (contactType === "owner" && ownershipAction) {
        for (const listingId of selectedListings) {
          if (ownershipAction === "change") {
            // Deactivate all existing owner relationships for this listing
            await db
              .update(listingContacts)
              .set({ isActive: false })
              .where(
                and(
                  eq(listingContacts.listingId, listingId),
                  eq(listingContacts.contactType, "owner"),
                ),
              );
          }
          // For both 'change' and 'add', create new owner relationship
          await db.insert(listingContacts).values({
            listingId: listingId,
            contactId: newContactId,
            contactType: "owner",
            isActive: true,
          });
        }
      } else {
        // For buyers or owners without ownership conflict, just create relationships
        const relationships = selectedListings.map((listingId) => ({
          listingId: listingId,
          contactId: newContactId,
          contactType: contactType,
          isActive: true,
        }));

        await db.insert(listingContacts).values(relationships);
      }
    }

    // Return the created contact
    const [newContact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, newContactId),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    return newContact;
  } catch (error) {
    console.error("Error creating contact with listings:", error);
    throw error;
  }
}

// Get contact by ID
export async function getContactById(contactId: number, accountId: number) {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );
    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Get contacts by organization ID
export async function getContactsByOrgId(orgId: number, accountId: number) {
  try {
    const orgContacts = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.orgId, BigInt(orgId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );
    return orgContacts;
  } catch (error) {
    console.error("Error fetching organization contacts:", error);
    throw error;
  }
}

// Search contacts by name or email
export async function searchContacts(query: string, accountId: number) {
  try {
    const searchResults = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
          or(
            like(contacts.firstName, `%${query}%`),
            like(contacts.lastName, `%${query}%`),
            like(contacts.email, `%${query}%`),
          ),
        ),
      );
    return searchResults;
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
}

// Update contact
export async function updateContact(
  contactId: number,
  accountId: number,
  data: Omit<Partial<Contact>, "contactId" | "createdAt" | "updatedAt">,
) {
  try {
    await db
      .update(contacts)
      .set(data)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );
    const [updatedContact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Soft delete contact (set isActive to false)
export async function softDeleteContact(contactId: number, accountId: number) {
  try {
    await db
      .update(contacts)
      .set({ isActive: false })
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting contact:", error);
    throw error;
  }
}

// Hard delete contact (remove from database)
export async function deleteContact(contactId: number, accountId: number) {
  try {
    await db
      .delete(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// List all contact-listing relationships (each contact can appear multiple times)
export async function listContactsWithTypes(
  accountId: number,
  page = 1,
  limit = 100,
  filters?: {
    orgId?: number;
    isActive?: boolean;
    roles?: string[]; // Changed from contactType to roles
    searchQuery?: string;
    lastContactFilter?: string;
  },
) {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.orgId) {
        whereConditions.push(eq(contacts.orgId, BigInt(filters.orgId)));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(contacts.isActive, filters.isActive));
      }
      if (filters.searchQuery) {
        whereConditions.push(
          or(
            like(contacts.firstName, `%${filters.searchQuery}%`),
            like(contacts.lastName, `%${filters.searchQuery}%`),
            like(contacts.email, `%${filters.searchQuery}%`),
            like(contacts.phone, `%${filters.searchQuery}%`),
          ),
        );
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Always filter by account
    whereConditions.push(eq(contacts.accountId, BigInt(accountId)));

    // Get unique contacts with calculated role counts using LEFT JOINs and GROUP BY
    const uniqueContacts = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        additionalInfo: contacts.additionalInfo,
        orgId: contacts.orgId,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
        // Calculate role counts and flags using conditional aggregation
        ownerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        buyerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        // Count prospects for this contact
        prospectCount: sql<number>`
          (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId})
        `,
        // Calculate role flags directly in SQL for better performance
        isOwner: sql<boolean>`
          CASE WHEN COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END) > 0 THEN true ELSE false END
        `,
        isBuyer: sql<boolean>`
          CASE WHEN COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END) > 0 THEN true ELSE false END
        `,
        isInteresado: sql<boolean>`
          CASE WHEN (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId}) > 0 THEN true ELSE false END
        `,
      })
      .from(contacts)
      .leftJoin(
        listingContacts,
        and(
          eq(contacts.contactId, listingContacts.contactId),
          eq(listingContacts.isActive, true),
        ),
      )
      .leftJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true),
        ),
      )
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(
        contacts.contactId,
        contacts.firstName,
        contacts.lastName,
        contacts.email,
        contacts.phone,
        contacts.additionalInfo,
        contacts.orgId,
        contacts.isActive,
        contacts.createdAt,
        contacts.updatedAt,
      )
      .limit(limit)
      .offset(offset)
      .orderBy(contacts.createdAt);

    const contactIds = uniqueContacts.map((c) => c.contactId);

    // Use the inArray function from drizzle-orm for proper IN clause handling
    const allProspects = await db
      .select({
        contactId: prospects.contactId,
        listingType: prospects.listingType,
        propertyType: prospects.propertyType,
        preferredAreas: prospects.preferredAreas,
        createdAt: prospects.createdAt,
      })
      .from(prospects)
      .where(
        contactIds.length > 0
          ? inArray(prospects.contactId, contactIds)
          : undefined,
      )
      .orderBy(prospects.createdAt);

    // OPTIMIZATION: Batch fetch all listings for all contacts in one query
    const allContactListings = await db
      .select({
        contactId: listingContacts.contactId,
        listingId: listingContacts.listingId,
        contactType: listingContacts.contactType,
        street: properties.street,
        city: locations.city,
        propertyType: properties.propertyType,
        listingType: listings.listingType,
        status: listings.status,
      })
      .from(listingContacts)
      .innerJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true),
        ),
      )
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          contactIds.length > 0
            ? inArray(listingContacts.contactId, contactIds)
            : undefined,
          eq(listingContacts.isActive, true),
        ),
      )
      .orderBy(listingContacts.listingId);

    // Group prospects by contactId for faster lookup
    const prospectsByContact = allProspects.reduce(
      (acc, prospect) => {
        const contactId = prospect.contactId.toString();
        acc[contactId] ??= [];
        acc[contactId].push(prospect);
        return acc;
      },
      {} as Record<string, typeof allProspects>,
    );

    // Group listings by contactId for faster lookup
    const listingsByContact = allContactListings.reduce(
      (acc, listing) => {
        const contactId = listing.contactId.toString();
        acc[contactId] ??= [];
        acc[contactId].push(listing);
        return acc;
      },
      {} as Record<string, typeof allContactListings>,
    );

    // For each contact, process their prospects and listings
    const contactsWithProspects = await Promise.all(
      uniqueContacts.map(async (contact) => {
        const contactId = contact.contactId.toString();
        const contactProspects = prospectsByContact[contactId] ?? [];
        const allContactListings = listingsByContact[contactId] ?? [];
        
        // Filter listings based on the role filter
        let filteredListings = allContactListings;
        if (filters?.roles && filters.roles.length > 0) {
          filteredListings = allContactListings.filter((listing) => {
            return filters.roles!.some((role) => {
              switch (role) {
                case "owner":
                  return listing.contactType === "owner";
                case "buyer":
                  return listing.contactType === "buyer";
                default:
                  return false;
              }
            });
          });
        }

        // Generate titles for prospects (limit to most recent 5 for performance)
        const prospectTitles = await Promise.all(
          contactProspects
            .slice(0, 5) // Limit to 5 most recent prospects
            .map(async (prospect) => {
              const preferredArea = await getPreferredAreaFromProspect(
                prospect as ProspectWithPreferredAreas,
              );

              const title = prospectUtils.generateSimpleProspectTitle(
                prospect.listingType ?? undefined,
                prospect.propertyType ?? undefined,
                preferredArea,
              );

              return title;
            }),
        ).then((titles) => titles.filter((title) => title.trim() !== "")); // Remove empty titles

        const contactData = {
          ...contact,
          prospectTitles, // Now an array of all prospect titles
          prospectCount: contact.prospectCount,
          // Filtered listings based on role context
          allListings: filteredListings,
          // Role flags and counts are now calculated in SQL
          ownerCount: contact.ownerCount,
          buyerCount: contact.buyerCount,
          isOwner: contact.isOwner,
          isBuyer: contact.isBuyer,
          isInteresado: contact.isInteresado,
        };

        return contactData;
      }),
    );

    // Apply role filtering after determining role flags
    let filteredContacts = contactsWithProspects;
    if (filters?.roles && filters.roles.length > 0) {
      filteredContacts = filteredContacts.filter((contact) => {
        // Check if contact has any of the requested roles
        return filters.roles!.some((role) => {
          switch (role) {
            case "owner":
              return contact.isOwner;
            case "buyer":
              // Buyer includes both actual buyers and interested people
              return contact.isBuyer || contact.isInteresado;
            default:
              return false;
          }
        });
      });
    }

    // Apply last contact date filtering
    if (filters?.lastContactFilter && filters.lastContactFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      filteredContacts = filteredContacts.filter((contact) => {
        const lastContactDate = contact.updatedAt; // Using updatedAt as proxy for last contact

        switch (filters.lastContactFilter) {
          case "today":
            return lastContactDate >= today;
          case "week":
            return lastContactDate >= weekAgo;
          case "month":
            return lastContactDate >= monthAgo;
          case "quarter":
            return lastContactDate >= quarterAgo;
          case "year":
            return lastContactDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filteredContacts;
  } catch (error) {
    console.error("Error listing contacts with types:", error);
    throw error;
  }
}

// List all contacts (with pagination and optional filters)
export async function listContacts(
  accountId: number,
  page = 1,
  limit = 10,
  filters?: {
    orgId?: number;
    isActive?: boolean;
  },
) {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.orgId) {
        whereConditions.push(eq(contacts.orgId, BigInt(filters.orgId)));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(contacts.isActive, filters.isActive));
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Always filter by account
    whereConditions.push(eq(contacts.accountId, BigInt(accountId)));

    // Create the base query
    const query = db.select().from(contacts);

    // Apply all where conditions at once
    const filteredQuery =
      whereConditions.length > 0 ? query.where(and(...whereConditions)) : query;

    // Apply pagination and order by most recent first
    const allContacts = await filteredQuery
      .orderBy(sql`${contacts.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return allContacts;
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
}

// Get all potential owners (active contacts)
export async function getAllPotentialOwners(accountId: number) {
  try {
    const owners = await db
      .select({
        id: contacts.contactId,
        name: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      )
      .orderBy(sql`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`);

    return owners;
  } catch (error) {
    console.error("Error fetching potential owners:", error);
    throw error;
  }
}

// Get current owners for a specific listing
export async function getCurrentListingOwners(
  listingId: number,
  accountId: number,
) {
  try {
    const owners = await db
      .select({
        id: contacts.contactId,
        name: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      )
      .orderBy(sql`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`);

    return owners;
  } catch (error) {
    console.error("Error fetching current listing owners:", error);
    throw error;
  }
}

// Update listing owners - replaces all existing owner relationships for a listing
export async function updateListingOwners(
  listingId: number,
  ownerIds: number[],
  accountId: number,
) {
  try {
    // First, verify the listing belongs to this account
    const [listing] = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    // Deactivate all existing owner relationships for this listing
    await db
      .update(listingContacts)
      .set({ isActive: false })
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(listingContacts.contactType, "owner"),
        ),
      );

    // Then, create new active relationships for the selected owners
    if (ownerIds.length > 0) {
      const newRelationships = ownerIds.map((ownerId) => ({
        listingId: BigInt(listingId),
        contactId: BigInt(ownerId),
        contactType: "owner" as const,
        isActive: true,
      }));

      await db.insert(listingContacts).values(newRelationships);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating listing owners:", error);
    throw error;
  }
}

// Get contact by ID with type information for display
export async function getContactByIdWithType(
  contactId: number,
  accountId: number,
) {
  try {
    // First, get the basic contact information
    const [contact] = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        additionalInfo: contacts.additionalInfo,
        orgId: contacts.orgId,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.accountId, BigInt(accountId)),
          eq(contacts.isActive, true),
        ),
      );

    if (!contact) {
      return null;
    }

    // Then, get the role counts separately to avoid complex JOIN issues
    const ownerCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
        ),
      );

    const buyerCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, "buyer"),
          eq(listingContacts.isActive, true),
        ),
      );

    const ownerCount = ownerCountResult[0]?.count ?? 0;
    const buyerCount = buyerCountResult[0]?.count ?? 0;

    // Get prospect count
    const prospectCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(prospects)
      .where(eq(prospects.contactId, BigInt(contactId)));

    const prospectCount = prospectCountResult[0]?.count ?? 0;

    // Get all prospect titles for this contact
    let prospectTitles: string[] = [];
    if (prospectCount > 0) {
      const contactProspects = await db
        .select({
          listingType: prospects.listingType,
          propertyType: prospects.propertyType,
          preferredAreas: prospects.preferredAreas,
          createdAt: prospects.createdAt,
        })
        .from(prospects)
        .where(eq(prospects.contactId, BigInt(contactId)))
        .orderBy(sql`${prospects.createdAt} DESC`);
      prospectTitles = await Promise.all(
        contactProspects.map(async (prospect) => {
          const preferredArea = await getPreferredAreaFromProspect(
            prospect as ProspectWithPreferredAreas,
          );
          const title = prospectUtils.generateSimpleProspectTitle(
            prospect.listingType ?? undefined,
            prospect.propertyType ?? undefined,
            preferredArea,
          );
          return title;
        }),
      ).then((titles) => titles.filter((title) => title.trim() !== ""));
    }

    const result = {
      ...contact,
      prospectTitles, // Now an array of all prospect titles
      // Include role counts and flags for UI consistency
      ownerCount,
      buyerCount,
      prospectCount,
      isOwner: ownerCount > 0,
      isBuyer: buyerCount > 0,
      isInteresado: prospectCount > 0,
    };

    return result;
  } catch (error) {
    console.error("Error fetching contact with type:", error);
    throw error;
  }
}

// Get listings owned by a specific contact
export async function getOwnerListings(
  contactId: number,
  accountId: number,
) {
  try {
    const contactListings = await db
      .select({
        // Listing fields
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        price: listings.price,
        status: listings.status,
        listingType: listings.listingType,
        isActive: listings.isActive,
        isFeatured: listings.isFeatured,
        isBankOwned: listings.isBankOwned,
        viewCount: listings.viewCount,
        inquiryCount: listings.inquiryCount,

        // Property fields
        referenceNumber: properties.referenceNumber,
        title: properties.title,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        street: properties.street,
        addressDetails: properties.addressDetails,
        postalCode: properties.postalCode,
        latitude: properties.latitude,
        longitude: properties.longitude,

        // Location fields
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,

        // Image fields for card display (match ListingOverview/PropertyCard)
        imageUrl: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        s3key: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        imageUrl2: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
        s3key2: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
      })
      .from(listingContacts)
      .innerJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true),
        ),
      )
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
          eq(listings.accountId, BigInt(accountId)),
        ),
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching owner listings:", error);
    throw error;
  }
}

// Get listings where a specific contact is the buyer
export async function getBuyerListings(
  contactId: number,
  accountId: number,
) {
  try {
    const contactListings = await db
      .select({
        // Listing fields
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        price: listings.price,
        status: listings.status,
        listingType: listings.listingType,
        isActive: listings.isActive,
        isFeatured: listings.isFeatured,
        isBankOwned: listings.isBankOwned,
        viewCount: listings.viewCount,
        inquiryCount: listings.inquiryCount,
        agentName: sql<string | null>`(
          SELECT CONCAT(u.first_name, ' ', u.last_name)
          FROM users u
          WHERE u.id = ${listings.agentId}
        )`,

        // Property fields
        referenceNumber: properties.referenceNumber,
        title: properties.title,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        street: properties.street,
        addressDetails: properties.addressDetails,
        postalCode: properties.postalCode,
        latitude: properties.latitude,
        longitude: properties.longitude,

        // Location fields
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,

        // Image fields
        imageUrl: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        s3key: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        imageUrl2: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
        s3key2: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
      })
      .from(listingContacts)
      .innerJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true),
        ),
      )
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, "buyer"),
          eq(listingContacts.isActive, true),
          eq(listings.accountId, BigInt(accountId)),
        ),
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching buyer listings:", error);
    throw error;
  }
}
