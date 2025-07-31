"use server";

import { db } from "../db";
import { properties, propertyImages } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Property, PropertyImage } from "../../lib/data";

// Type for database property with correct boolean conversion
type DbProperty = Omit<Property, 'builtInWardrobes'> & {
  builtInWardrobes?: boolean;
};
import { retrieveCadastralData } from "../cadastral/retrieve_cadastral";
import { createDefaultListing } from "./listing";
import { retrieveGeocodingData } from "../googlemaps/retrieve_geo";
import { getSecureDb } from "~/lib/dal";

// Generate a unique reference number
export async function generateReferenceNumber(): Promise<string> {
  try {
    const { db: secureDb, accountId } = await getSecureDb();

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Get the count of properties for this year within this account
    const [result] = await secureDb
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(
        and(
          eq(properties.accountId, BigInt(accountId)),
          sql`YEAR(${properties.createdAt}) = ${currentYear}`,
        ),
      );

    const count = result?.count ?? 0;

    // Format: VESTA-YYYY-XXXXXX (e.g., VESTA-2024-000001)
    const referenceNumber = `VESTA${currentYear}${String(count + 1).padStart(6, "0")}`;

    return referenceNumber;
  } catch (error) {
    console.error("Error generating reference number:", error);
    // Fallback: timestamp-based reference
    const timestamp = Date.now();
    return `VESTA-${timestamp}`;
  }
}

