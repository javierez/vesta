'use server'

import { uploadImageToS3 } from "~/lib/s3"
import { createPropertyImage, getPropertyImageById } from "~/server/queries/property_images"
import type { PropertyImage } from "~/lib/data"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { and, eq } from "drizzle-orm"
import { db } from "~/server/db"
import { propertyImages } from "~/server/db/schema"
import { s3Client } from "~/server/s3"

export async function uploadPropertyImage(
  file: File,
  propertyId: bigint,
  referenceNumber: string,
  imageOrder: number
): Promise<PropertyImage> {
  try {
    // 1. Upload to S3
    const { imageUrl, s3key, imageKey } = await uploadImageToS3(file, referenceNumber, imageOrder)

    // 2. Create record in database
    const result = await createPropertyImage({
      propertyId,
      referenceNumber,
      imageUrl,
      isActive: true,
      imageKey,
      s3key,
      imageOrder,
    })

    if (!result) {
      throw new Error("Failed to create property image record")
    }

    // 3. Fetch the complete image record
    const propertyImage = await getPropertyImageById(result.propertyImageId)
    if (!propertyImage) {
      throw new Error("Failed to fetch created property image")
    }

    // Convert to PropertyImage type, ensuring all required fields are present
    const typedPropertyImage: PropertyImage = {
      propertyImageId: propertyImage.propertyImageId,
      propertyId: propertyImage.propertyId,
      referenceNumber: propertyImage.referenceNumber,
      imageUrl: propertyImage.imageUrl,
      isActive: propertyImage.isActive ?? true,
      createdAt: propertyImage.createdAt,
      updatedAt: propertyImage.updatedAt,
      imageKey: propertyImage.imageKey,
      s3key: propertyImage.s3key,
      imageOrder: propertyImage.imageOrder,
      imageTag: propertyImage.imageTag ?? undefined,
    }

    return typedPropertyImage
  } catch (error) {
    console.error("Error uploading property image:", error)
    throw error
  }
}

export async function deletePropertyImage(imageKey: string, propertyId: bigint) {
  'use server'
  
  try {
    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: imageKey,
      })
    );

    // Delete from database
    await db.delete(propertyImages).where(
      and(
        eq(propertyImages.propertyId, propertyId),
        eq(propertyImages.imageKey, imageKey)
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
} 