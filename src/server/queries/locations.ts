import { db } from "../db"
import { locations } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Interface for location data from geocoding
interface LocationData {
  city: string;
  province: string;
  municipality: string;
  neighborhood: string;
}

// Find existing location or create new one and return neighborhood ID
export async function findOrCreateLocation(locationData: LocationData): Promise<number> {
  try {
    const existingLocation = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.city, locationData.city),
          eq(locations.province, locationData.province),
          eq(locations.municipality, locationData.municipality),
          eq(locations.neighborhood, locationData.neighborhood)
        )
      )
      .limit(1);

    if (existingLocation.length > 0 && existingLocation[0]) {
      return Number(existingLocation[0].neighborhoodId);
    }

    await db
      .insert(locations)
      .values({
        city: locationData.city,
        province: locationData.province,
        municipality: locationData.municipality,
        neighborhood: locationData.neighborhood,
        isActive: true,
      });

    const [newLocation] = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.city, locationData.city),
          eq(locations.province, locationData.province),
          eq(locations.municipality, locationData.municipality),
          eq(locations.neighborhood, locationData.neighborhood)
        )
      )
      .limit(1);

    if (!newLocation) {
      throw new Error("Failed to create new location");
    }

    return Number(newLocation.neighborhoodId);

  } catch (error) {
    throw error;
  }
}

// Get location by neighborhood ID
export async function getLocationByNeighborhoodId(neighborhoodId: number) {
  try {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.neighborhoodId, BigInt(neighborhoodId)));
    return location;
  } catch (error) {
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
    throw error;
  }
}

// Check if location exists
export async function locationExists(locationData: LocationData): Promise<boolean> {
  try {
    const existingLocation = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.city, locationData.city),
          eq(locations.province, locationData.province),
          eq(locations.municipality, locationData.municipality),
          eq(locations.neighborhood, locationData.neighborhood)
        )
      )
      .limit(1);

    return existingLocation.length > 0;
  } catch (error) {
    throw error;
  }
} 