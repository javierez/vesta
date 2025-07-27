"use server";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { prospects } from "~/server/db/schema";
import { createProspectHistory } from "~/server/queries/prospect-history";

export type CreateProspectInput = {
  contactId: bigint;
  status: string;
  listingType?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  preferredAreas?: Array<{ neighborhoodId: number; name: string }>;
  minBedrooms?: number;
  minBathrooms?: number;
  minSquareMeters?: number;
  maxSquareMeters?: number;
  moveInBy?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extras?: Record<string, any>;
  urgencyLevel?: number;
  fundingReady?: boolean;
  notesInternal?: string;
};

export type UpdateProspectInput = Partial<CreateProspectInput> & {
  changedBy?: bigint;
  changeReason?: string;
};

// Create a new prospect
export async function createProspect(input: CreateProspectInput) {
  await db.insert(prospects).values(input);

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
    .where(eq(prospects.id, id));
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
  if (
    input.status &&
    input.status !== currentProspect.status &&
    input.changedBy
  ) {
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
      updatedAt: new Date(),
    })
    .where(eq(prospects.id, id));

  // Get the updated prospect
  return await getProspect(id);
}

// Delete a prospect
export async function deleteProspect(id: bigint) {
  const prospect = await getProspect(id);
  await db.delete(prospects).where(eq(prospects.id, id));
  return prospect;
}

// Get prospects by status
export async function getProspectsByStatus(status: string) {
  return await db.select().from(prospects).where(eq(prospects.status, status));
}

// Get prospects by property type
export async function getProspectsByPropertyType(propertyType: string) {
  return await db
    .select()
    .from(prospects)
    .where(eq(prospects.propertyType, propertyType));
}

// Get prospects by contact
export async function getProspectsByContact(contactId: bigint) {
  return await db
    .select()
    .from(prospects)
    .where(eq(prospects.contactId, contactId));
}