// Create a new property
export async function createProperty(
  data: Omit<
    DbProperty,
    | "propertyId"
    | "accountId"
    | "createdAt"
    | "updatedAt"
    | "formPosition"
    | "referenceNumber"
  >,
) {
  try {
    const { db: secureDb, accountId } = await getSecureDb();

    // Generate a unique reference number
    const referenceNumber = await generateReferenceNumber();

    const [result] = await secureDb
      .insert(properties)
      .values({
        ...data,
        accountId: BigInt(accountId),
        referenceNumber,
      })
      .$returningId();
    if (!result) throw new Error("Failed to create property");

    const [newProperty] = await secureDb
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(result.propertyId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );
    return newProperty;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

// Get property by ID
export async function getPropertyById(propertyId: number) {
  try {
    const { db: secureDb, withAccountFilter } = await getSecureDb();

    const [property] = await secureDb
      .select()
      .from(properties)
      .where(
        withAccountFilter(
          properties,
          eq(properties.propertyId, BigInt(propertyId)),
        ),
      );
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

// Get properties by form position (useful for finding incomplete forms)
export async function getPropertiesByFormPosition(formPosition: number) {
  try {
    const propertiesList = await db
      .select()
      .from(properties)
      .where(eq(properties.formPosition, formPosition));
    return propertiesList;
  } catch (error) {
    console.error("Error fetching properties by form position:", error);
    throw error;
  }
}

// Update property
export async function updateProperty(
  propertyId: number,
  data: Omit<
    Partial<DbProperty>,
    "propertyId" | "createdAt" | "updatedAt" | "referenceNumber"
  >,
) {
  try {
    await db
      .update(properties)
      .set(data)
      .where(eq(properties.propertyId, BigInt(propertyId)));
    const [updatedProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return updatedProperty;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

// Update form position for a property
export async function updatePropertyFormPosition(
  propertyId: number,
  formPosition: number,
) {
  try {
    await db
      .update(properties)
      .set({ formPosition })
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return { success: true };
  } catch (error) {
    console.error("Error updating property form position:", error);
    throw error;
  }
}

// Soft delete property (set isActive to false)
export async function softDeleteProperty(propertyId: number) {
  try {
    await db
      .update(properties)
      .set({ isActive: false })
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting property:", error);
    throw error;
  }
}

// Hard delete property (remove from database)
export async function deleteProperty(propertyId: number) {
  try {
    await db
      .delete(properties)
      .where(eq(properties.propertyId, BigInt(propertyId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
}

// List all properties (with pagination and optional filters)
export async function listProperties(
  page = 1,
  limit = 10,
  filters?: {
    propertyType?: string;
    propertySubtype?: string;
    neighborhoodId?: number;
    bedrooms?: number;
    minSquareMeter?: number;
    maxSquareMeter?: number;
    isActive?: boolean;
  },
) {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.propertyType) {
        whereConditions.push(eq(properties.propertyType, filters.propertyType));
      }
      if (filters.propertySubtype) {
        whereConditions.push(
          eq(properties.propertySubtype, filters.propertySubtype),
        );
      }
      if (filters.neighborhoodId) {
        whereConditions.push(
          eq(properties.neighborhoodId, BigInt(filters.neighborhoodId)),
        );
      }
      if (filters.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }
      if (filters.minSquareMeter) {
        whereConditions.push(
          sql`${properties.squareMeter} >= ${filters.minSquareMeter}`,
        );
      }
      if (filters.maxSquareMeter) {
        whereConditions.push(
          sql`${properties.squareMeter} <= ${filters.maxSquareMeter}`,
        );
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(properties.isActive, filters.isActive));
      }
    } else {
      // By default, only show active properties
      whereConditions.push(eq(properties.isActive, true));
    }

    // Create the base query
    const query = db.select().from(properties);

    // Apply all where conditions at once
    const filteredQuery =
      whereConditions.length > 0 ? query.where(and(...whereConditions)) : query;

    // Apply pagination
    const allProperties = await filteredQuery.limit(limit).offset(offset);

    return allProperties;
  } catch (error) {
    console.error("Error listing properties:", error);
    throw error;
  }
}

// Property Images CRUD operations
export async function addPropertyImage(
  data: Omit<
    PropertyImage,
    "propertyImageId" | "createdAt" | "updatedAt" | "referenceNumber"
  >,
) {
  try {
    // Get the property to get its reference number
    const [property] = await db
      .select({ referenceNumber: properties.referenceNumber })
      .from(properties)
      .where(eq(properties.propertyId, data.propertyId));

    if (!property?.referenceNumber) {
      throw new Error("Property not found or reference number is null");
    }

    const [result] = await db
      .insert(propertyImages)
      .values({
        ...data,
        referenceNumber: property.referenceNumber,
      })
      .$returningId();
    if (!result) throw new Error("Failed to add property image");
    const [newImage] = await db
      .select()
      .from(propertyImages)
      .where(
        eq(propertyImages.propertyImageId, BigInt(result.propertyImageId)),
      );
    return newImage;
  } catch (error) {
    console.error("Error adding property image:", error);
    throw error;
  }
}

export async function getPropertyImages(propertyId: number) {
  try {
    const images = await db
      .select()
      .from(propertyImages)
      .where(
        and(
          eq(propertyImages.propertyId, BigInt(propertyId)),
          eq(propertyImages.isActive, true),
        ),
      );
    return images;
  } catch (error) {
    console.error("Error fetching property images:", error);
    throw error;
  }
}

export async function deletePropertyImage(imageId: number) {
  try {
    await db
      .delete(propertyImages)
      .where(eq(propertyImages.propertyImageId, BigInt(imageId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting property image:", error);
    throw error;
  }
}

// Create a property with minimal data (just cadastral reference)
export async function createPropertyFromCadastral(cadastralReference: string) {
  try {
    // First, retrieve cadastral data from the API
    const cadastralData = await retrieveCadastralData(cadastralReference);

    // Generate a unique reference number
    const referenceNumber = await generateReferenceNumber();


    // Get secure database access
    const { db: secureDb, accountId } = await getSecureDb();

    // Create property with cadastral data and sensible defaults
    const propertyData = {
      cadastralReference,
      referenceNumber,
      accountId: BigInt(accountId),
      propertyType: cadastralData?.propertyType ?? ("piso" as const),
      propertySubtype: undefined, // Will be set by user in form
      formPosition: 1, // Starting form position
      hasHeating: false,
      hasElevator: false,
      hasGarage: false,
      hasStorageRoom: false,
      isActive: false,
      // Add cadastral data if available
      ...(cadastralData && {
        street: cadastralData.street,
        addressDetails: cadastralData.addressDetails,
        squareMeter: cadastralData.squareMeter,
        builtSurfaceArea: cadastralData.builtSurfaceArea.toString(),
        yearBuilt: cadastralData.yearBuilt,
        postalCode: cadastralData.postalCode,
        ...(cadastralData.latitude && { latitude: cadastralData.latitude }),
        ...(cadastralData.longitude && { longitude: cadastralData.longitude }),
        ...(cadastralData.neighborhoodId && {
          neighborhoodId: BigInt(cadastralData.neighborhoodId),
        }),
      }),
    };

    const [result] = await secureDb
      .insert(properties)
      .values(propertyData)
      .$returningId();

    if (!result) throw new Error("Failed to create property");

    const [newProperty] = await secureDb
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(result.propertyId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!newProperty) throw new Error("Failed to retrieve created property");

    // Create a default listing for the new property and get the listing ID
    const newListing = await createDefaultListing(
      Number(newProperty.propertyId),
    );

    if (!newListing) throw new Error("Failed to create default listing");

    return {
      ...newProperty,
      // Add location data from cadastral for form population
      city: cadastralData?.city,
      province: cadastralData?.province,
      municipality: cadastralData?.municipality,
      neighborhood: cadastralData?.neighborhood,
      // Add the listing ID for redirection
      listingId: Number(newListing.listingId),
    };
  } catch (error) {
    console.error("Error creating property from cadastral:", error);
    throw error;
  }
}

// Create a property from manual location data
export async function createPropertyFromLocation(locationData: {
  street: string;
  addressDetails?: string;
  postalCode: string;
  city?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
  propertyType?: string;
}) {
  try {
    // First, retrieve geocoding data from the address
    const fullAddress =
      `${locationData.street}, ${locationData.postalCode}, ${locationData.city ?? ""}, ${locationData.province ?? ""}`.trim();
    const geocodingData = await retrieveGeocodingData(fullAddress);

    // Generate a unique reference number
    const referenceNumber = await generateReferenceNumber();

    // Get secure database access
    const { db: secureDb, accountId } = await getSecureDb();

    // Create property with location data and sensible defaults (similar to cadastral version)
    const propertyData = {
      referenceNumber,
      accountId: BigInt(accountId),
      propertyType: locationData.propertyType ?? ("piso" as const),
      propertySubtype: undefined, // Will be set by user in form
      formPosition: 1, // Starting form position
      hasHeating: false,
      hasElevator: false,
      hasGarage: false,
      hasStorageRoom: false,
      isActive: false,
      // Add location data
      street: locationData.street,
      addressDetails: locationData.addressDetails ?? "",
      postalCode: locationData.postalCode,
      // Add geocoding data if available
      ...(geocodingData && {
        latitude: geocodingData.latitude,
        longitude: geocodingData.longitude,
        ...(geocodingData.neighborhoodId && {
          neighborhoodId: BigInt(geocodingData.neighborhoodId),
        }),
      }),
    };

    const [result] = await secureDb
      .insert(properties)
      .values(propertyData)
      .$returningId();

    if (!result) throw new Error("Failed to create property");

    const [newProperty] = await secureDb
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.propertyId, BigInt(result.propertyId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!newProperty) throw new Error("Failed to retrieve created property");

    // Create a default listing for the new property and get the listing ID
    const newListing = await createDefaultListing(
      Number(newProperty.propertyId),
    );

    if (!newListing) throw new Error("Failed to create default listing");

    return {
      ...newProperty,
      // Add location data from geocoding for form population
      city: geocodingData?.city ?? locationData.city,
      province: geocodingData?.province ?? locationData.province,
      municipality: geocodingData?.municipality ?? locationData.municipality,
      neighborhood: geocodingData?.neighborhood ?? locationData.neighborhood,
      // Add the listing ID for redirection
      listingId: Number(newListing.listingId),
    };
  } catch (error) {
    console.error("Error creating property from location:", error);
    throw error;
  }
}

// Update property location with auto-completion data
export async function updatePropertyLocation(
  propertyId: number,
  locationData: {
    street: string;
    addressDetails: string;
    postalCode: string;
    city: string;
    province: string;
    municipality: string;
    neighborhood: string;
  },
) {
  try {
    // Import findOrCreateLocation here to avoid client-side bundling
    const { findOrCreateLocation } = await import("./locations");

    let neighborhoodId: number | undefined;

    // Create/update location record if we have complete location data
    if (
      locationData.city &&
      locationData.province &&
      locationData.municipality &&
      locationData.neighborhood
    ) {
      try {
        neighborhoodId = await findOrCreateLocation({
          city: locationData.city,
          province: locationData.province,
          municipality: locationData.municipality,
          neighborhood: locationData.neighborhood,
        });
      } catch (error) {
        console.error("Error creating/updating location:", error);
        // Continue without neighborhoodId if there's an error
      }
    }

    // Update property with address details and neighborhoodId if available
    const updateData: Record<string, unknown> = {
      formPosition: 4,
      street: locationData.street,
      addressDetails: locationData.addressDetails,
      postalCode: locationData.postalCode,
    };

    // Add neighborhoodId if we have one
    if (neighborhoodId) {
      updateData.neighborhoodId = BigInt(neighborhoodId);
    }

    await updateProperty(
      propertyId,
      updateData as Omit<
        Partial<DbProperty>,
        "propertyId" | "createdAt" | "updatedAt" | "referenceNumber"
      >,
    );

    return { success: true, neighborhoodId };
  } catch (error) {
    console.error("Error updating property location:", error);
    throw error;
  }
}
