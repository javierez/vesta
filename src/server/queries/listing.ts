import { db } from "../db"
import { listings } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { Listing } from "../../lib/data";

// Create a new listing
export async function createListing(data: Omit<Listing, "listingId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(listings).values({
      ...data,
      isActive: true,
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
    } else {
      // By default, only show active listings
      whereConditions.push(eq(listings.isActive, true));
    }

    // Create the base query
    const query = db.select().from(listings);

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
