import { db } from "../db";
import { propertyImages } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { PropertyImage } from "../../lib/data";

// Create a new property image
export async function createPropertyImage(
  data: Omit<PropertyImage, "propertyImageId" | "createdAt" | "updatedAt">,
) {
  try {
    const [propertyImage] = await db
      .insert(propertyImages)
      .values(data)
      .$returningId();
    return propertyImage;
  } catch (error) {
    console.error("Error creating property image:", error);
    throw error;
  }
}

// Get a property image by ID
export async function getPropertyImageById(propertyImageId: bigint) {
  try {
    const [propertyImage] = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyImageId, propertyImageId));
    return propertyImage;
  } catch (error) {
    console.error("Error getting property image:", error);
    throw error;
  }
}

// Get property images by reference number
export async function getPropertyImagesByReference(
  referenceNumber: string,
  isActive = true,
) {
  try {
    const conditions = [eq(propertyImages.referenceNumber, referenceNumber)];
    if (isActive !== undefined) {
      conditions.push(eq(propertyImages.isActive, isActive));
    }

    return await db
      .select()
      .from(propertyImages)
      .where(and(...conditions))
      .orderBy(asc(propertyImages.imageOrder));
  } catch (error) {
    console.error("Error getting property images by reference:", error);
    throw error;
  }
}

// Get all images for a property
export async function getPropertyImages(propertyId: bigint, isActive = true) {
  try {
    const conditions = [eq(propertyImages.propertyId, propertyId)];
    if (isActive !== undefined) {
      conditions.push(eq(propertyImages.isActive, isActive));
    }

    return await db
      .select()
      .from(propertyImages)
      .where(and(...conditions))
      .orderBy(asc(propertyImages.imageOrder));
  } catch (error) {
    console.error("Error getting property images:", error);
    throw error;
  }
}

// Update a property image
export async function updatePropertyImage(
  propertyImageId: bigint,
  data: Partial<PropertyImage>,
) {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await db
      .update(propertyImages)
      .set(updateData)
      .where(eq(propertyImages.propertyImageId, propertyImageId));

    return await getPropertyImageById(propertyImageId);
  } catch (error) {
    console.error("Error updating property image:", error);
    throw error;
  }
}

// Delete a property image (soft delete by setting isActive to false)
export async function deletePropertyImage(propertyImageId: bigint) {
  try {
    const propertyImage = await getPropertyImageById(propertyImageId);
    await db
      .update(propertyImages)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(propertyImages.propertyImageId, propertyImageId));
    return propertyImage;
  } catch (error) {
    console.error("Error deleting property image:", error);
    throw error;
  }
}

// Hard delete a property image (use with caution)
export async function hardDeletePropertyImage(propertyImageId: bigint) {
  try {
    const propertyImage = await getPropertyImageById(propertyImageId);
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.propertyImageId, propertyImageId));
    return propertyImage;
  } catch (error) {
    console.error("Error hard deleting property image:", error);
    throw error;
  }
}
