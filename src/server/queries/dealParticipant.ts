import { db } from "../db"
import { dealParticipants } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { DealParticipant } from "../../lib/data";

// Add a participant to a deal
export async function addDealParticipant(data: DealParticipant) {
  try {
    await db.insert(dealParticipants).values(data);
    const [participant] = await db
      .select()
      .from(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, data.dealId),
          eq(dealParticipants.contactId, data.contactId),
          eq(dealParticipants.role, data.role)
        )
      );
    return participant;
  } catch (error) {
    console.error("Error adding deal participant:", error);
    throw error;
  }
}

// Get participants by deal ID
export async function getDealParticipants(dealId: number) {
  try {
    const participants = await db
      .select()
      .from(dealParticipants)
      .where(eq(dealParticipants.dealId, BigInt(dealId)));
    return participants;
  } catch (error) {
    console.error("Error fetching deal participants:", error);
    throw error;
  }
}

// Get deals by contact ID
export async function getContactDeals(contactId: number) {
  try {
    const deals = await db
      .select()
      .from(dealParticipants)
      .where(eq(dealParticipants.contactId, BigInt(contactId)));
    return deals;
  } catch (error) {
    console.error("Error fetching contact deals:", error);
    throw error;
  }
}

// Get participants by role
export async function getParticipantsByRole(role: DealParticipant['role']) {
  try {
    const participants = await db
      .select()
      .from(dealParticipants)
      .where(eq(dealParticipants.role, role));
    return participants;
  } catch (error) {
    console.error("Error fetching participants by role:", error);
    throw error;
  }
}

// Update participant role
export async function updateParticipantRole(
  dealId: number,
  contactId: number,
  newRole: DealParticipant['role']
) {
  try {
    await db
      .update(dealParticipants)
      .set({ role: newRole })
      .where(
        and(
          eq(dealParticipants.dealId, BigInt(dealId)),
          eq(dealParticipants.contactId, BigInt(contactId))
        )
      );
    const [updatedParticipant] = await db
      .select()
      .from(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, BigInt(dealId)),
          eq(dealParticipants.contactId, BigInt(contactId))
        )
      );
    return updatedParticipant;
  } catch (error) {
    console.error("Error updating participant role:", error);
    throw error;
  }
}

// Remove participant from deal
export async function removeDealParticipant(dealId: number, contactId: number) {
  try {
    await db
      .delete(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, BigInt(dealId)),
          eq(dealParticipants.contactId, BigInt(contactId))
        )
      );
    return { success: true };
  } catch (error) {
    console.error("Error removing deal participant:", error);
    throw error;
  }
}

// List all participants (with pagination)
export async function listDealParticipants(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allParticipants = await db
      .select()
      .from(dealParticipants)
      .limit(limit)
      .offset(offset);
    return allParticipants;
  } catch (error) {
    console.error("Error listing deal participants:", error);
    throw error;
  }
} 