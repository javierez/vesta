"use server";

import { db } from "../db";
import {
  listings,
  properties,
  locations,
  propertyImages,
  users,
  listingContacts,
  contacts,
  accounts,
  websiteProperties,
} from "../db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import type { Listing } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
// These maintain backward compatibility while adding account filtering

export async function getListingByIdWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return getListingById(listingId, accountId);
}

export async function listListingsWithAuth(
  page = 1,
  limit = 10,
  filters?: Parameters<typeof listListings>[3],
  view?: "grid" | "table",
) {
  const accountId = await getCurrentUserAccountId();
  return listListings(accountId, page, limit, filters, view);
}

export async function listListingsCompactWithAuth(
  filters?: Parameters<typeof listListingsCompact>[1],
) {
  const accountId = await getCurrentUserAccountId();
  return listListingsCompact(accountId, filters);
}

export async function getAllAgentsWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getAllAgents(accountId);
}

export async function getAccountWebsiteWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getAccountWebsite(accountId);
}

export async function updateListingWithAuth(
  listingId: number,
  data: Parameters<typeof updateListing>[2],
) {
  const accountId = await getCurrentUserAccountId();
  return updateListing(listingId, accountId, data);
}

export async function toggleListingKeysWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  
  try {
    // First get the current hasKeys value
    const currentListing = await getListingById(listingId, accountId);
    if (!currentListing) {
      throw new Error("Listing not found");
    }
    
    // Toggle the hasKeys value
    const newHasKeysValue = !currentListing.hasKeys;
    
    // Update the listing
    const updatedListing = await updateListing(listingId, accountId, {
      hasKeys: newHasKeysValue
    });
    
    return {
      hasKeys: newHasKeysValue,
      listing: updatedListing
    };
  } catch (error) {
    console.error("Error toggling listing keys:", error);
    throw error;
  }
}

export async function toggleListingPublishToWebsiteWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  
  try {
    // First get the current publishToWebsite value
    const currentListing = await getListingById(listingId, accountId);
    if (!currentListing) {
      throw new Error("Listing not found");
    }
    
    // Toggle the publishToWebsite value
    const newPublishToWebsiteValue = !currentListing.publishToWebsite;
    
    // Update the listing
    const updatedListing = await updateListing(listingId, accountId, {
      publishToWebsite: newPublishToWebsiteValue
    });
    
    return {
      publishToWebsite: newPublishToWebsiteValue,
      listing: updatedListing
    };
  } catch (error) {
    console.error("Error toggling listing publishToWebsite:", error);
    throw error;
  }
}

export async function getListingDetailsWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    // Fetch directly from database without caching
    const listingDetails = await getListingDetails(listingId, accountId);

    return listingDetails;
  } catch (error) {
    console.error(`Error in getListingDetailsWithAuth:`, error);
    throw error;
  }
}

export async function getDraftListingsWithAuth() {
  const accountId = await getCurrentUserAccountId();
  return getDraftListings(accountId);
}

export async function deleteDraftListingWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteDraftListing(listingId, accountId);
}

// Duplicate listing_contacts from source listing to target listing
export async function duplicateListingContacts(sourceListingId: number, targetListingId: number) {
  try {
    
    // Get all listing_contacts from the source listing
    const sourceContacts = await db
      .select()
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.listingId, BigInt(sourceListingId)),
          eq(listingContacts.isActive, true)
        )
      );
    
    if (sourceContacts.length === 0) {
      console.log("No listing contacts found to duplicate");
      return [];
    }
    
    // Create new listing_contacts for the target listing
    const newContactsData = sourceContacts.map(contact => ({
      listingId: BigInt(targetListingId),
      contactId: contact.contactId,
      contactType: contact.contactType,
      prospectId: contact.prospectId,
      source: contact.source,
      status: contact.status,
      isActive: true,
    }));
    
    // Insert the new listing_contacts
    const results = await db
      .insert(listingContacts)
      .values(newContactsData)
      .$returningId();
    
    console.log(`Duplicated ${results.length} listing contacts from listing ${sourceListingId} to ${targetListingId}`);
    return results;
  } catch (error) {
    console.error("Error duplicating listing contacts:", error);
    throw error;
  }
}

