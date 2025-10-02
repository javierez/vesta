"use server";

import { db } from "~/server/db";
import {
  prospects,
  listings,
  properties,
  locations,
  listingContacts,
  contacts,
} from "~/server/db/schema";
import { eq, and, gte, lte, ne, isNull, or, sql } from "drizzle-orm";
import { getCurrentUserAccountId } from "~/lib/dal";
import type {
  MatchQueryParams,
  MatchResults,
  ProspectMatch,
  ToleranceResult,
  MatchFilters,
} from "~/types/connection-matches";

// Auth wrapper functions following the established pattern
export async function getMatchesForProspectsWithAuth(
  params: Omit<MatchQueryParams, "accountId">,
) {
  console.log("🔐 Auth wrapper called with params:", params);
  const accountId = await getCurrentUserAccountId();
  console.log("👤 Current account ID:", accountId);
  return getMatchesForProspects({ ...params, accountId: BigInt(accountId) });
}

// Helper function to calculate tolerance
function calculateTolerance(
  value: number,
  originalMin: number | null,
  originalMax: number | null,
): ToleranceResult {
  if (originalMin === null && originalMax === null) {
    return {
      isWithinOriginal: true,
      isWithinTolerance: true,
      percentageDifference: 0,
    };
  }

  let isWithinOriginal = true;
  let isWithinTolerance = true;
  let percentageDifference = 0;
  let reason: string | undefined;

  // Check against minimum
  if (originalMin !== null && value < originalMin) {
    isWithinOriginal = false;
    percentageDifference = ((originalMin - value) / originalMin) * 100;
    const tolerance = originalMin * 0.95; // 5% tolerance
    isWithinTolerance = value >= tolerance;
    reason = `Price -${percentageDifference.toFixed(1)}%`;
  }

  // Check against maximum
  if (originalMax !== null && value > originalMax) {
    isWithinOriginal = false;
    percentageDifference = ((value - originalMax) / originalMax) * 100;
    const tolerance = originalMax * 1.05; // 5% tolerance
    isWithinTolerance = value <= tolerance;
    reason = `Price +${percentageDifference.toFixed(1)}%`;
  }

  return {
    isWithinOriginal,
    isWithinTolerance,
    percentageDifference,
    reason,
  };
}

// Helper function to parse preferred areas JSON
function parsePreferredAreas(
  preferredAreas: unknown,
): Array<{ neighborhoodId: number; name: string }> {
  if (!preferredAreas) return [];

  try {
    if (Array.isArray(preferredAreas)) {
      return (
        preferredAreas as Array<{ neighborhoodId: number; name: string }>
      ).filter(
        (area) =>
          area &&
          typeof area === "object" &&
          "neighborhoodId" in area &&
          "name" in area,
      );
    }

    if (typeof preferredAreas === "string") {
      const parsed = JSON.parse(preferredAreas) as unknown;
      if (Array.isArray(parsed)) {
        return (
          parsed as Array<{ neighborhoodId: number; name: string }>
        ).filter(
          (area) =>
            area &&
            typeof area === "object" &&
            "neighborhoodId" in area &&
            "name" in area,
        );
      }
    }
  } catch (error) {
    console.error("Error parsing preferred areas:", error);
  }

  return [];
}

// Helper function to check feature requirements
// IMPORTANT: Prospects set MINIMUM requirements - listings can have MORE features
function checkFeatureRequirements(
  prospectExtras: unknown,
  listingFeatures: {
    hasElevator: boolean | null;
    hasGarage: boolean | null;
    hasStorageRoom: boolean | null;
    terrace: boolean | null;
  },
): boolean {
  if (!prospectExtras) return true; // No requirements = all listings match

  try {
    const extras =
      typeof prospectExtras === "string"
        ? (JSON.parse(prospectExtras) as unknown)
        : prospectExtras;

    if (!extras || typeof extras !== "object") return true;

    const extrasTyped = extras as Record<string, unknown>;

    // Only check if prospect REQUIRES a feature - if listing has MORE features, that's GOOD!
    // Only reject if prospect specifically REQUIRES something and listing doesn't have it
    if (extrasTyped.elevator === true && listingFeatures.hasElevator === false)
      return false;
    if (extrasTyped.garage === true && listingFeatures.hasGarage === false)
      return false;
    if (
      extrasTyped.storage === true &&
      listingFeatures.hasStorageRoom === false
    )
      return false;
    if (extrasTyped.terrace === true && listingFeatures.terrace === false)
      return false;

    // If listing has extra features that prospect didn't ask for, that's a BONUS!
    return true;
  } catch (error) {
    console.error("Error checking feature requirements:", error);
    return true; // Default to allowing match if extras can't be parsed
  }
}

