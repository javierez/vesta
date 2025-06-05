import { db } from "../db";
import { properties } from "../db/schema";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";
import type { Property } from "../../lib/data";

// Create a new property
export async function createProperty(data: Omit<Property, "propertyId" | "createdAt" | "updatedAt">) {
  try {
    const [property] = await db.insert(properties).values({
      ...data,
      price: data.price,
      latitude: data.latitude,
      longitude: data.longitude,
      bathrooms: data.bathrooms,
    }).$returningId();
    return property;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

// Get a property by ID
export async function getPropertyById(propertyId: bigint) {
  try {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.propertyId, propertyId));
    return property;
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
}

// Get properties with filters
export async function getProperties({
  propertyType,
  status,
  city,
  minPrice,
  maxPrice,
  minBedrooms,
  maxBedrooms,
  minSquareMeter,
  maxSquareMeter,
  isFeatured,
  isActive = true,
  limit = 10,
  offset = 0,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  propertyType?: string;
  status?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minSquareMeter?: number;
  maxSquareMeter?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: keyof typeof properties;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const conditions = [];

    if (propertyType) {
      conditions.push(eq(properties.propertyType, propertyType));
    }
    if (status) {
      conditions.push(eq(properties.status, status));
    }
    if (city) {
      conditions.push(eq(properties.city, city));
    }
    if (minPrice) {
      conditions.push(sql`CAST(${properties.price} AS DECIMAL) >= ${minPrice}`);
    }
    if (maxPrice) {
      conditions.push(sql`CAST(${properties.price} AS DECIMAL) <= ${maxPrice}`);
    }
    if (minBedrooms) {
      conditions.push(sql`${properties.bedrooms} >= ${minBedrooms}`);
    }
    if (maxBedrooms) {
      conditions.push(sql`${properties.bedrooms} <= ${maxBedrooms}`);
    }
    if (minSquareMeter) {
      conditions.push(sql`${properties.squareMeter} >= ${minSquareMeter}`);
    }
    if (maxSquareMeter) {
      conditions.push(sql`${properties.squareMeter} <= ${maxSquareMeter}`);
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(properties.isFeatured, isFeatured));
    }
    if (isActive !== undefined) {
      conditions.push(eq(properties.isActive, isActive));
    }

    const query = db
      .select()
      .from(properties)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // Add sorting
    if (sortBy === "createdAt") {
      if (sortOrder === "desc") {
        query.orderBy(desc(properties.createdAt));
      } else {
        query.orderBy(asc(properties.createdAt));
      }
    }

    return await query;
  } catch (error) {
    console.error("Error getting properties:", error);
    throw error;
  }
}

// Update a property
export async function updateProperty(propertyId: bigint, data: Partial<Property>) {
  try {
    const updateData = {
      ...data,
      price: data.price,
      latitude: data.latitude,
      longitude: data.longitude,
      bathrooms: data.bathrooms,
      updatedAt: new Date(),
    };

    await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.propertyId, propertyId));
    
    return await getPropertyById(propertyId);
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

// Delete a property
export async function deleteProperty(propertyId: bigint) {
  try {
    const property = await getPropertyById(propertyId);
    await db
      .delete(properties)
      .where(eq(properties.propertyId, propertyId));
    return property;
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
}

// Search properties
export async function searchProperties(searchTerm: string, limit = 10) {
  try {
    const searchConditions = or(
      like(properties.title, `%${searchTerm}%`),
      like(properties.description, `%${searchTerm}%`),
      like(properties.city, `%${searchTerm}%`),
      like(properties.neighborhood, `%${searchTerm}%`),
      like(properties.street, `%${searchTerm}%`)
    );

    return await db
      .select()
      .from(properties)
      .where(searchConditions)
      .limit(limit);
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
}