// Create a new listing
export async function createListing(
  data: Omit<Listing, "listingId" | "createdAt" | "updatedAt">,
) {
  try {
    const accountId = await getCurrentUserAccountId();
    const [result] = await db
      .insert(listings)
      .values({
        accountId: BigInt(accountId),
        propertyId: data.propertyId,
        agentId: data.agentId,
        listingType: data.listingType,
        price: data.price,
        status: data.status,
        isFeatured: data.isFeatured,
        isBankOwned: data.isBankOwned,
        publishToWebsite: data.publishToWebsite,
        visibilityMode: data.visibilityMode,
        isFurnished: data.isFurnished,
        furnitureQuality: data.furnitureQuality,
        optionalGarage: data.optionalGarage,
        optionalGaragePrice: data.optionalGaragePrice,
        optionalStorageRoom: data.optionalStorageRoom,
        optionalStorageRoomPrice: data.optionalStorageRoomPrice,
        hasKeys: data.hasKeys,
        studentFriendly: data.studentFriendly,
        petsAllowed: data.petsAllowed,
        appliancesIncluded: data.appliancesIncluded,
        internet: data.internet,
        oven: data.oven,
        microwave: data.microwave,
        washingMachine: data.washingMachine,
        fridge: data.fridge,
        tv: data.tv,
        stoneware: data.stoneware,
        fotocasa: data.fotocasa,
        idealista: data.idealista,
        habitaclia: data.habitaclia,
        pisoscom: data.pisoscom,
        yaencontre: data.yaencontre,
        milanuncios: data.milanuncios,
        isActive: true,
        viewCount: 0,
        inquiryCount: 0,
      })
      .$returningId();
    if (!result) throw new Error("Failed to create listing");
    const [newListing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(result.listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );
    return newListing;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
}

// Get listing by ID
export async function getListingById(listingId: number, accountId: number) {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );
    return listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
}

// Get listings by property ID
export async function getListingsByPropertyId(
  propertyId: number,
  accountId: number,
) {
  try {
    const propertyListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.propertyId, BigInt(propertyId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );
    return propertyListings;
  } catch (error) {
    console.error("Error fetching property listings:", error);
    throw error;
  }
}

// Get listings by agent ID
export async function getListingsByAgentId(agentId: string, accountId: number) {
  try {
    const agentListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.agentId, agentId),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );
    return agentListings;
  } catch (error) {
    console.error("Error fetching agent listings:", error);
    throw error;
  }
}

// Update listing
export async function updateListing(
  listingId: number,
  accountId: number,
  data: Omit<Partial<Listing>, "listingId" | "createdAt" | "updatedAt">,
) {
  try {
    await db
      .update(listings)
      .set(data)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );
    const [updatedListing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );
    return updatedListing;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
}

// Soft delete listing (set isActive to false)
export async function softDeleteListing(listingId: number, accountId: number) {
  try {
    await db
      .update(listings)
      .set({ isActive: false })
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting listing:", error);
    throw error;
  }
}

