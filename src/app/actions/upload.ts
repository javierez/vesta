"use server";

import { uploadImageToS3, uploadDocumentToS3, renameS3Folder } from "~/lib/s3";
import {
  createPropertyImage,
  getPropertyImageById,
  updatePropertyImage,
} from "~/server/queries/property_images";
import {
  createDocument,
  getDocumentById,
  updateDocumentOrders,
} from "~/server/queries/document";
import type { PropertyImage, Document } from "~/lib/data";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { propertyImages, documents } from "~/server/db/schema";
import { s3Client } from "~/server/s3";

export async function uploadPropertyImage(
  file: File,
  propertyId: bigint,
  referenceNumber: string,
  imageOrder: number,
): Promise<PropertyImage> {
  try {
    // 1. Upload to S3
    const { imageUrl, s3key, imageKey } = await uploadImageToS3(
      file,
      referenceNumber,
      imageOrder,
    );

    // 2. Create record in database
    const result = await createPropertyImage({
      propertyId,
      referenceNumber,
      imageUrl,
      isActive: true,
      imageKey,
      s3key,
      imageOrder,
    });

    if (!result) {
      throw new Error("Failed to create property image record");
    }

    // 3. Fetch the complete image record
    const propertyImage = await getPropertyImageById(result.propertyImageId);
    if (!propertyImage) {
      throw new Error("Failed to fetch created property image");
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

    return typedPropertyImage;
  } catch (error) {
    console.error("Error uploading property image:", error);
    throw error;
  }
}

export async function deletePropertyImage(
  imageKey: string,
  propertyId: bigint,
) {
  "use server";

  try {
    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: imageKey,
      }),
    );

    // Delete from database
    await db
      .delete(propertyImages)
      .where(
        and(
          eq(propertyImages.propertyId, propertyId),
          eq(propertyImages.imageKey, imageKey),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}

export async function updateImageOrders(
  updates: Array<{ propertyImageId: bigint; imageOrder: number }>,
): Promise<void> {
  try {
    // Update each image's order in the database
    await Promise.all(
      updates.map(({ propertyImageId, imageOrder }) =>
        updatePropertyImage(propertyImageId, { imageOrder }),
      ),
    );
  } catch (error) {
    console.error("Error updating image orders:", error);
    throw error;
  }
}

export async function togglePropertyImageVisibility(
  propertyImageId: bigint,
  isActive: boolean,
): Promise<void> {
  try {
    await updatePropertyImage(propertyImageId, { isActive });
  } catch (error) {
    console.error("Error toggling image visibility:", error);
    throw error;
  }
}

export async function uploadDocument(
  file: File,
  userId: string, // Changed to string for BetterAuth compatibility
  referenceNumber: string,
  documentOrder: number,
  documentTag?: string,
  contactId?: bigint,
  listingId?: bigint,
  listingContactId?: bigint,
  dealId?: bigint,
  appointmentId?: bigint,
  propertyId?: bigint,
  folderType?: "initial-docs" | "visitas" | "others",
): Promise<Document> {
  try {
    console.log(`📤 Starting document upload:`, {
      filename: file.name,
      size: file.size,
      type: file.type,
      userId,
      referenceNumber,
      documentOrder,
      documentTag,
      folderType,
      appointmentId: appointmentId?.toString(),
      listingId: listingId?.toString(),
    });

    // 1. Upload to S3
    const { fileUrl, s3key, documentKey, filename, fileType } =
      await uploadDocumentToS3(
        file,
        referenceNumber,
        documentOrder,
        documentTag,
        folderType,
      );

    console.log(`☁️ S3 upload completed:`, {
      fileUrl,
      s3key,
      documentKey,
      filename,
      fileType,
    });

    // 2. Create record in database
    const result = await createDocument({
      filename,
      fileType,
      fileUrl,
      userId,
      contactId: contactId ?? undefined,
      listingId: listingId ?? undefined,
      listingContactId: listingContactId ?? undefined,
      dealId: dealId ?? undefined,
      appointmentId: appointmentId ?? undefined,
      propertyId: propertyId,
      documentKey,
      s3key,
      documentTag,
      documentOrder,
      isActive: true,
    });

    if (!result) {
      throw new Error("Failed to create document record");
    }

    console.log(`💾 Document record created:`, {
      docId: result.docId?.toString(),
      filename: filename,
    });

    // 3. Fetch the complete document record
    const document = await getDocumentById(Number(result.docId));
    if (!document) {
      throw new Error("Failed to fetch created document");
    }

    console.log(`✅ Document upload complete:`, {
      docId: document.docId?.toString(),
      documentKey: document.documentKey,
      fileUrl: document.fileUrl,
    });

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
      listingContactId: document.listingContactId ?? undefined,
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
    };

    return typedDocument;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function deleteDocument(documentKey: string, docId: bigint) {
  "use server";

  try {
    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: documentKey,
      }),
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
  updates: Array<{ docId: bigint; documentOrder: number }>,
): Promise<void> {
  try {
    // Update each document's order in the database
    await updateDocumentOrders(updates);
  } catch (error) {
    console.error("Error updating document orders:", error);
    throw error;
  }
}

export async function renameDocumentFolder(
  tempReferenceNumber: string,
  newReferenceNumber: string,
  _documentIds: bigint[], // Renamed to _documentIds to indicate it's intentionally unused
): Promise<
  Array<{
    docId: bigint;
    newUrl: string;
    newDocumentKey: string;
    newS3key: string;
  }>
> {
  try {
    // 1. Rename the folder in S3
    const renamedFiles = await renameS3Folder(
      tempReferenceNumber,
      newReferenceNumber,
    );

    if (renamedFiles.length === 0) {
      console.log("No files to rename");
      return [];
    }

    // 2. Update database records with new URLs and keys
    const results: Array<{
      docId: bigint;
      newUrl: string;
      newDocumentKey: string;
      newS3key: string;
    }> = [];

    for (const renamedFile of renamedFiles) {
      // Find the corresponding document in the database by matching the old key
      const [document] = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.documentKey, renamedFile.oldKey),
            eq(documents.isActive, true),
          ),
        );

      if (document) {
        // Update the document record with new URLs and keys
        await db
          .update(documents)
          .set({
            fileUrl: renamedFile.newUrl,
            documentKey: renamedFile.newKey,
            s3key: renamedFile.newS3key,
            updatedAt: new Date(),
          })
          .where(eq(documents.docId, document.docId));

        results.push({
          docId: document.docId,
          newUrl: renamedFile.newUrl,
          newDocumentKey: renamedFile.newKey,
          newS3key: renamedFile.newS3key,
        });

        console.log(
          `Updated document ${document.docId} with new URL: ${renamedFile.newUrl}`,
        );
      }
    }

    console.log(
      `Successfully renamed folder and updated ${results.length} documents`,
    );
    return results;
  } catch (error) {
    console.error("Error renaming document folder:", error);
    throw error;
  }
}
