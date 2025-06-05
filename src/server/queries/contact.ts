'use server'

import { db } from "../db"
import { contacts } from "../db/schema"
import { eq } from "drizzle-orm"
import type { Contact } from "../../lib/data"

// Create a new contact
export async function createContact(data: Omit<Contact, "contactId">) {
  try {
    const [result] = await db.insert(contacts).values(data).$returningId();
    if (!result) throw new Error("Failed to create contact");
    const [newContact] = await db.select().from(contacts).where(eq(contacts.contactId, BigInt(result.contactId)));
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
      .where(eq(contacts.contactId, BigInt(contactId)));
    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Get contact by email
export async function getContactByEmail(email: string) {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, email));
    return contact;
  } catch (error) {
    console.error("Error fetching contact by email:", error);
    throw error;
  }
}

// Update contact
export async function updateContact(contactId: number, data: Omit<Partial<Contact>, "contactId">) {
  try {
    await db
      .update(contacts)
      .set(data)
      .where(eq(contacts.contactId, BigInt(contactId)));
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

// Delete contact
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

// List all contacts (with pagination)
export async function listContacts(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allContacts = await db
      .select()
      .from(contacts)
      .limit(limit)
      .offset(offset);
    return allContacts;
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
} 