// Complex matching query with tolerance calculations
export async function getMatchesForProspects(
  params: MatchQueryParams & { accountId: bigint },
): Promise<MatchResults> {
  const { filters, pagination, accountId } = params;

  console.log("🎯 getMatchesForProspects called:", {
    filters,
    pagination,
    accountId: accountId.toString(),
  });

  try {
    // CRITICAL: Build dynamic WHERE clauses for exact matching
    const baseQuery = db
      .select({
        // Prospect fields
        prospectId: prospects.id,
        prospectContactId: prospects.contactId,
        prospectStatus: prospects.status,
        prospectListingType: prospects.listingType,
        prospectPropertyType: prospects.propertyType,
        prospectMinPrice: prospects.minPrice,
        prospectMaxPrice: prospects.maxPrice,
        prospectMinBedrooms: prospects.minBedrooms,
        prospectMinBathrooms: prospects.minBathrooms,
        prospectMinSquareMeters: prospects.minSquareMeters,
        prospectMaxSquareMeters: prospects.maxSquareMeters,
        prospectPreferredAreas: prospects.preferredAreas,
        prospectExtras: prospects.extras,
        prospectUrgencyLevel: prospects.urgencyLevel,
        prospectFundingReady: prospects.fundingReady,
        prospectNotesInternal: prospects.notesInternal,
        prospectCreatedAt: prospects.createdAt,
        prospectUpdatedAt: prospects.updatedAt,

        // Prospect contact fields
        prospectContactFirstName: sql<string>`pc.first_name`,
        prospectContactLastName: sql<string>`pc.last_name`,
        prospectContactEmail: sql<string>`pc.email`,
        prospectContactPhone: sql<string>`pc.phone`,
        prospectContactAccountId: sql<bigint>`pc.account_id`,
        prospectContactAdditionalInfo: sql<unknown>`pc.additional_info`,
        prospectContactOrgId: sql<bigint>`pc.org_id`,
        prospectContactIsActive: sql<boolean>`pc.is_active`,
        prospectContactCreatedAt: sql<Date>`pc.created_at`,
        prospectContactUpdatedAt: sql<Date>`pc.updated_at`,

        // Listing + Property fields (flattened for performance)
        listingId: listings.listingId,
        listingPrice: listings.price,
        listingType: listings.listingType,
        listingAccountId: listings.accountId,
        listingStatus: listings.status,
        listingCreatedAt: listings.createdAt,
        listingUpdatedAt: listings.updatedAt,

        // Property fields
        propertyId: properties.propertyId,
        propertyType: properties.propertyType,
        propertyTitle: properties.title,
        propertyBedrooms: properties.bedrooms,
        propertyBathrooms: properties.bathrooms,
        propertySquareMeters: properties.squareMeter,
        propertyNeighborhoodId: properties.neighborhoodId,

        // Location fields
        neighborhoodName: locations.neighborhood,
        municipality: locations.municipality,
        city: locations.city,
        province: locations.province,

        // Owner contact fields
        ownerContactId: contacts.contactId,
        ownerFirstName: contacts.firstName,
        ownerLastName: contacts.lastName,
        ownerEmail: contacts.email,
        ownerPhone: contacts.phone,

        // Property features for must-have matching
        hasElevator: properties.hasElevator,
        hasGarage: properties.hasGarage,
        hasStorageRoom: properties.hasStorageRoom,
        terrace: properties.terrace,
      })
      .from(prospects)
      // Join with prospect contacts (aliased as pc)
      .innerJoin(sql`contacts pc`, eq(prospects.contactId, sql`pc.contact_id`))
      .innerJoin(
        listings,
        and(
          // LISTING TYPE MATCHING: Flexible upward matching
          // Rent seekers can get RentWithOption (upgrade), but RentWithOption seekers only get RentWithOption
          // Sale must match exactly
          or(
            // Exact match always works
            eq(prospects.listingType, listings.listingType),
            // Rent seekers can get RentWithOption (upgrade)
            and(
              eq(prospects.listingType, "Rent"),
              eq(listings.listingType, "RentWithOption"),
            ),
          ),

          // ACCOUNT SCOPE: Current account or cross-account based on filters
          filters.accountScope === "current"
            ? eq(listings.accountId, accountId)
            : ne(listings.status, "Draft"), // Active listings only for cross-account

          // STATUS: Only active listings
          eq(listings.isActive, true),
          ne(listings.status, "Draft"),
        ),
      )
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(
        listingContacts,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listingContacts.contactType, "owner"),
          eq(listingContacts.isActive, true),
        ),
      )
      .leftJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          // Ensure prospect belongs to current account
          eq(sql`pc.account_id`, accountId),

          // PROPERTY TYPE MATCHING: Flexible upward matching
          // piso seekers can get casa (upgrade), but casa seekers only get casa
          // local and garaje must match exactly
          or(
            // Exact match always works
            eq(prospects.propertyType, properties.propertyType),
            // piso seekers can get casa (upgrade)
            and(
              eq(prospects.propertyType, "piso"),
              eq(properties.propertyType, "casa"),
            ),
          ),

          // MINIMUM REQUIREMENTS: Listings can have MORE bedrooms/bathrooms than requested (that's better!)
          // Only reject if listing has FEWER than the minimum required
          or(
            isNull(prospects.minBedrooms),
            gte(properties.bedrooms, prospects.minBedrooms),
          ),
          or(
            isNull(prospects.minBathrooms),
            gte(
              sql`CAST(${properties.bathrooms} AS DECIMAL(3,1))`,
              sql`CAST(${prospects.minBathrooms} AS DECIMAL(3,1))`,
            ),
          ),

          // PRICE TOLERANCE: ±5% expansion of prospect budget
          or(
            isNull(prospects.minPrice),
            gte(
              sql`CAST(${listings.price} AS DECIMAL(12,2))`,
              sql`CAST(${prospects.minPrice} AS DECIMAL(12,2)) * 0.95`,
            ),
          ),
          or(
            isNull(prospects.maxPrice),
            lte(
              sql`CAST(${listings.price} AS DECIMAL(12,2))`,
              sql`CAST(${prospects.maxPrice} AS DECIMAL(12,2)) * 1.05`,
            ),
          ),

          // AREA TOLERANCE: ±5% expansion if specified
          or(
            isNull(prospects.minSquareMeters),
            gte(
              properties.squareMeter,
              sql`${prospects.minSquareMeters} * 0.95`,
            ),
          ),
          or(
            isNull(prospects.maxSquareMeters),
            lte(
              properties.squareMeter,
              sql`${prospects.maxSquareMeters} * 1.05`,
            ),
          ),

          // PROSPECT-SPECIFIC FILTERS from URL parameters
          // Filter by prospect types (if specified)
          ...(filters.prospectTypes && filters.prospectTypes.length > 0
            ? [
                or(
                  ...filters.prospectTypes.map(
                    (type) =>
                      type === "search"
                        ? eq(prospects.listingType, "Rent")
                        : type === "listing"
                          ? eq(prospects.listingType, "Sale")
                          : sql`1=0`, // Invalid type
                  ),
                ),
              ]
            : []),

          // Filter by listing types (if specified)
          ...(filters.listingTypes && filters.listingTypes.length > 0
            ? [
                or(
                  ...filters.listingTypes.map((type) =>
                    eq(prospects.listingType, type),
                  ),
                ),
              ]
            : []),

          // Filter by prospect status (if specified)
          ...(filters.statuses && filters.statuses.length > 0
            ? [
                or(
                  ...filters.statuses.map((status) =>
                    eq(prospects.status, status),
                  ),
                ),
              ]
            : []),

          // Filter by urgency level (if specified)
          ...(filters.urgencyLevels && filters.urgencyLevels.length > 0
            ? [
                or(
                  ...filters.urgencyLevels.map((level) =>
                    eq(prospects.urgencyLevel, parseInt(level, 10)),
                  ),
                ),
              ]
            : []),
        ),
      );

    // EXECUTE the base query
    const rawResults = await baseQuery;

    console.log("📊 Raw SQL results count:", rawResults.length);
    console.log(
      "🔍 First raw result sample:",
      rawResults[0]
        ? JSON.stringify(
            rawResults[0] as Record<string, unknown>,
            (key, value) =>
              typeof value === "bigint" ? value.toString() : (value as string),
            2,
          )
        : "No results",
    );

    // CRITICAL: Post-process for location and feature matching, tolerance classification
    const processedMatches: ProspectMatch[] = [];

    for (const result of rawResults) {
      // Check location matching
      const preferredAreas = parsePreferredAreas(result.prospectPreferredAreas);
      const isLocationMatch =
        preferredAreas.length === 0 ||
        preferredAreas.some(
          (area) =>
            area.neighborhoodId === Number(result.propertyNeighborhoodId),
        );

      if (!isLocationMatch) continue;

      // Check feature requirements
      const featureMatch = checkFeatureRequirements(result.prospectExtras, {
        hasElevator: result.hasElevator,
        hasGarage: result.hasGarage,
        hasStorageRoom: result.hasStorageRoom,
        terrace: result.terrace,
      });

      if (!featureMatch) continue;

      // Calculate tolerance for price and area
      const toleranceReasons: string[] = [];
      let matchType: "strict" | "near-strict" = "strict";

      const listingPrice = parseFloat(result.listingPrice);
      const originalMinPrice = result.prospectMinPrice
        ? parseFloat(result.prospectMinPrice)
        : null;
      const originalMaxPrice = result.prospectMaxPrice
        ? parseFloat(result.prospectMaxPrice)
        : null;

      const priceToleranceResult = calculateTolerance(
        listingPrice,
        originalMinPrice,
        originalMaxPrice,
      );

      if (
        !priceToleranceResult.isWithinOriginal &&
        priceToleranceResult.reason
      ) {
        toleranceReasons.push(priceToleranceResult.reason);
        matchType = "near-strict";
      }

      // Area tolerance calculation
      if (result.propertySquareMeters) {
        const originalMinArea = result.prospectMinSquareMeters;
        const originalMaxArea = result.prospectMaxSquareMeters;
        const propertyArea = result.propertySquareMeters;

        const areaToleranceResult = calculateTolerance(
          propertyArea,
          originalMinArea,
          originalMaxArea,
        );

        if (
          !areaToleranceResult.isWithinOriginal &&
          areaToleranceResult.reason
        ) {
          const areaReason = areaToleranceResult.reason.replace(
            "Price",
            "Area",
          );
          toleranceReasons.push(areaReason);
          matchType = "near-strict";
        }
      }

      // Skip near-strict matches if not included in filters
      if (matchType === "near-strict" && !filters.includeNearStrict) {
        continue;
      }

      // Create ProspectMatch object
      const prospectMatch: ProspectMatch = {
        prospectId: result.prospectId,
        listingId: result.listingId,
        listingAccountId: result.listingAccountId,
        matchType,
        toleranceReasons,
        prospect: {
          prospects: {
            id: result.prospectId,
            contactId: result.prospectContactId,
            status: result.prospectStatus,
            listingType: result.prospectListingType,
            propertyType: result.prospectPropertyType,
            minPrice: result.prospectMinPrice,
            maxPrice: result.prospectMaxPrice,
            preferredAreas: result.prospectPreferredAreas,
            minBedrooms: result.prospectMinBedrooms,
            minBathrooms: result.prospectMinBathrooms,
            minSquareMeters: result.prospectMinSquareMeters,
            maxSquareMeters: result.prospectMaxSquareMeters,
            moveInBy: null, // Not included in this query
            extras: result.prospectExtras,
            urgencyLevel: result.prospectUrgencyLevel,
            fundingReady: result.prospectFundingReady,
            notesInternal: result.prospectNotesInternal,
            createdAt: result.prospectCreatedAt,
            updatedAt: result.prospectUpdatedAt,
          },
          contacts: {
            contactId: result.prospectContactId,
            accountId: result.prospectContactAccountId,
            firstName: result.prospectContactFirstName,
            lastName: result.prospectContactLastName,
            email: result.prospectContactEmail,
            phone: result.prospectContactPhone,
            additionalInfo: result.prospectContactAdditionalInfo,
            orgId: result.prospectContactOrgId,
            isActive: result.prospectContactIsActive,
            createdAt: result.prospectContactCreatedAt,
            updatedAt: result.prospectContactUpdatedAt,
          },
        },
        listing: {
          listings: {
            id: result.listingId,
            listingType: result.listingType,
            price: result.listingPrice,
            status: result.listingStatus,
            prospectStatus: null, // This field is not available in connection-matches query
            createdAt: result.listingCreatedAt,
            updatedAt: result.listingUpdatedAt,
          },
          properties: {
            id: result.propertyId,
            propertyType: result.propertyType,
            title: result.propertyTitle,
            bedrooms: result.propertyBedrooms,
            bathrooms: result.propertyBathrooms
              ? parseFloat(result.propertyBathrooms)
              : null,
            squareMeter: result.propertySquareMeters,
          },
          locations: {
            neighborhood: result.neighborhoodName ?? "Sin especificar",
          },
          ownerContact: result.ownerContactId
            ? {
                contactId: result.ownerContactId,
                firstName: result.ownerFirstName ?? "",
                lastName: result.ownerLastName ?? "",
                email: result.ownerEmail,
                phone: result.ownerPhone,
              }
            : null,
        },
        priceMatch: priceToleranceResult.isWithinOriginal
          ? "exact"
          : priceToleranceResult.isWithinTolerance
            ? "tolerance"
            : "out-of-range",
        areaMatch: "exact", // Simplified for now
        isCrossAccount:
          result.listingAccountId.toString() !== accountId.toString(),
        canContact: result.listingAccountId.toString() === accountId.toString(),
        // Initialize lead info - will be populated in batch query below
        hasExistingLead: false,
        existingLead: undefined,
      };

      processedMatches.push(prospectMatch);
    }

    // BATCH QUERY: Check for existing leads for all matches
    if (processedMatches.length > 0) {
      console.log("🔍 Checking for existing leads for", processedMatches.length, "matches");
      
      // Get all prospect-listing pairs to check
      const matchPairs = processedMatches.map(match => ({
        prospectId: match.prospectId,
        listingId: match.listingId,
      }));

      // Query all existing leads in batch
      const existingLeads = await db
        .select({
          prospectId: listingContacts.prospectId,
          listingId: listingContacts.listingId,
          listingContactId: listingContacts.listingContactId,
          status: listingContacts.status,
          createdAt: listingContacts.createdAt,
        })
        .from(listingContacts)
        .innerJoin(prospects, eq(listingContacts.prospectId, prospects.id))
        .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
        .where(
          and(
            eq(listingContacts.contactType, "buyer"),
            eq(listingContacts.isActive, true),
            eq(contacts.accountId, accountId),
            or(
              ...matchPairs.map(pair => 
                and(
                  eq(listingContacts.prospectId, pair.prospectId),
                  eq(listingContacts.listingId, pair.listingId)
                )
              )
            )
          ),
        );

      console.log("📊 Found", existingLeads.length, "existing leads");

      // Create a map for quick lookup
      const leadMap = new Map<string, typeof existingLeads[0]>();
      
      existingLeads.forEach(lead => {
        if (lead.prospectId !== null && lead.listingId !== null) {
          const key = `${lead.prospectId.toString()}-${lead.listingId.toString()}`;
          leadMap.set(key, lead);
        }
      });

      // Update matches with lead information
      processedMatches.forEach(match => {
        const key = `${match.prospectId.toString()}-${match.listingId.toString()}`;
        const existingLead = leadMap.get(key);
        
        if (existingLead) {
          match.hasExistingLead = true;
          match.existingLead = {
            listingContactId: existingLead.listingContactId,
            status: existingLead.status ?? "Cita Pendiente",
            createdAt: existingLead.createdAt,
          };
        }
      });
    }

    // PAGINATION: Apply offset and limit
    const paginatedMatches = processedMatches.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    );

    console.log("✅ Final processed matches:", processedMatches.length);
    console.log("📄 Paginated matches:", paginatedMatches.length);
    console.log("🎯 Returning result:", {
      matchesCount: paginatedMatches.length,
      totalCount: processedMatches.length,
      hasNextPage:
        processedMatches.length > pagination.offset + pagination.limit,
    });

    return {
      matches: paginatedMatches,
      totalCount: processedMatches.length,
      hasNextPage:
        processedMatches.length > pagination.offset + pagination.limit,
      filters,
    };
  } catch (error) {
    console.error("Error in getMatchesForProspects:", error);
    throw new Error("Failed to fetch prospect matches");
  }
}

