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
export async function getContactById(contactId: number) {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
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
export async function getContactsByOrgId(orgId: number) {
  try {
    const orgContacts = await db
      .select()
      .from(contacts)
      .where(
        and(eq(contacts.orgId, BigInt(orgId)), eq(contacts.isActive, true)),
      );
    return orgContacts;
  } catch (error) {
    console.error("Error fetching organization contacts:", error);
    throw error;
  }
}

// Search contacts by name or email
export async function searchContacts(query: string) {
  try {
    const searchResults = await db
      .select()
      .from(contacts)
      .where(
        and(
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
  data: Omit<Partial<Contact>, "contactId" | "createdAt" | "updatedAt">,
) {
  try {
    await db
      .update(contacts)
      .set(data)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true),
        ),
      );
    const [updatedContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, BigInt(contactId)));
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Soft delete contact (set isActive to false)
export async function softDeleteContact(contactId: number) {
  try {
    await db
      .update(contacts)
      .set({ isActive: false })
      .where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting contact:", error);
    throw error;
  }
}

// Hard delete contact (remove from database)
export async function deleteContact(contactId: number) {
  try {
    await db.delete(contacts).where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// List all contact-listing relationships (each contact can appear multiple times)
export async function listContactsWithTypes(
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
        createdAt: listings.createdAt,
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
      .orderBy(listings.createdAt);

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

    // Create the base query
    const query = db.select().from(contacts);

    // Apply all where conditions at once
    const filteredQuery =
      whereConditions.length > 0 ? query.where(and(...whereConditions)) : query;

    // Apply pagination
    const allContacts = await filteredQuery.limit(limit).offset(offset);

    return allContacts;
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
}

// Get all potential owners (active contacts)
export async function getAllPotentialOwners() {
  try {
    const owners = await db
      .select({
        id: contacts.contactId,
        name: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      })
      .from(contacts)
      .where(and(eq(contacts.isActive, true)))
      .orderBy(sql`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`);

    return owners;
  } catch (error) {
    console.error("Error fetching potential owners:", error);
    throw error;
  }
}

// Get current owners for a specific listing
export async function getCurrentListingOwners(listingId: number) {
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
) {
  try {
    // First, deactivate all existing owner relationships for this listing
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
export async function getContactByIdWithType(contactId: number) {
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

    return {
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
  } catch (error) {
    console.error("Error fetching contact with type:", error);
    throw error;
  }
}

// Get listings associated with a specific contact (owner)
export async function getListingsByContact(contactId: number) {
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
        ),
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching listings by contact:", error);
    throw error;
  }
}

// Get listings associated with a specific contact (buyer)
export async function getListingsByContactAsBuyer(contactId: number) {
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
          WHERE u.user_id = ${listings.agentId}
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
        ),
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching listings by contact as buyer:", error);
    throw error;
  }
}
