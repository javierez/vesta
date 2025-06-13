'use server'

import { db } from "../db"
import { listings, properties, locations, propertyImages, users, contacts, listingContacts } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Listing } from "../../lib/data";

// Create a new listing
export async function createListing(data: Omit<Listing, "listingId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(listings).values({
      ...data,
      isActive: true,
      viewCount: 0,
      inquiryCount: 0,
    }).$returningId();
    if (!result) throw new Error("Failed to create listing");
    const [newListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.listingId, BigInt(result.listingId)));
    return newListing;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
}

// Get listing by ID
export async function getListingById(listingId: number) {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.isActive, true)
        )
      );
    return listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
}

// Get listings by property ID
export async function getListingsByPropertyId(propertyId: number) {
  try {
    const propertyListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.propertyId, BigInt(propertyId)),
          eq(listings.isActive, true)
        )
      );
    return propertyListings;
  } catch (error) {
    console.error("Error fetching property listings:", error);
    throw error;
  }
}

// Get listings by agent ID
export async function getListingsByAgentId(agentId: number) {
  try {
    const agentListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.agentId, BigInt(agentId)),
          eq(listings.isActive, true)
        )
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
  data: Omit<Partial<Listing>, "listingId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(listings)
      .set(data)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.isActive, true)
        )
      );
    const [updatedListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.listingId, BigInt(listingId)));
    return updatedListing;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
}

// Soft delete listing (set isActive to false)
export async function softDeleteListing(listingId: number) {
  try {
    await db
      .update(listings)
      .set({ isActive: false })
      .where(eq(listings.listingId, BigInt(listingId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting listing:", error);
    throw error;
  }
}

// Hard delete listing (remove from database)
export async function deleteListing(listingId: number) {
  try {
    await db
      .delete(listings)
      .where(eq(listings.listingId, BigInt(listingId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
}

// List all listings (with pagination and optional filters)
export async function listListings(
  page = 1, 
  limit = 10, 
  filters?: {
    status?: 'Active' | 'Pending' | 'Sold';
    listingType?: 'Sale' | 'Rent';
    agentId?: number[];
    propertyId?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isBankOwned?: boolean;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string[];
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
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.status) {
        whereConditions.push(sql`${listings.status} IN (${filters.status})`);
      }
      if (filters.listingType) {
        whereConditions.push(sql`${listings.listingType} IN (${filters.listingType})`);
      }
      if (filters.agentId && filters.agentId.length > 0) {
        whereConditions.push(sql`${listings.agentId} IN (${filters.agentId.map(id => BigInt(id))})`);
      }
      if (filters.propertyId) {
        whereConditions.push(eq(listings.propertyId, BigInt(filters.propertyId)));
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
        whereConditions.push(sql`CAST(${listings.price} AS DECIMAL) >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        whereConditions.push(sql`CAST(${listings.price} AS DECIMAL) <= ${filters.maxPrice}`);
      }
      if (filters.propertyType && filters.propertyType.length > 0) {
        whereConditions.push(sql`${properties.propertyType} IN (${filters.propertyType})`);
      }
      if (filters.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }
      if (filters.minBathrooms) {
        whereConditions.push(sql`CAST(${properties.bathrooms} AS DECIMAL) >= ${filters.minBathrooms}`);
      }
      if (filters.maxBathrooms) {
        whereConditions.push(sql`CAST(${properties.bathrooms} AS DECIMAL) <= ${filters.maxBathrooms}`);
      }
      if (filters.minSquareMeter) {
        whereConditions.push(sql`${properties.squareMeter} >= ${filters.minSquareMeter}`);
      }
      if (filters.maxSquareMeter) {
        whereConditions.push(sql`${properties.squareMeter} <= ${filters.maxSquareMeter}`);
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
        whereConditions.push(eq(properties.hasStorageRoom, filters.hasStorageRoom));
      }
      if (filters.brandNew !== undefined) {
        whereConditions.push(eq(properties.brandNew, filters.brandNew));
      }
      if (filters.needsRenovation !== undefined) {
        whereConditions.push(eq(properties.needsRenovation, filters.needsRenovation));
      }
      if (filters.searchQuery) {
        whereConditions.push(
          sql`(
            ${properties.title} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.referenceNumber} LIKE ${`%${filters.searchQuery}%`} OR
            ${properties.street} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.city} LIKE ${`%${filters.searchQuery}%`} OR
            ${locations.province} LIKE ${`%${filters.searchQuery}%`}
          )`
        );
      }
    } else {
      // By default, only show active listings
      whereConditions.push(eq(listings.isActive, true));
    }

    // Create the base query with property, location, agent, and owner details
    const query = db
      .select({
        // Listing fields
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        agentId: listings.agentId,
        agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
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

        // Image fields (first image only)
        imageUrl: sql<string>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        s3key: sql<string>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        // Second image for hover effect
        imageUrl2: sql<string>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
        s3key2: sql<string>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,

        // Owner information through listing contacts
        ownerName: sql<string>`(
          SELECT CONCAT(c.first_name, ' ', c.last_name)
          FROM listing_contacts lc
          JOIN contacts c ON lc.contact_id = c.contact_id
          WHERE lc.listing_id = ${listings.listingId}
          AND lc.contact_type = 'owner'
          AND lc.is_active = true
          AND c.is_active = true
          LIMIT 1
        )`
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
      .leftJoin(users, eq(listings.agentId, users.userId));

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
      .leftJoin(users, eq(listings.agentId, users.userId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const count = countResult[0]?.count ?? 0;

    // If no results found, return empty result set
    if (count === 0) {
      console.log('No listings found with current filters');
      return {
        listings: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination and sorting
    const allListings = await filteredQuery
      .orderBy(sql`${listings.isFeatured} DESC, ${listings.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    // Log the results
    console.log(`Found ${allListings.length} listings with owner information:`);
    allListings.forEach((listing, index) => {
      console.log(`${index + 1}. Listing ID: ${listing.listingId}, Property: ${listing.title}, Agent: ${listing.agentName}, Owner: ${listing.ownerName || 'No owner found'}`);
    });

    return {
      listings: allListings,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("Error listing listings:", error);
    // Return empty result set on error
    return {
      listings: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
  }
}

// Get all active agents
export async function getAllAgents() {
  try {
    const agents = await db
      .select({
        id: users.userId,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

    return agents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
}

// ... rest of the file remains unchanged ...