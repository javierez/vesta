"use server";

import { revalidatePath } from "next/cache";
import { updateContactWithAuth } from "~/server/queries/contact";

export async function updateContactRating(
  contactId: number,
  rating: number | null,
) {
  try {
    await updateContactWithAuth(contactId, {
      rating: rating,
    });

    // Revalidate the contact page to show the updated rating
    revalidatePath(`/contactos/${contactId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating contact rating:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