// Helper function to get a single prospect's matches
export async function getMatchesForSingleProspectWithAuth(
  prospectId: bigint,
  filters?: Partial<MatchFilters>,
) {
  const defaultFilters: MatchFilters = {
    accountScope: "current",
    includeNearStrict: true,
    propertyTypes: [],
    locationIds: [],
    ...filters,
  };

  return getMatchesForProspectsWithAuth({
    prospectIds: [prospectId],
    filters: defaultFilters,
    pagination: { offset: 0, limit: 50 },
  });
}

// Action functions for save/dismiss/contact
export async function saveMatchWithAuth(
  _prospectId: bigint,
  _listingId: bigint,
) {
  // TODO: Implement saving match logic
  // This would create a saved match record in a new table
  return { success: true, message: "Match saved successfully" };
}

export async function dismissMatchWithAuth(
  prospectId: bigint,
  listingId: bigint,
) {
  console.log("🗑️ Dismissing lead for match:", { prospectId, listingId });
  const accountId = await getCurrentUserAccountId();
  
  try {
    // Find the existing lead (listing_contact with buyer type) for this prospect-listing pair
    const [existingLead] = await db
      .select({ 
        listingContactId: listingContacts.listingContactId,
        contactId: listingContacts.contactId,
      })
      .from(listingContacts)
      .innerJoin(prospects, eq(listingContacts.prospectId, prospects.id))
      .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .where(
        and(
          eq(prospects.id, prospectId),
          eq(listingContacts.listingId, listingId),
          eq(listingContacts.contactType, "buyer"),
          eq(listingContacts.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!existingLead) {
      return { 
        success: false, 
        message: "No se encontró ningún lead para descartar" 
      };
    }

    // Delete the listing_contact record (this removes the lead)
    await db
      .delete(listingContacts)
      .where(eq(listingContacts.listingContactId, existingLead.listingContactId));

    console.log("✅ Lead dismissed successfully:", existingLead.listingContactId);
    return { 
      success: true, 
      message: "Lead descartado exitosamente" 
    };
  } catch (error) {
    console.error("❌ Error dismissing lead:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Error al descartar lead" 
    };
  }
}

export async function contactMatchWithAuth(
  _prospectId: bigint,
  _listingId: bigint,
) {
  // TODO: Implement contact logic
  // This would create a contact request or initiate contact
  return { success: true, message: "Contact initiated successfully" };
}

// Create a lead from a prospect-listing match
export async function createLeadFromMatchWithAuth(
  prospectId: bigint,
  listingId: bigint,
) {
  console.log("🔐 Creating lead from match:", { prospectId, listingId });
  const accountId = await getCurrentUserAccountId();
  
  try {
    // Get the prospect's contact ID
    const [prospect] = await db
      .select({ contactId: prospects.contactId })
      .from(prospects)
      .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .where(
        and(
          eq(prospects.id, prospectId),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!prospect) {
      throw new Error("Prospect not found or access denied");
    }

    // Check if lead already exists
    const [existingLead] = await db
      .select({ listingContactId: listingContacts.listingContactId })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, prospect.contactId),
          eq(listingContacts.listingId, listingId),
          eq(listingContacts.contactType, "buyer"),
          eq(listingContacts.isActive, true),
        ),
      );

    if (existingLead) {
      return { 
        success: false, 
        message: "Ya existe un lead para esta combinación de prospecto y propiedad" 
      };
    }

    // Create the lead
    const leadData = {
      contactId: prospect.contactId,
      listingId: listingId,
      contactType: "buyer" as const,
      prospectId: prospectId,
      source: "Buscador",
      status: "Cita Pendiente",
      isActive: true,
    };

    const [result] = await db.insert(listingContacts).values(leadData).$returningId();
    
    if (!result) {
      throw new Error("Failed to create lead");
    }

    console.log("✅ Lead created successfully:", result);
    return { 
      success: true, 
      message: "Lead creado exitosamente",
      leadId: result.listingContactId,
    };
  } catch (error) {
    console.error("❌ Error creating lead from match:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Error creating lead" 
    };
  }
}

// Check if a lead already exists for a prospect-listing pair
export async function getExistingLeadForMatch(
  prospectId: bigint,
  listingId: bigint,
  accountId: bigint,
) {
  try {
    const [existingLead] = await db
      .select({
        listingContactId: listingContacts.listingContactId,
        status: listingContacts.status,
        createdAt: listingContacts.createdAt,
      })
      .from(listingContacts)
      .innerJoin(prospects, eq(listingContacts.prospectId, prospects.id))
      .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .where(
        and(
          eq(prospects.id, prospectId),
          eq(listingContacts.listingId, listingId),
          eq(listingContacts.contactType, "buyer"),
          eq(listingContacts.isActive, true),
          eq(contacts.accountId, accountId),
        ),
      );

    return existingLead ?? null;
  } catch (error) {
    console.error("Error checking existing lead:", error);
    return null;
  }
}
