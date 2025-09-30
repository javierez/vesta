"use server";

import { getPropertyImagesCount } from "~/server/queries/property_images";

export async function getPropertyImageCount(propertyId: bigint): Promise<number> {
  try {
    return await getPropertyImagesCount(propertyId);
  } catch (error) {
    console.error("Error fetching property image count:", error);
    return 0;
  }
}
