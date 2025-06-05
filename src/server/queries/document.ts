import { db } from "../db";
import { documents } from "../db/schema";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import type { Document } from "../../lib/data";

// Create a new document
export async function createDocument(data: Omit<Document, "docId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(documents).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to create document");
    const [newDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.docId, BigInt(result.docId)));
    return newDocument;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

// Get document by ID
export async function getDocumentById(docId: number) {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.docId, BigInt(docId)),
          eq(documents.isActive, true)
        )
      );
    return document;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}

// Get documents by user ID
export async function getUserDocuments(userId: number) {
  try {
    const userDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, BigInt(userId)),
          eq(documents.isActive, true)
        )
      );
    return userDocuments;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    throw error;
  }
}

// Get documents by contact ID
export async function getContactDocuments(contactId: number) {
  try {
    const contactDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.contactId, BigInt(contactId)),
          eq(documents.isActive, true)
        )
      );
    return contactDocuments;
  } catch (error) {
    console.error("Error fetching contact documents:", error);
    throw error;
  }
}

// Get documents by listing ID
export async function getListingDocuments(listingId: number) {
  try {
    const listingDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.listingId, BigInt(listingId)),
          eq(documents.isActive, true)
        )
      );
    return listingDocuments;
  } catch (error) {
    console.error("Error fetching listing documents:", error);
    throw error;
  }
}

// Get documents by lead ID
export async function getLeadDocuments(leadId: number) {
  try {
    const leadDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.leadId, BigInt(leadId)),
          eq(documents.isActive, true)
        )
      );
    return leadDocuments;
  } catch (error) {
    console.error("Error fetching lead documents:", error);
    throw error;
  }
}

// Get documents by deal ID
export async function getDealDocuments(dealId: number) {
  try {
    const dealDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.dealId, BigInt(dealId)),
          eq(documents.isActive, true)
        )
      );
    return dealDocuments;
  } catch (error) {
    console.error("Error fetching deal documents:", error);
    throw error;
  }
}

// Get documents by appointment ID
export async function getAppointmentDocuments(appointmentId: number) {
  try {
    const appointmentDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.appointmentId, BigInt(appointmentId)),
          eq(documents.isActive, true)
        )
      );
    return appointmentDocuments;
  } catch (error) {
    console.error("Error fetching appointment documents:", error);
    throw error;
  }
}

// Update document
export async function updateDocument(
  docId: number,
  data: Omit<Partial<Document>, "docId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(documents)
      .set(data)
      .where(
        and(
          eq(documents.docId, BigInt(docId)),
          eq(documents.isActive, true)
        )
      );
    const [updatedDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.docId, BigInt(docId)));
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

// Soft delete document (set isActive to false)
export async function softDeleteDocument(docId: number) {
  try {
    await db
      .update(documents)
      .set({ isActive: false })
      .where(eq(documents.docId, BigInt(docId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting document:", error);
    throw error;
  }
}

// Hard delete document (remove from database)
export async function deleteDocument(docId: number) {
  try {
    await db
      .delete(documents)
      .where(eq(documents.docId, BigInt(docId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// List all documents (with pagination and optional filters)
export async function listDocuments(
  page = 1,
  limit = 10,
  filters?: {
    userId?: number;
    contactId?: number;
    fileType?: string;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.userId) {
        whereConditions.push(eq(documents.userId, BigInt(filters.userId)));
      }
      if (filters.contactId) {
        whereConditions.push(eq(documents.contactId, BigInt(filters.contactId)));
      }
      if (filters.fileType) {
        whereConditions.push(eq(documents.fileType, filters.fileType));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(documents.isActive, filters.isActive));
      }
    } else {
      // By default, only show active documents
      whereConditions.push(eq(documents.isActive, true));
    }

    // Create the base query
    const query = db.select().from(documents);

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allDocuments = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allDocuments;
  } catch (error) {
    console.error("Error listing documents:", error);
    throw error;
  }
} 