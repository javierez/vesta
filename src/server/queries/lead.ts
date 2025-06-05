import { db } from "../db"
import { leads } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Lead } from "../../lib/data";

// Create a new lead
export async function createLead(data: Omit<Lead, "leadId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(leads).values(data).$returningId();
    if (!result) throw new Error("Failed to create lead");
    const [newLead] = await db.select().from(leads).where(eq(leads.leadId, BigInt(result.leadId)));
    return newLead;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

// Get lead by ID
export async function getLeadById(leadId: number) {
  try {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.leadId, BigInt(leadId)));
    return lead;
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
}

// Get leads by contact ID
export async function getLeadsByContactId(contactId: number) {
  try {
    const contactLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.contactId, BigInt(contactId)));
    return contactLeads;
  } catch (error) {
    console.error("Error fetching leads by contact:", error);
    throw error;
  }
}

// Get leads by listing ID
export async function getLeadsByListingId(listingId: number) {
  try {
    const listingLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.listingId, BigInt(listingId)));
    return listingLeads;
  } catch (error) {
    console.error("Error fetching leads by listing:", error);
    throw error;
  }
}

// Update lead
export async function updateLead(leadId: number, data: Omit<Partial<Lead>, "leadId">) {
  try {
    await db
      .update(leads)
      .set(data)
      .where(eq(leads.leadId, BigInt(leadId)));
    const [updatedLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.leadId, BigInt(leadId)));
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

// Delete lead
export async function deleteLead(leadId: number) {
  try {
    await db
      .delete(leads)
      .where(eq(leads.leadId, BigInt(leadId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

// List all leads (with pagination)
export async function listLeads(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allLeads = await db
      .select()
      .from(leads)
      .limit(limit)
      .offset(offset);
    return allLeads;
  } catch (error) {
    console.error("Error listing leads:", error);
    throw error;
  }
}
