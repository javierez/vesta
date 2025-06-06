import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { prospects } from "~/server/db/schema";
import { createProspectHistory } from "~/server/queries/prospect-history";

export type CreateProspectInput = {
  contactId: bigint;
  sourceType: string;
  sourceDetails?: string;
  status: string;
};

export type UpdateProspectInput = Partial<CreateProspectInput> & {
  status?: string;
  listingId?: bigint;
  changedBy?: bigint;
  changeReason?: string;
};

// Create a new prospect
export async function createProspect(input: CreateProspectInput) {
  await db
    .insert(prospects)
    .values({
      ...input,
      statusUpdatedAt: new Date(),
    });
  
  // Get the created prospect
  const [created] = await db
    .select()
    .from(prospects)
    .where(eq(prospects.contactId, input.contactId))
    .orderBy(prospects.createdAt)
    .limit(1);
  
  return created;
}

// Get a prospect by ID
export async function getProspect(id: bigint) {
  const [prospect] = await db
    .select()
    .from(prospects)
    .where(eq(prospects.prospectId, id));
  return prospect;
}

// Get all prospects
export async function getAllProspects() {
  return await db.select().from(prospects);
}

// Update a prospect
export async function updateProspect(id: bigint, input: UpdateProspectInput) {
  const currentProspect = await getProspect(id);
  if (!currentProspect) {
    throw new Error("Prospect not found");
  }

  // If status is changing, create a history entry
  if (input.status && input.status !== currentProspect.status && input.changedBy) {
    await createProspectHistory({
      prospectId: id,
      previousStatus: currentProspect.status,
      newStatus: input.status,
      changedBy: input.changedBy,
      changeReason: input.changeReason,
    });
  }

  await db
    .update(prospects)
    .set({
      ...input,
      statusUpdatedAt: input.status ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(prospects.prospectId, id));
  
  // Get the updated prospect
  return await getProspect(id);
}

// Delete a prospect
export async function deleteProspect(id: bigint) {
  const prospect = await getProspect(id);
  await db
    .delete(prospects)
    .where(eq(prospects.prospectId, id));
  return prospect;
}

// Get prospects by status
export async function getProspectsByStatus(status: string) {
  return await db
    .select()
    .from(prospects)
    .where(eq(prospects.status, status));
}

// Get prospects by source type
export async function getProspectsBySourceType(sourceType: string) {
  return await db
    .select()
    .from(prospects)
    .where(eq(prospects.sourceType, sourceType));
}

// Get prospects by contact
export async function getProspectsByContact(contactId: bigint) {
  return await db
    .select()
    .from(prospects)
    .where(eq(prospects.contactId, contactId));
} 