import { db } from "~/server/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { prospectHistory } from "~/server/db/schema";

export type CreateProspectHistoryInput = {
  prospectId: bigint;
  previousStatus?: string;
  newStatus: string;
  changedBy: bigint;
  changeReason?: string;
};

// Create a new history entry
export async function createProspectHistory(input: CreateProspectHistoryInput) {
  await db.insert(prospectHistory).values(input);

  // Get the created history entry
  const [created] = await db
    .select()
    .from(prospectHistory)
    .where(eq(prospectHistory.prospectId, input.prospectId))
    .orderBy(desc(prospectHistory.createdAt))
    .limit(1);

  return created;
}

// Get history for a specific prospect
export async function getProspectHistory(prospectId: bigint) {
  return await db
    .select()
    .from(prospectHistory)
    .where(eq(prospectHistory.prospectId, prospectId))
    .orderBy(desc(prospectHistory.createdAt));
}

// Get history by user who made the change
export async function getProspectHistoryByUser(changedBy: bigint) {
  return await db
    .select()
    .from(prospectHistory)
    .where(eq(prospectHistory.changedBy, changedBy))
    .orderBy(desc(prospectHistory.createdAt));
}

// Get history entries between two dates
export async function getProspectHistoryByDateRange(
  startDate: Date,
  endDate: Date,
) {
  return await db
    .select()
    .from(prospectHistory)
    .where(
      and(
        gte(prospectHistory.createdAt, startDate),
        lte(prospectHistory.createdAt, endDate),
      ),
    )
    .orderBy(desc(prospectHistory.createdAt));
}

// Get history entries for a specific status change
export async function getProspectHistoryByStatusChange(
  previousStatus: string,
  newStatus: string,
) {
  return await db
    .select()
    .from(prospectHistory)
    .where(
      and(
        eq(prospectHistory.previousStatus, previousStatus),
        eq(prospectHistory.newStatus, newStatus),
      ),
    )
    .orderBy(desc(prospectHistory.createdAt));
}