// Hard delete listing (remove from database)
export async function deleteListing(listingId: number, accountId: number) {
  try {
    await db
      .delete(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );
    return { success: true };
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
}

// List all listings (with pagination and optional filters)
export async function listListings(
  accountId: number,
  page = 1,
  limit = 10,
  filters?: {
    status?: "En Venta" | "En Alquiler" | "Vendido" | "Alquilado" | "Descartado" | "Draft";
    listingType?: "Sale" | "Rent";
    agentId?: string[];
    propertyId?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isBankOwned?: boolean;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string[];
    propertySubtype?: string[];
    bedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minSquareMeter?: number;
    maxSquareMeter?: number;
    city?: string;
    province?: string;
    municipality?: string;
    neighborhood?: string;
    hasGarage?: boolean;
    hasElevator?: boolean;
    hasStorageRoom?: boolean;
    brandNew?: boolean;
    needsRenovation?: boolean;
    searchQuery?: string;
  },
  view?: "grid" | "table",
) {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        // Properly format the status values for SQL IN clause
        const statusList = filters.status.map(s => `'${s}'`).join(',');
        whereConditions.push(sql`${listings.status} IN (${sql.raw(statusList)})`);
      }
      if (filters.listingType && Array.isArray(filters.listingType) && filters.listingType.length > 0) {
        // Properly format the listing types for SQL IN clause
        const typeList = filters.listingType.map(t => `'${t}'`).join(',');
        whereConditions.push(
          sql`${listings.listingType} IN (${sql.raw(typeList)})`,
        );
      }
      if (filters.agentId && filters.agentId.length > 0) {
        // Properly format the agent IDs for SQL IN clause
        const agentList = filters.agentId.map(id => `'${id}'`).join(',');
        whereConditions.push(sql`${listings.agentId} IN (${sql.raw(agentList)})`);
      }
      if (filters.propertyId) {
        whereConditions.push(
          eq(listings.propertyId, BigInt(filters.propertyId)),
        );
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(listings.isActive, filters.isActive));
      }
      if (filters.isFeatured !== undefined) {
        whereConditions.push(eq(listings.isFeatured, filters.isFeatured));
      }
      if (filters.isBankOwned !== undefined) {
        whereConditions.push(eq(listings.isBankOwned, filters.isBankOwned));
      }
      if (filters.minPrice) {
        whereConditions.push(
          sql`CAST(${listings.price} AS DECIMAL) >= ${filters.minPrice}`,
        );
      }
      if (filters.maxPrice) {
        whereConditions.push(
          sql`CAST(${listings.price} AS DECIMAL) <= ${filters.maxPrice}`,
        );
      }
      if (filters.propertyType && filters.propertyType.length > 0) {
        // Properly format the property types for SQL IN clause
        const propTypeList = filters.propertyType.map(t => `'${t}'`).join(',');
        whereConditions.push(
          sql`${properties.propertyType} IN (${sql.raw(propTypeList)})`,
        );
      }
      if (filters.propertySubtype && filters.propertySubtype.length > 0) {
        // Properly format the property subtypes for SQL IN clause
        const subTypeList = filters.propertySubtype.map(t => `'${t}'`).join(',');
        whereConditions.push(
          sql`${properties.propertySubtype} IN (${sql.raw(subTypeList)})`,
        );
      }
      if (filters.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }
      if (filters.minBathrooms) {
        whereConditions.push(
          sql`CAST(${properties.bathrooms} AS DECIMAL) >= ${filters.minBathrooms}`,
        );
      }
      if (filters.maxBathrooms) {
        whereConditions.push(
          sql`CAST(${properties.bathrooms} AS DECIMAL) <= ${filters.maxBathrooms}`,
        );
      }
      if (filters.minSquareMeter) {
        whereConditions.push(
          sql`${properties.squareMeter} >= ${filters.minSquareMeter}`,
        );
      }
      if (filters.maxSquareMeter) {
        whereConditions.push(
          sql`${properties.squareMeter} <= ${filters.maxSquareMeter}`,
        );
      }
      if (filters.city) {
        whereConditions.push(eq(locations.city, filters.city));
      }
      if (filters.province) {
        whereConditions.push(eq(locations.province, filters.province));
      }
      if (filters.municipality) {
        whereConditions.push(eq(locations.municipality, filters.municipality));
      }
      if (filters.neighborhood) {
        whereConditions.push(eq(locations.neighborhood, filters.neighborhood));
      }
      if (filters.hasGarage !== undefined) {
        whereConditions.push(eq(properties.hasGarage, filters.hasGarage));
      }
      if (filters.hasElevator !== undefined) {
        whereConditions.push(eq(properties.hasElevator, filters.hasElevator));
      }
      if (filters.hasStorageRoom !== undefined) {
        whereConditions.push(
          eq(properties.hasStorageRoom, filters.hasStorageRoom),
        );
      }
      if (filters.brandNew !== undefined) {
        whereConditions.push(eq(properties.brandNew, filters.brandNew));
      }
      if (filters.needsRenovation !== undefined) {
        whereConditions.push(
          eq(properties.needsRenovation, filters.needsRenovation),
        );
      }
      if (filters.searchQuery) {
        whereConditions.push(
          sql`(
            ${properties.title} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.referenceNumber} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.street} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.city} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.province} LIKE ${`%${filters.searchQuery}%`}
          )`,
        );
      }
    } else {
      // By default, only show active listings
      whereConditions.push(eq(listings.isActive, true));
    }

    // Default status filter: if no status filter is explicitly provided, show only En Venta and En Alquiler
    if (!filters?.status) {
      whereConditions.push(sql`${listings.status} IN ('En Venta', 'En Alquiler')`);
    }

    // Always filter for non-Draft status listings and account
    whereConditions.push(ne(listings.status, "Draft"));
    whereConditions.push(eq(listings.accountId, BigInt(accountId)));

    // Optimized query based on view type with JOINs instead of subqueries
    const query =
      view === "table"
        ? db.select({
            // Table view: optimized fields
            listingId: listings.listingId,
            agentName: users.name,
            price: listings.price,
            listingType: listings.listingType,
            status: listings.status,
            referenceNumber: properties.referenceNumber,
            title: properties.title,
            propertyType: properties.propertyType,
            bedrooms: properties.bedrooms,
            bathrooms: properties.bathrooms,
            squareMeter: properties.squareMeter,
            city: locations.city,
            imageUrl: sql<string>`img1.image_url`,
            ownerId: sql<bigint | null>`owner_contact.contact_id`,
            ownerName: sql<string>`CONCAT(owner_contact.first_name, ' ', owner_contact.last_name)`,
            ownerPhone: sql<string | null>`owner_contact.phone`,
            ownerEmail: sql<string | null>`owner_contact.email`,
          })
        : db.select({
            // Grid view: optimized fields
            listingId: listings.listingId,
            propertyId: listings.propertyId,
            agentName: users.name,
            price: listings.price,
            listingType: listings.listingType,
            status: listings.status,
            isBankOwned: listings.isBankOwned,
            referenceNumber: properties.referenceNumber,
            propertyType: properties.propertyType,
            bedrooms: properties.bedrooms,
            bathrooms: properties.bathrooms,
            squareMeter: properties.squareMeter,
            street: properties.street,
            city: locations.city,
            province: locations.province,
            imageUrl: sql<string>`img1.image_url`,
            imageUrl2: sql<string>`img2.image_url`,
          });

    const baseQuery = query
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(users, eq(listings.agentId, users.id))
      .leftJoin(
        sql`(
          SELECT
            property_id,
            image_url,
            ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY image_order ASC) as rn
          FROM property_images
          WHERE is_active = true
            AND (image_tag IS NULL OR image_tag NOT IN ('video', 'youtube', 'tour'))
        ) img1`,
        sql`img1.property_id = ${properties.propertyId} AND img1.rn = 1`
      )
      .leftJoin(
        sql`(
          SELECT
            property_id,
            image_url,
            ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY image_order ASC) as rn
          FROM property_images
          WHERE is_active = true
            AND (image_tag IS NULL OR image_tag NOT IN ('video', 'youtube', 'tour'))
        ) img2`,
        sql`img2.property_id = ${properties.propertyId} AND img2.rn = 2`
      )
      .leftJoin(
        sql`(
          SELECT 
            lc.listing_id,
            c.contact_id,
            c.first_name,
            c.last_name,
            c.phone,
            c.email,
            ROW_NUMBER() OVER (PARTITION BY lc.listing_id ORDER BY lc.created_at ASC) as rn
          FROM listing_contacts lc
          JOIN contacts c ON lc.contact_id = c.contact_id
          WHERE lc.contact_type = 'owner' AND lc.is_active = true AND c.is_active = true
        ) owner_contact`,
        sql`owner_contact.listing_id = ${listings.listingId} AND owner_contact.rn = 1`
      );

    // Get total count for pagination (simplified, no need for image/owner JOINs for count)
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(users, eq(listings.agentId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const count = countResult[0]?.count ?? 0;

    // If no results found, return empty result set
    if (count === 0) {
      console.log("No listings found with current filters");
      return {
        listings: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Apply all where conditions at once
    const filteredQuery =
      whereConditions.length > 0
        ? baseQuery.where(and(...whereConditions))
        : baseQuery;

    // Apply pagination and sorting
    const allListings = await filteredQuery
      .orderBy(sql`${properties.updatedAt} DESC`)
      .limit(limit)
      .offset(offset);

    return {
      listings: allListings,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error listing listings:", error);
    // Return empty result set on error
    return {
      listings: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

// Compact version of listListings for contact form - returns only essential fields
export async function listListingsCompact(
  accountId: number,
  filters?: {
    status?: "En Venta" | "En Alquiler" | "Vendido" | "Alquilado" | "Descartado" | "Draft";
    listingType?: "Sale" | "Rent";
    propertyType?: string[];
    searchQuery?: string;
    page?: number;
    limit?: number;
  },
) {
  try {
    // Build the where conditions array
    const whereConditions = [];

    if (filters) {
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        // Properly format the status values for SQL IN clause
        const statusList = filters.status.map(s => `'${s}'`).join(',');
        whereConditions.push(sql`${listings.status} IN (${sql.raw(statusList)})`);
      }
      if (filters.listingType && Array.isArray(filters.listingType) && filters.listingType.length > 0) {
        // Properly format the listing types for SQL IN clause
        const typeList = filters.listingType.map(t => `'${t}'`).join(',');
        whereConditions.push(
          sql`${listings.listingType} IN (${sql.raw(typeList)})`,
        );
      }
      if (filters.propertyType && filters.propertyType.length > 0) {
        // Properly format the property types for SQL IN clause
        const propTypeList = filters.propertyType.map(t => `'${t}'`).join(',');
        whereConditions.push(
          sql`${properties.propertyType} IN (${sql.raw(propTypeList)})`,
        );
      }
      if (filters.searchQuery) {
        whereConditions.push(
          sql`(
            ${properties.title} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.referenceNumber} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.street} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.city} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.province} LIKE ${`%${filters.searchQuery}%`}
          )`,
        );
      }
    }

    // Always show active listings only for this account, excluding Draft, Sold, and Rented
    whereConditions.push(eq(listings.isActive, true));
    whereConditions.push(
      sql`${listings.status} NOT IN ('Draft', 'Sold', 'Rented')`,
    );
    whereConditions.push(eq(listings.accountId, BigInt(accountId)));

    // Create the compact query with only essential fields
    const query = db
      .select({
        listingId: listings.listingId,
        title: properties.title,
        referenceNumber: properties.referenceNumber,
        price: listings.price,
        listingType: listings.listingType,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        city: locations.city,
        agentName: users.name,
        isOwned: sql<boolean>`CASE WHEN ${listingContacts.contactId} IS NOT NULL THEN true ELSE false END`,
        imageUrl: propertyImages.imageUrl,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(users, eq(listings.agentId, users.id))
      .leftJoin(
        listingContacts,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
        ),
      )
      .leftJoin(
        propertyImages,
        and(
          eq(propertyImages.propertyId, properties.propertyId),
          eq(propertyImages.isActive, true),
          eq(propertyImages.imageOrder, 1),
          // Only get actual images, not videos, YouTube links, or virtual tours
          sql`(${propertyImages.imageTag} IS NULL OR ${propertyImages.imageTag} NOT IN ('video', 'youtube', 'tour'))`
        ),
      );

    // Apply where conditions
    const filteredQuery =
      whereConditions.length > 0 ? query.where(and(...whereConditions)) : query;

    // Apply pagination if provided
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 100; // Default to 100 if not specified
    const offset = (page - 1) * limit;

    // Get all listings ordered by featured first, then by creation date
    const compactListings = await filteredQuery
      .orderBy(sql`${listings.isFeatured} DESC, ${listings.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return compactListings;
  } catch (error) {
    console.error("Error listing compact listings:", error);
    return [];
  }
}

// Get all active agents for an account
export async function getAllAgents(accountId: number) {
  try {
    const agents = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(
        and(eq(users.accountId, BigInt(accountId)), eq(users.isActive, true)),
      )
      .orderBy(users.name);

    return agents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
}

export async function getAccountWebsite(accountId: number) {
  try {
    const account = await db
      .select({
        website: accounts.website,
      })
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)))
      .limit(1);

    return account[0]?.website ?? null;
  } catch (error) {
    console.error("Error fetching account website:", error);
    throw error;
  }
}

// Get detailed listing information including all related data
// This query is optimized for the property characteristics form
export async function getListingDetails(listingId: number, accountId: number) {
  try {

    const [listingDetails] = await db
      .select({
        // Listing fields - All needed for form
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        agentId: listings.agentId,
        listingType: listings.listingType,
        price: listings.price,
        status: listings.status,
        isFurnished: listings.isFurnished,
        furnitureQuality: listings.furnitureQuality,
        optionalGarage: listings.optionalGarage,
        optionalGaragePrice: listings.optionalGaragePrice,
        optionalStorageRoom: listings.optionalStorageRoom,
        optionalStorageRoomPrice: listings.optionalStorageRoomPrice,
        hasKeys: listings.hasKeys,
        studentFriendly: listings.studentFriendly,
        petsAllowed: listings.petsAllowed,
        appliancesIncluded: listings.appliancesIncluded,
        internet: listings.internet,
        oven: listings.oven,
        microwave: listings.microwave,
        washingMachine: listings.washingMachine,
        fridge: listings.fridge,
        tv: listings.tv,
        stoneware: listings.stoneware,
        fotocasa: listings.fotocasa,
        idealista: listings.idealista,
        habitaclia: listings.habitaclia,
        pisoscom: listings.pisoscom,
        yaencontre: listings.yaencontre,
        milanuncios: listings.milanuncios,
        isFeatured: listings.isFeatured,
        isBankOwned: listings.isBankOwned,
        publishToWebsite: listings.publishToWebsite,
        visibilityMode: listings.visibilityMode,
        isActive: listings.isActive,
        viewCount: listings.viewCount,
        inquiryCount: listings.inquiryCount,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        
        // Listing descriptions - From listings table
        description: listings.description,
        shortDescription: listings.shortDescription,

        // Property fields - All needed for comprehensive form
        referenceNumber: properties.referenceNumber,
        title: properties.title,
        propertyType: properties.propertyType,
        propertySubtype: properties.propertySubtype,
        formPosition: properties.formPosition,
        
        // Details from second page - Map form fields to database fields
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        totalSurface: properties.squareMeter, // Form uses totalSurface, DB has squareMeter
        usefulSurface: properties.builtSurfaceArea, // Form uses usefulSurface, DB has builtSurfaceArea  
        plotSurface: sql<number>`NULL`, // Not in properties table yet
        floor: sql<string>`NULL`, // Not in properties table yet  
        totalFloors: properties.buildingFloors, // Form uses totalFloors, DB has buildingFloors
        buildYear: properties.yearBuilt, // Form uses buildYear, DB has yearBuilt
        condition: properties.conservationStatus, // Form uses condition, DB has conservationStatus
        energyCertificate: properties.energyConsumptionScale, // Form uses energyCertificate, DB has energyConsumptionScale
        emissions: properties.emissionsScale, // Form uses emissions, DB has emissionsScale
        cadastralReference: properties.cadastralReference,
        
        // Address from third page - Map form fields to database fields
        address: properties.street, // Form uses address, DB has street
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        postalCode: properties.postalCode,
        neighborhood: locations.neighborhood,
        latitude: properties.latitude,
        longitude: properties.longitude,
        
        // Equipment from fourth page - Map form fields to database fields
        heating: properties.heatingType, // Form uses heating, DB has heatingType
        airConditioning: properties.airConditioningType, // Form uses airConditioning, DB has airConditioningType
        hasElevator: properties.hasElevator,
        hasGarage: properties.hasGarage,
        hasStorageRoom: properties.hasStorageRoom,
        hasGarden: properties.garden, // Form uses hasGarden, DB has garden
        hasSwimmingPool: sql<boolean>`(${properties.pool} OR ${properties.communityPool} OR ${properties.privatePool})`, // Form uses hasSwimmingPool, DB has multiple pool fields
        hasTerrace: properties.terrace, // Form uses hasTerrace, DB has terrace
        hasBalcony: sql<boolean>`(${properties.balconyCount} > 0)`, // Form uses hasBalcony, DB has balconyCount
        
        // Orientation from fifth page  
        orientation: properties.orientation,
        views: properties.views,
        luminosity: properties.bright, // Form uses luminosity, DB has bright
        
        // Additional from sixth page - Map form fields to database fields
        accessibility: properties.disabledAccessible, // Form uses accessibility, DB has disabledAccessible
        securitySystem: sql<boolean>`(${properties.alarm} OR ${properties.securityDoor})`, // Form uses securitySystem, DB has multiple security fields
        doorman: properties.conciergeService, // Form uses doorman, DB has conciergeService
        builtInWardrobes: properties.builtInWardrobes,
        
        // Luxury from seventh page - Map form fields to database fields
        designerKitchen: properties.furnishedKitchen, // Form uses designerKitchen, DB has furnishedKitchen
        smartHome: properties.homeAutomation, // Form uses smartHome, DB has homeAutomation
        
        // Spaces from eighth page - Map form fields to database fields
        hasAttic: sql<boolean>`NULL`, // Not in properties table
        hasBasement: sql<boolean>`NULL`, // Not in properties table
        hasLaundryRoom: properties.laundryRoom, // Form uses hasLaundryRoom, DB has laundryRoom
        hasOffice: sql<boolean>`NULL`, // Not in properties table
        hasDressingRoom: sql<boolean>`NULL`, // Not in properties table
        
        // Materials from ninth page - Map form fields to database fields
        floorMaterial: properties.mainFloorType, // Form uses floorMaterial, DB has mainFloorType
        wallMaterial: sql<string>`NULL`, // Not in properties table
        kitchenMaterial: properties.kitchenType, // Form uses kitchenMaterial, DB has kitchenType
        bathroomMaterial: sql<string>`NULL`, // Not in properties table
        
        // Description from description page
        highlights: sql<string>`NULL`, // Not in properties table
        
        // Legacy fields for backward compatibility
        yearBuilt: properties.yearBuilt,
        squareMeter: properties.squareMeter,
        builtSurfaceArea: properties.builtSurfaceArea,
        street: properties.street,
        addressDetails: properties.addressDetails,
        neighborhoodId: properties.neighborhoodId,
        energyCertification: properties.energyCertification,
        energyCertificateStatus: properties.energyCertificateStatus,
        energyConsumptionScale: properties.energyConsumptionScale,
        energyConsumptionValue: properties.energyConsumptionValue,
        emissionsScale: properties.emissionsScale,
        emissionsValue: properties.emissionsValue,
        hasHeating: properties.hasHeating,
        garageType: properties.garageType,
        garageSpaces: properties.garageSpaces,
        garageInBuilding: properties.garageInBuilding,
        elevatorToGarage: properties.elevatorToGarage,
        garageNumber: properties.garageNumber,
        vpo: properties.vpo,
        videoIntercom: properties.videoIntercom,
        securityGuard: properties.securityGuard,
        satelliteDish: properties.satelliteDish,
        doubleGlazing: properties.doubleGlazing,
        brandNew: properties.brandNew,
        newConstruction: properties.newConstruction,
        underConstruction: properties.underConstruction,
        needsRenovation: properties.needsRenovation,
        lastRenovationYear: properties.lastRenovationYear,
        hotWaterType: properties.hotWaterType,
        openKitchen: properties.openKitchen,
        frenchKitchen: properties.frenchKitchen,
        furnishedKitchen: properties.furnishedKitchen,
        pantry: properties.pantry,
        storageRoomSize: properties.storageRoomSize,
        storageRoomNumber: properties.storageRoomNumber,
        terraceSize: properties.terraceSize,
        wineCellar: properties.wineCellar,
        wineCellarSize: properties.wineCellarSize,
        livingRoomSize: properties.livingRoomSize,
        balconyCount: properties.balconyCount,
        galleryCount: properties.galleryCount,
        buildingFloors: properties.buildingFloors,
        shutterType: properties.shutterType,
        carpentryType: properties.carpentryType,
        airConditioningType: properties.airConditioningType,
        windowType: properties.windowType,
        exterior: properties.exterior,
        bright: properties.bright,
        mountainViews: properties.mountainViews,
        seaViews: properties.seaViews,
        beachfront: properties.beachfront,
        jacuzzi: properties.jacuzzi,
        hydromassage: properties.hydromassage,
        garden: properties.garden,
        pool: properties.pool,
        musicSystem: properties.musicSystem,
        coveredClothesline: properties.coveredClothesline,
        fireplace: properties.fireplace,
        gym: properties.gym,
        sportsArea: properties.sportsArea,
        childrenArea: properties.childrenArea,
        suiteBathroom: properties.suiteBathroom,
        nearbyPublicTransport: properties.nearbyPublicTransport,
        tennisCourt: properties.tennisCourt,

        // Agent information - optimized to only needed fields
        agent: {
          id: users.id,
          name: users.name,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          image: users.image,
        },

        // Owner information - optimized with JOIN
        owner: sql<string>`CONCAT(owner_contact.first_name, ' ', owner_contact.last_name)`,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(users, eq(listings.agentId, users.id))
      .leftJoin(
        sql`(
          SELECT 
            lc.listing_id,
            c.first_name,
            c.last_name,
            ROW_NUMBER() OVER (PARTITION BY lc.listing_id ORDER BY lc.created_at ASC) as rn
          FROM listing_contacts lc
          JOIN contacts c ON lc.contact_id = c.contact_id
          WHERE lc.contact_type = 'owner' AND lc.is_active = true AND c.is_active = true
        ) owner_contact`,
        sql`owner_contact.listing_id = ${listings.listingId} AND owner_contact.rn = 1`
      )
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!listingDetails) {
      throw new Error("Listing not found");
    }

    return listingDetails;
  } catch (error) {
    console.error("Error fetching listing details:", error);
    throw error;
  }
}

// Create a default listing for a newly created property
export async function createDefaultListing(propertyId: number) {
  try {
    const accountId = await getCurrentUserAccountId();
    const listingData = {
      accountId: BigInt(accountId),
      propertyId: BigInt(propertyId),
      agentId: "1", // Default agent ID
      listingType: "Sale" as const,
      price: "0", // Default price as string (decimal type)
      status: "Draft" as const, // Set as draft when created - will be activated when form is completed
      // All other fields will be null/undefined by default
    };

    const [result] = await db
      .insert(listings)
      .values(listingData)
      .$returningId();
    if (!result) throw new Error("Failed to create default listing");

    const [newListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.listingId, BigInt(result.listingId)));

    return newListing;
  } catch (error) {
    console.error("Error creating default listing:", error);
    throw error;
  }
}

// Get draft listings with property and location information
export async function getDraftListings(accountId: number) {
  try {
    const draftListings = await db
      .select({
        listingId: listings.listingId,
        street: properties.street,
        city: locations.city,
        title: properties.title,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.status, "Draft"),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      )
      .orderBy(listings.createdAt);

    return draftListings;
  } catch (error) {
    console.error("Error fetching draft listings:", error);
    throw error;
  }
}

// Delete a draft listing
export async function deleteDraftListing(listingId: number, accountId: number) {
  try {
    // First verify it's actually a draft and belongs to this account
    const [draft] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.status, "Draft"),
          eq(listings.isActive, true),
        ),
      );

    if (!draft) {
      throw new Error("Draft listing not found or not a draft");
    }

    // Delete the draft listing
    await db
      .delete(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    return { success: true, message: "Borrador eliminado correctamente" };
  } catch (error) {
    console.error("Error deleting draft listing:", error);
    throw error;
  }
}

// Discard listing - sets status to "Descartado", keeps all data intact
export async function discardListingWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return discardListing(listingId, accountId);
}

export async function discardListing(listingId: number, accountId: number) {
  try {
    // First verify the listing belongs to this account
    const [listing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    // Update the listing status to "Descartado"
    await db
      .update(listings)
      .set({ status: "Descartado" })
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    return { 
      success: true, 
      message: "Anuncio descartado correctamente. Puedes reactivarlo más tarde si es necesario."
    };
  } catch (error) {
    console.error("Error discarding listing:", error);
    throw error;
  }
}

// Recover listing - sets status back to active based on listing type
export async function recoverListingWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return recoverListing(listingId, accountId);
}

export async function recoverListing(listingId: number, accountId: number) {
  try {
    // First verify the listing belongs to this account and get its type
    const [listing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    // Determine the appropriate active status based on listing type
    let newStatus: string;
    const listingType = listing.listingType;
    
    if (listingType === "Rent" || listingType === "RentWithOption" || listingType === "RoomSharing") {
      newStatus = "En Alquiler";
    } else if (listingType === "Sale" || listingType === "Transfer") {
      newStatus = "En Venta";
    } else {
      // Fallback - use En Venta as default
      newStatus = "En Venta";
    }

    // Update the listing status to the appropriate active status
    await db
      .update(listings)
      .set({ status: newStatus })
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    return { 
      success: true, 
      message: `Anuncio recuperado correctamente. Estado cambiado a "${newStatus}".`
    };
  } catch (error) {
    console.error("Error recovering listing:", error);
    throw error;
  }
}

// Delete listing only - deletes listing and associated contacts, keeps property intact
export async function deleteListingWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteListingOnly(listingId, accountId);
}

export async function deleteListingOnly(listingId: number, accountId: number) {
  try {
    // First verify the listing belongs to this account
    const [listing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    // 1. Delete listing_contacts for this listing
    await db
      .delete(listingContacts)
      .where(eq(listingContacts.listingId, BigInt(listingId)));

    // 2. Delete the listing itself
    await db
      .delete(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    return { 
      success: true, 
      message: "Anuncio eliminado correctamente. La propiedad se mantiene intacta."
    };
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
}

// Complete property deletion - deletes property and all related data
export async function deletePropertyWithAuth(propertyId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteProperty(propertyId, accountId);
}

export async function deleteProperty(propertyId: number, accountId: number) {
  try {
    // First verify the property belongs to this account
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(propertyId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    // Get all listings for this property to get their IDs
    const propertyListings = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .where(
        and(
          eq(listings.propertyId, BigInt(propertyId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    // Start transaction-like cleanup (SingleStore doesn't support full transactions)
    
    // 1. Delete listing_contacts for all listings of this property
    if (propertyListings.length > 0) {
      const listingIds = propertyListings.map(l => l.listingId);
      
      for (const listingId of listingIds) {
        await db
          .delete(listingContacts)
          .where(eq(listingContacts.listingId, listingId));
      }
    }

    // 2. Delete all property_images for this property
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.propertyId, BigInt(propertyId)));

    // 3. Delete all listings for this property
    await db
      .delete(listings)
      .where(
        and(
          eq(listings.propertyId, BigInt(propertyId)),
          eq(listings.accountId, BigInt(accountId)),
        ),
      );

    // 4. Finally delete the property itself
    await db
      .delete(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(propertyId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    return { 
      success: true, 
      message: "Propiedad y todos sus datos relacionados eliminados correctamente",
      deletedListings: propertyListings.length
    };
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
}

// Lightweight query for PropertyBreadcrumb component
export async function getListingBreadcrumbData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [breadcrumbData] = await db
      .select({
        propertyType: properties.propertyType,
        street: properties.street,
        referenceNumber: properties.referenceNumber,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!breadcrumbData) {
      throw new Error("Listing not found");
    }

    return breadcrumbData;
  } catch (error) {
    console.error("Error fetching listing breadcrumb data:", error);
    throw error;
  }
}

// Ultra-lightweight query for PropertyHeader component - only fields actually used
export async function getListingHeaderData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [headerData] = await db
      .select({
        // Fields actually displayed in PropertyHeader + listingId for breadcrumb
        title: properties.title,
        propertyId: listings.propertyId,
        listingId: listings.listingId,
        street: properties.street,
        city: locations.city,
        province: locations.province,
        postalCode: properties.postalCode,
        price: listings.price,
        listingType: listings.listingType,
        status: listings.status,
        isBankOwned: listings.isBankOwned,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!headerData) {
      throw new Error("Listing not found");
    }

    return headerData;
  } catch (error) {
    console.error("Error fetching listing header data:", error);
    throw error;
  }
}

// Optimized query for PropertyTabs component - only fields needed by tabs
export async function getListingTabsData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [tabsData] = await db
      .select({
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        propertyType: properties.propertyType,
        street: properties.street,
        city: locations.city,
        province: locations.province,
        postalCode: properties.postalCode,
        referenceNumber: properties.referenceNumber,
        price: listings.price,
        listingType: listings.listingType,
        isBankOwned: listings.isBankOwned,
        isFeatured: listings.isFeatured,
        neighborhood: locations.neighborhood,
        title: properties.title,
        fotocasa: listings.fotocasa,
        idealista: listings.idealista,
        habitaclia: listings.habitaclia,
        milanuncios: listings.milanuncios,
        fotocasaProps: listings.fotocasaProps,
        idealistaProps: listings.idealistaProps,
        habitacliaProps: listings.habitacliaProps,
        milanunciosProps: listings.milanunciosProps,
        energyCertification: properties.energyCertification,
        agentId: listings.agentId,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!tabsData) {
      throw new Error("Listing not found");
    }

    return tabsData;
  } catch (error) {
    console.error("Error fetching listing tabs data:", error);
    throw error;
  }
}

// Ultra-lightweight query for DocumentsPage component - only fields needed for document management
export async function getListingDocumentsData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [documentsData] = await db
      .select({
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        referenceNumber: properties.referenceNumber,
        street: properties.street,
        city: locations.city,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!documentsData) {
      throw new Error("Listing not found");
    }

    return documentsData;
  } catch (error) {
    console.error("Error fetching listing documents data:", error);
    throw error;
  }
}

// Ultra-lightweight query for CartelEditor component - only listing type and property type needed
export async function getListingCartelData(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  console.log("📊 [getListingCartelData] Starting fetch for:", {
    listingId,
    accountId,
  });

  try {
    const [cartelData] = await db
      .select({
        listingType: listings.listingType,
        propertyType: properties.propertyType,
        city: locations.city,
        neighborhood: locations.neighborhood,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        contactProps: websiteProperties.contactProps,
        watermarkProps: websiteProperties.watermarkProps,
        logoUrl: websiteProperties.logo,
        website: accounts.website,
        preferences: accounts.preferences,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
      .leftJoin(accounts, eq(listings.accountId, accounts.accountId))
      .leftJoin(websiteProperties, eq(accounts.accountId, websiteProperties.accountId))
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );
      
    console.log("📊 [getListingCartelData] Raw query result:", {
      hasCartelData: !!cartelData,
      contactPropsRaw: cartelData?.contactProps,
      contactPropsType: typeof cartelData?.contactProps,
      contactPropsLength: cartelData?.contactProps?.length,
      contactPropsFirstChars: cartelData?.contactProps?.substring?.(0, 100),
      website: cartelData?.website,
    });

    if (!cartelData) {
      throw new Error("Listing not found");
    }

    return cartelData;
  } catch (error) {
    console.error("Error fetching listing cartel data:", error);
    throw error;
  }
}

// Lightweight query for Guardar Cartel functionality - only essential IDs and reference
export async function getListingCartelSaveData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [cartelSaveData] = await db
      .select({
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        referenceNumber: properties.referenceNumber,
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!cartelSaveData) {
      throw new Error("Listing not found");
    }

    return cartelSaveData;
  } catch (error) {
    console.error("Error fetching listing cartel save data:", error);
    throw error;
  }
}

// Get listing contacts by listingId - returns contactId and name for pre-populating forms
export async function getListingContactsByIdWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  
  console.log("🔍 [getListingContactsByIdWithAuth] Starting query with:", {
    listingId,
    accountId,
    bigIntListingId: BigInt(listingId),
    bigIntAccountId: BigInt(accountId)
  });
  
  try {
    const contactsData = await db
      .select({
        contactId: listingContacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(listingContacts.isActive, true),
          eq(contacts.isActive, true),
          eq(contacts.accountId, BigInt(accountId))
        ),
      );

    console.log("📋 [getListingContactsByIdWithAuth] Query result:", {
      count: contactsData.length,
      contacts: contactsData
    });

    return contactsData;
  } catch (error) {
    console.error("❌ [getListingContactsByIdWithAuth] Error fetching listing contacts:", error);
    throw error;
  }
}
