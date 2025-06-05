import { db } from "../db"
import { deals } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Deal } from "../../lib/data";

// Create a new deal
export async function createDeal(data: Omit<Deal, "dealId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(deals).values(data).$returningId();
    if (!result) throw new Error("Failed to create deal");
    const [newDeal] = await db.select().from(deals).where(eq(deals.dealId, BigInt(result.dealId)));
    return newDeal;
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
}

// Get deal by ID
export async function getDealById(dealId: number) {
  try {
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.dealId, BigInt(dealId)));
    return deal;
  } catch (error) {
    console.error("Error fetching deal:", error);
    throw error;
  }
}

// Get deals by listing ID
export async function getDealsByListingId(listingId: number) {
  try {
    const listingDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.listingId, BigInt(listingId)));
    return listingDeals;
  } catch (error) {
    console.error("Error fetching deals by listing:", error);
    throw error;
  }
}

// Get deals by status
export async function getDealsByStatus(status: Deal['status']) {
  try {
    const statusDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.status, status));
    return statusDeals;
  } catch (error) {
    console.error("Error fetching deals by status:", error);
    throw error;
  }
}

// Update deal
export async function updateDeal(dealId: number, data: Omit<Partial<Deal>, "dealId">) {
  try {
    await db
      .update(deals)
      .set(data)
      .where(eq(deals.dealId, BigInt(dealId)));
    const [updatedDeal] = await db
      .select()
      .from(deals)
      .where(eq(deals.dealId, BigInt(dealId)));
    return updatedDeal;
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
}

// Delete deal
export async function deleteDeal(dealId: number) {
  try {
    await db
      .delete(deals)
      .where(eq(deals.dealId, BigInt(dealId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
}

// List all deals (with pagination)
export async function listDeals(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allDeals = await db
      .select()
      .from(deals)
      .limit(limit)
      .offset(offset);
    return allDeals;
  } catch (error) {
    console.error("Error listing deals:", error);
    throw error;
  }
} 