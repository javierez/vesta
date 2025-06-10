'use server'

import { db } from "../db"
import { listings, properties, locations, propertyImages } from "../db/schema";
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

// Get listings by owner contact ID
export async function getListingsByOwnerContactId(ownerContactId: number) {
  try {
    const ownerListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.ownerContactId, BigInt(ownerContactId)),
          eq(listings.isActive, true)
        )
      );
    return ownerListings;
  } catch (error) {
    console.error("Error fetching owner listings:", error);
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
    agentId?: number;
    propertyId?: number;
    ownerContactId?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isBankOwned?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.status) {
        whereConditions.push(eq(listings.status, filters.status));
      }
      if (filters.listingType) {
        whereConditions.push(eq(listings.listingType, filters.listingType));
      }
      if (filters.agentId) {
        whereConditions.push(eq(listings.agentId, BigInt(filters.agentId)));
      }
      if (filters.propertyId) {
        whereConditions.push(eq(listings.propertyId, BigInt(filters.propertyId)));
      }
      if (filters.ownerContactId) {
        whereConditions.push(eq(listings.ownerContactId, BigInt(filters.ownerContactId)));
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
    } else {
      // By default, only show active listings
      whereConditions.push(eq(listings.isActive, true));
    }

    // Create the base query with property and location details
    const query = db
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

        // Image fields (first image only)
        imageUrl: propertyImages.imageUrl,
        s3key: propertyImages.s3key
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
      .leftJoin(
        propertyImages,
        and(
          eq(properties.propertyId, propertyImages.propertyId),
          eq(propertyImages.isActive, true)
        )
      );

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allListings = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allListings;
  } catch (error) {
    console.error("Error listing listings:", error);
    throw error;
  }
}

// Increment view count for a listing
export async function incrementViewCount(listingId: number) {
  try {
    await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.listingId, BigInt(listingId)));
    return { success: true };
  } catch (error) {
    console.error("Error incrementing view count:", error);
    throw error;
  }
}

// Increment inquiry count for a listing
export async function incrementInquiryCount(listingId: number) {
  try {
    await db
      .update(listings)
      .set({ inquiryCount: sql`${listings.inquiryCount} + 1` })
      .where(eq(listings.listingId, BigInt(listingId)));
    return { success: true };
  } catch (error) {
    console.error("Error incrementing inquiry count:", error);
    throw error;
  }
}

// Get listing overview with property details
export async function getListingOverview(listingId: number) {
  try {
    const [listing] = await db
      .select({
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        price: listings.price,
        status: listings.status,
        property: {
          propertyId: properties.propertyId,
          referenceNumber: properties.referenceNumber,
          title: properties.title,
          propertyType: properties.propertyType,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          squareMeter: properties.squareMeter,
        }
      })
      .from(listings)
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.isActive, true)
        )
      );

    return listing;
  } catch (error) {
    console.error("Error fetching listing overview:", error);
    throw error;
  }
}
