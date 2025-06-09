'use server'

import { db } from "../db"
import { properties, propertyImages } from "../db/schema"
import { eq, and, sql } from "drizzle-orm"
import { cache } from 'react'
import type { Property, PropertyImage } from "../../lib/data"

// Create a new property
export async function createProperty(data: Omit<Property, "propertyId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(properties).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to create property");
    const [newProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.propertyId, BigInt(result.propertyId)));
    return newProperty;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

// Get property by ID
export async function getPropertyById(propertyId: number) {
  try {
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(propertyId)),
          eq(properties.isActive, true)
        )
      );
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

// Update property
export async function updateProperty(
  propertyId: number,
  data: Omit<Partial<Property>, "propertyId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(properties)
      .set(data)
      .where(
        and(
          eq(properties.propertyId, BigInt(propertyId)),
          eq(properties.isActive, true)
        )
      );
    const [updatedProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return updatedProperty;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

// Soft delete property (set isActive to false)
export async function softDeleteProperty(propertyId: number) {
  try {
    await db
      .update(properties)
      .set({ isActive: false })
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting property:", error);
    throw error;
  }
}

// Hard delete property (remove from database)
export async function deleteProperty(propertyId: number) {
  try {
    await db
      .delete(properties)
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
}

// List all properties (with pagination and optional filters)
export async function listProperties(
  page = 1, 
  limit = 10, 
  filters?: {
    propertyType?: string;
    city?: string;
    bedrooms?: number;
    minSquareMeter?: number;
    maxSquareMeter?: number;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.propertyType) {
        whereConditions.push(eq(properties.propertyType, filters.propertyType));
      }
      if (filters.city) {
        whereConditions.push(eq(properties.city, filters.city));
      }
      if (filters.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }
      if (filters.minSquareMeter) {
        whereConditions.push(sql`${properties.squareMeter} >= ${filters.minSquareMeter}`);
      }
      if (filters.maxSquareMeter) {
        whereConditions.push(sql`${properties.squareMeter} <= ${filters.maxSquareMeter}`);
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(properties.isActive, filters.isActive));
      }
    } else {
      // By default, only show active properties
      whereConditions.push(eq(properties.isActive, true));
    }

    // Create the base query
    const query = db.select().from(properties);

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allProperties = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allProperties;
  } catch (error) {
    console.error("Error listing properties:", error);
    throw error;
  }
}

// Property Images CRUD operations
export async function addPropertyImage(data: Omit<PropertyImage, "propertyImageId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(propertyImages).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to add property image");
    const [newImage] = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyImageId, BigInt(result.propertyImageId)));
    return newImage;
  } catch (error) {
    console.error("Error adding property image:", error);
    throw error;
  }
}

export async function getPropertyImages(propertyId: number) {
  try {
    const images = await db
      .select()
      .from(propertyImages)
      .where(
        and(
          eq(propertyImages.propertyId, BigInt(propertyId)),
          eq(propertyImages.isActive, true)
        )
      );
    return images;
  } catch (error) {
    console.error("Error fetching property images:", error);
    throw error;
  }
}

export async function deletePropertyImage(imageId: number) {
  try {
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.propertyImageId, BigInt(imageId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting property image:", error);
    throw error;
  }
} 