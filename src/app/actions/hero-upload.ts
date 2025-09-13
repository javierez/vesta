"use server";

import { nanoid } from "nanoid";
import { s3Client } from "~/server/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db } from "~/server/db";
import { websiteProperties } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Upload hero background image to S3
 */
export async function uploadHeroImage(
  file: Blob,
  accountId: string,
  originalFileName: string,
): Promise<{ imageUrl: string }> {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    if (!accountId) {
      throw new Error("No account ID provided");
    }

    // Generate file extension
    const fileExtension = originalFileName.split(".").pop() ?? "jpg";
    const timestamp = Date.now();

    // Create the S3 key for hero image
    const imageKey = `hero/background_${timestamp}_${nanoid(6)}.${fileExtension}`;

    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: imageKey,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      }),
    );

    // Generate the image URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

    // Update website config with new hero image
    const [existingConfig] = await db
      .select()
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, BigInt(accountId)));

    if (existingConfig) {
      // Parse existing hero props and update backgroundImage
      interface HeroProps {
        backgroundImage?: string;
        [key: string]: unknown;
      }
      
      let heroProps: HeroProps = {};
      try {
        heroProps = JSON.parse(existingConfig.heroProps ?? "{}") as HeroProps;
      } catch (e) {
        console.error("Error parsing hero props:", e);
      }

      const updatedHeroProps: HeroProps = {
        ...heroProps,
        backgroundImage: imageUrl,
      };

      await db
        .update(websiteProperties)
        .set({
          heroProps: JSON.stringify(updatedHeroProps),
          updatedAt: new Date(),
        })
        .where(eq(websiteProperties.accountId, BigInt(accountId)));
    }

    return { imageUrl };
  } catch (error) {
    console.error("Error uploading hero image:", error);
    throw error;
  }
}

/**
 * Delete hero background image from S3
 */
export async function deleteHeroImage(
  accountId: string,
): Promise<{ success: boolean }> {
  try {
    // Get current config to find image URL
    const [config] = await db
      .select()
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, BigInt(accountId)));

    if (!config) {
      throw new Error("Website config not found");
    }

    // Parse hero props to get background image
    interface HeroProps {
      backgroundImage?: string;
      [key: string]: unknown;
    }
    
    let heroProps: HeroProps = {};
    try {
      heroProps = JSON.parse(config.heroProps ?? "{}") as HeroProps;
    } catch (e) {
      console.error("Error parsing hero props:", e);
    }

    if (heroProps.backgroundImage) {
      // Extract S3 key from URL
      const urlParts = heroProps.backgroundImage.split(".com/");
      const s3Key = urlParts.length > 1 ? urlParts[1] : null;

      // Delete from S3 if key exists
      if (s3Key) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: s3Key,
          }),
        );
      }

      // Update database to remove background image
      const updatedHeroProps: HeroProps = { ...heroProps };
      delete updatedHeroProps.backgroundImage;

      await db
        .update(websiteProperties)
        .set({
          heroProps: JSON.stringify(updatedHeroProps),
          updatedAt: new Date(),
        })
        .where(eq(websiteProperties.accountId, BigInt(accountId)));
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting hero image:", error);
    throw new Error("Failed to delete hero image");
  }
}