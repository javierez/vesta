"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { s3Client } from "~/server/s3";
import { createPropertyImage, getPropertyImageById } from "~/server/queries/property_images";
import type { PropertyImage } from "~/lib/data";
import { base64ToBuffer, generateRenovatedImageFilename } from "~/lib/image-utils";
import { getDynamicBucketName } from "~/lib/s3-bucket";
import type { RenovationType } from "~/types/gemini";

/**
 * Upload renovated image to S3 and create database record
 * Follows the same pattern as enhanced images but for Gemini-renovated images
 */
export async function uploadRenovatedImageToS3(
  renovatedImageBase64: string,
  propertyId: bigint,
  referenceNumber: string,
  imageOrder: number,
  renovationType?: RenovationType,
): Promise<PropertyImage> {
  try {
    // 1. Convert base64 to buffer
    const imageBuffer = base64ToBuffer(renovatedImageBase64);
    
    // 2. Generate the S3 key for the renovated image
    const fileExtension = 'jpg'; // Gemini typically returns JPEG
    const imageKey = generateRenovatedImageFilename(
      referenceNumber,
      imageOrder,
      nanoid(6),
      fileExtension
    );
    
    // Get dynamic bucket name
    const bucketName = await getDynamicBucketName();
    const s3key = `s3://${bucketName}/${imageKey}`;

    // 3. Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      }),
    );

    // 4. Generate the public URL
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

    // 5. Create image tag with renovation type
    const imageTag = renovationType ? `ai_renovated_${renovationType}` : 'ai_renovated';

    // 6. Create database record with ai_renovated tag
    const result = await createPropertyImage({
      propertyId,
      referenceNumber,
      imageUrl,
      isActive: true,
      imageKey,
      s3key,
      imageOrder,
      imageTag, // Mark as AI renovated with type for future reference
    });

    if (!result) {
      throw new Error("Failed to create renovated property image record");
    }

    // 7. Fetch the complete image record
    const propertyImage = await getPropertyImageById(result.propertyImageId);
    if (!propertyImage) {
      throw new Error("Failed to fetch created renovated property image");
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
    };

    console.log('Successfully uploaded renovated image:', {
      propertyImageId: typedPropertyImage.propertyImageId.toString(),
      imageUrl: typedPropertyImage.imageUrl,
      imageTag: typedPropertyImage.imageTag,
      renovationType
    });

    return typedPropertyImage;
  } catch (error) {
    console.error("Error uploading renovated image to S3:", error);
    throw new Error(`Failed to upload renovated image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a renovated property image record from a Buffer
 * Alternative method for when we have the renovated image as raw buffer data
 */
export async function createRenovatedPropertyImageFromBuffer(
  buffer: Buffer,
  propertyId: bigint,
  referenceNumber: string,
  imageOrder: number,
  renovationType?: RenovationType,
): Promise<PropertyImage> {
  try {
    // 1. Generate the S3 key for the renovated image
    const fileExtension = 'jpg'; // Default to JPEG for Gemini images
    const imageKey = generateRenovatedImageFilename(
      referenceNumber,
      imageOrder,
      nanoid(6),
      fileExtension
    );
    
    // Get dynamic bucket name
    const bucketName = await getDynamicBucketName();
    const s3key = `s3://${bucketName}/${imageKey}`;

    // 2. Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
        Body: buffer,
        ContentType: 'image/jpeg',
      }),
    );

    // 3. Generate the public URL
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

    // 4. Create image tag with renovation type
    const imageTag = renovationType ? `ai_renovated_${renovationType}` : 'ai_renovated';

    // 5. Create database record with ai_renovated tag
    const result = await createPropertyImage({
      propertyId,
      referenceNumber,
      imageUrl,
      isActive: true,
      imageKey,
      s3key,
      imageOrder,
      imageTag, // Mark as AI renovated
    });

    if (!result) {
      throw new Error("Failed to create renovated property image record");
    }

    // 6. Fetch the complete image record
    const propertyImage = await getPropertyImageById(result.propertyImageId);
    if (!propertyImage) {
      throw new Error("Failed to fetch created renovated property image");
    }

    // Convert to PropertyImage type
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
    };

    return typedPropertyImage;
  } catch (error) {
    console.error("Error creating renovated property image from buffer:", error);
    throw new Error(`Failed to create renovated property image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}