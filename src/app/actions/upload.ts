'use server'

import { uploadImageToS3, uploadDocumentToS3 } from "~/lib/s3"
import { createPropertyImage, getPropertyImageById, updatePropertyImage } from "~/server/queries/property_images"
import { createDocument, getDocumentById, updateDocument, deleteDocument as softDeleteDocument, updateDocumentOrders } from "~/server/queries/document"
import type { PropertyImage, Document } from "~/lib/data"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { and, eq } from "drizzle-orm"
import { db } from "~/server/db"
import { propertyImages, documents } from "~/server/db/schema"
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

export async function updateImageOrders(
  updates: Array<{ propertyImageId: bigint; imageOrder: number }>
): Promise<void> {
  try {
    // Update each image's order in the database
    await Promise.all(
      updates.map(({ propertyImageId, imageOrder }) =>
        updatePropertyImage(propertyImageId, { imageOrder })
      )
    )
  } catch (error) {
    console.error("Error updating image orders:", error)
    throw error
  }
} 

export async function uploadDocument(
  file: File,
  userId: bigint,
  referenceNumber: string,
  documentOrder: number,
  documentTag?: string,
  contactId?: bigint,
  listingId?: bigint,
  leadId?: bigint,
  dealId?: bigint,
  appointmentId?: bigint,
  propertyId?: bigint
): Promise<Document> {
  try {
    // 1. Upload to S3
    const { fileUrl, s3key, documentKey, filename, fileType } = await uploadDocumentToS3(
      file,
      referenceNumber,
      documentOrder,
      documentTag
    )

    // 2. Create record in database
    const result = await createDocument({
      filename,
      fileType,
      fileUrl,
      userId,
      contactId: contactId ?? undefined,
      listingId: listingId ?? undefined,
      leadId: leadId ?? undefined,
      dealId: dealId ?? undefined,
      appointmentId: appointmentId ?? undefined,
      propertyId: propertyId,
      documentKey,
      s3key,
      documentTag,
      documentOrder,
      isActive: true,
    })

    if (!result) {
      throw new Error("Failed to create document record")
    }

    // 3. Fetch the complete document record
    const document = await getDocumentById(Number(result.docId))
    if (!document) {
      throw new Error("Failed to fetch created document")
    }

    // Convert to Document type, ensuring all required fields are present
    const typedDocument: Document = {
      docId: document.docId,
      filename: document.filename,
      fileType: document.fileType,
      fileUrl: document.fileUrl,
      userId: document.userId,
      contactId: document.contactId ?? undefined,
      uploadedAt: document.uploadedAt,
      listingId: document.listingId ?? undefined,
      leadId: document.leadId ?? undefined,
      dealId: document.dealId ?? undefined,
      appointmentId: document.appointmentId ?? undefined,
      propertyId: document.propertyId ?? undefined,
      documentKey: document.documentKey,
      s3key: document.s3key,
      documentTag: document.documentTag ?? undefined,
      documentOrder: document.documentOrder,
      isActive: document.isActive ?? true,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }

    return typedDocument
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
} 

export async function deleteDocument(documentKey: string, docId: bigint) {
  'use server'
  
  try {
    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: documentKey,
      })
    );

    // Delete from database
    await db.delete(documents).where(eq(documents.docId, docId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function updateDocumentOrdersAction(
  updates: Array<{ docId: bigint; documentOrder: number }>
): Promise<void> {
  try {
    // Update each document's order in the database
    await updateDocumentOrders(updates)
  } catch (error) {
    console.error("Error updating document orders:", error)
    throw error
  }
} 