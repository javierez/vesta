"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { properties } from "~/server/db/schema";
import { getSecureSession } from "~/lib/dal";
import { revalidatePath } from "next/cache";

export async function updatePropertyTitle(
  propertyId: bigint,
  newTitle: string,
) {
  try {
    const session = await getSecureSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Validate title
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      throw new Error("Title cannot be empty");
    }

    if (trimmedTitle.length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    // Verify the property belongs to the user's account
    const [property] = await db
      .select({ accountId: properties.accountId })
      .from(properties)
      .where(eq(properties.propertyId, propertyId))
      .limit(1);

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.accountId !== BigInt(session.user.accountId)) {
      throw new Error("Access denied: Property belongs to different account");
    }

    // Update the property title
    await db
      .update(properties)
      .set({ title: trimmedTitle })
      .where(eq(properties.propertyId, propertyId));

    // Revalidate the property page to show the updated title
    revalidatePath(`/propiedades/${propertyId}`);

    return { success: true, title: trimmedTitle };
  } catch (error) {
    console.error("Error updating property title:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update title",
    };
  }
}
