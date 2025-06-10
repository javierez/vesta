import { db } from "../db"
import { locations } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Location } from "../../lib/data";

// Create a new location
export async function createLocation(data: Omit<Location, "createdAt" | "updatedAt">) {
  try {
    await db.insert(locations).values({
      ...data,
      isActive: true,
    });
    
    const [newLocation] = await db
      .select()
      .from(locations)
      .where(eq(locations.neighborhoodId, data.neighborhoodId));
      
    if (!newLocation) throw new Error("Failed to create location");
    return newLocation;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
}

// Get location by neighborhood ID
export async function getLocationByNeighborhoodId(neighborhoodId: bigint) {
  try {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.neighborhoodId, neighborhoodId));
    return location;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw error;
  }
}

// Get location by neighborhood name
export async function getLocationByNeighborhood(neighborhood: string) {
  try {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.neighborhood, neighborhood));
    return location;
  } catch (error) {
    console.error("Error fetching location by neighborhood:", error);
    throw error;
  }
}

// Update location
export async function updateLocation(neighborhoodId: bigint, data: Omit<Partial<Location>, "neighborhoodId">) {
  try {
    await db
      .update(locations)
      .set(data)
      .where(eq(locations.neighborhoodId, neighborhoodId));
    const [updatedLocation] = await db
      .select()
      .from(locations)
      .where(eq(locations.neighborhoodId, neighborhoodId));
    return updatedLocation;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
}

// Delete location
export async function deleteLocation(neighborhoodId: bigint) {
  try {
    await db
      .delete(locations)
      .where(eq(locations.neighborhoodId, neighborhoodId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
}

// List all locations (with pagination)
export async function listLocations(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const allLocations = await db
      .select()
      .from(locations)
      .limit(limit)
      .offset(offset);
    return allLocations;
  } catch (error) {
    console.error("Error listing locations:", error);
    throw error;
  }
}

// Get locations by city
export async function getLocationsByCity(city: string) {
  try {
    const cityLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.city, city));
    return cityLocations;
  } catch (error) {
    console.error("Error fetching locations by city:", error);
    throw error;
  }
}

// Get locations by province
export async function getLocationsByProvince(province: string) {
  try {
    const provinceLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.province, province));
    return provinceLocations;
  } catch (error) {
    console.error("Error fetching locations by province:", error);
    throw error;
  }
}

// Get locations by municipality
export async function getLocationsByMunicipality(municipality: string) {
  try {
    const municipalityLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.municipality, municipality));
    return municipalityLocations;
  } catch (error) {
    console.error("Error fetching locations by municipality:", error);
    throw error;
  }
}
