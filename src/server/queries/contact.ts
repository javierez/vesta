'use server'

import { db } from "../db"
import { contacts } from "../db/schema"
import { eq, and, or, like } from "drizzle-orm"
import type { Contact } from "../../lib/data"

// Create a new contact
export async function createContact(data: Omit<Contact, "contactId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(contacts).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to create contact");
    const [newContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, BigInt(result.contactId)));
    return newContact;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Get contact by ID
export async function getContactById(contactId: number) {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true)
        )
      );
    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Get contacts by organization ID
export async function getContactsByOrgId(orgId: number) {
  try {
    const orgContacts = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.orgId, BigInt(orgId)),
          eq(contacts.isActive, true)
        )
      );
    return orgContacts;
  } catch (error) {
    console.error("Error fetching organization contacts:", error);
    throw error;
  }
}

// Search contacts by name or email
export async function searchContacts(query: string) {
  try {
    const searchResults = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.isActive, true),
          or(
            like(contacts.firstName, `%${query}%`),
            like(contacts.lastName, `%${query}%`),
            like(contacts.email, `%${query}%`)
          )
        )
      );
    return searchResults;
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
}

// Update contact
export async function updateContact(
  contactId: number,
  data: Omit<Partial<Contact>, "contactId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(contacts)
      .set(data)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true)
        )
      );
    const [updatedContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, BigInt(contactId)));
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Soft delete contact (set isActive to false)
export async function softDeleteContact(contactId: number) {
  try {
    await db
      .update(contacts)
      .set({ isActive: false })
      .where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting contact:", error);
    throw error;
  }
}

// Hard delete contact (remove from database)
export async function deleteContact(contactId: number) {
  try {
    await db
      .delete(contacts)
      .where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// List all contacts (with pagination and optional filters)
export async function listContacts(
  page = 1,
  limit = 10,
  filters?: {
    orgId?: number;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.orgId) {
        whereConditions.push(eq(contacts.orgId, BigInt(filters.orgId)));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(contacts.isActive, filters.isActive));
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Create the base query
    const query = db.select().from(contacts);

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allContacts = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allContacts;
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
} 