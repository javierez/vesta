"use server";

import { db } from "../db";
import { deals, listings, properties } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { Deal } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
export async function createDealWithAuth(
  data: Omit<Deal, "dealId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return createDeal(data, accountId);
}

export async function getDealByIdWithAuth(dealId: number) {
  const accountId = await getCurrentUserAccountId();
  return getDealById(dealId, accountId);
}

export async function getDealsByListingIdWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return getDealsByListingId(listingId, accountId);
}

export async function getDealsByStatusWithAuth(status: Deal["status"]) {
  const accountId = await getCurrentUserAccountId();
  return getDealsByStatus(status, accountId);
}

export async function updateDealWithAuth(
  dealId: number,
  data: Omit<Partial<Deal>, "dealId">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateDeal(dealId, data, accountId);
}

export async function deleteDealWithAuth(dealId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteDeal(dealId, accountId);
}

export async function listDealsWithAuth(page = 1, limit = 10) {
  const accountId = await getCurrentUserAccountId();
  return listDeals(page, limit, accountId);
}

// Create a new deal
export async function createDeal(
  data: Omit<Deal, "dealId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // Verify the listing belongs to this account
    const [listing] = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.listingId, data.listingId),
          eq(properties.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    const [result] = await db.insert(deals).values(data).$returningId();
    if (!result) throw new Error("Failed to create deal");
    const [newDeal] = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.dealId, BigInt(result.dealId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return newDeal;
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
}

// Get deal by ID
export async function getDealById(dealId: number, accountId: number) {
  try {
    const [deal] = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.dealId, BigInt(dealId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return deal;
  } catch (error) {
    console.error("Error fetching deal:", error);
    throw error;
  }
}

// Get deals by listing ID
export async function getDealsByListingId(
  listingId: number,
  accountId: number,
) {
  try {
    // Verify the listing belongs to this account
    const [listing] = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(properties.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!listing) {
      throw new Error("Listing not found or access denied");
    }

    const listingDeals = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.listingId, BigInt(listingId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return listingDeals;
  } catch (error) {
    console.error("Error fetching deals by listing:", error);
    throw error;
  }
}

// Get deals by status
export async function getDealsByStatus(
  status: Deal["status"],
  accountId: number,
) {
  try {
    const statusDeals = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.status, status),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return statusDeals;
  } catch (error) {
    console.error("Error fetching deals by status:", error);
    throw error;
  }
}

// Update deal
export async function updateDeal(
  dealId: number,
  data: Omit<Partial<Deal>, "dealId">,
  accountId: number,
) {
  try {
    // Verify the deal belongs to this account
    const [existingDeal] = await db
      .select({ dealId: deals.dealId })
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.dealId, BigInt(dealId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!existingDeal) {
      throw new Error("Deal not found or access denied");
    }

    await db
      .update(deals)
      .set(data)
      .where(eq(deals.dealId, BigInt(dealId)));
    const [updatedDeal] = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.dealId, BigInt(dealId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return updatedDeal;
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
}

// Delete deal
export async function deleteDeal(dealId: number, accountId: number) {
  try {
    // Verify the deal belongs to this account
    const [existingDeal] = await db
      .select({ dealId: deals.dealId })
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(deals.dealId, BigInt(dealId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!existingDeal) {
      throw new Error("Deal not found or access denied");
    }

    await db.delete(deals).where(eq(deals.dealId, BigInt(dealId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
}

// List all deals (with pagination)
export async function listDeals(page = 1, limit = 10, accountId: number) {
  try {
    const offset = (page - 1) * limit;
    const allDeals = await db
      .select()
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(eq(properties.accountId, BigInt(accountId)))
      .limit(limit)
      .offset(offset);
    return allDeals;
  } catch (error) {
    console.error("Error listing deals:", error);
    throw error;
  }
}
