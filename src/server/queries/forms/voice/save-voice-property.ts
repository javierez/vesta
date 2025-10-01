"use server";

import type { ExtractedFieldResult } from "~/types/textract-enhanced";
import { createProperty } from "~/server/queries/properties";
import { createDefaultListing } from "~/server/queries/listing";
import { getCurrentUser } from "~/lib/dal";
import { generatePropertyTitle } from "~/lib/property-title";
import { createPropertyTasksAsync } from "~/server/actions/property-tasks";

export interface SaveVoicePropertyResult {
  success: boolean;
  propertyId?: number;
  listingId?: number;
  error?: string;
}

/**
 * Creates a new property and listing from voice-extracted data
 * @param extractedFields Array of extracted fields from voice recording
 * @param contactIds Array of contact IDs to associate with the listing
 * @returns Object with success status and created IDs
 */
export async function saveVoiceProperty(
  extractedFields: ExtractedFieldResult[],
  contactIds: string[] = []
): Promise<SaveVoicePropertyResult> {
  try {
    console.log("=== SAVE VOICE PROPERTY CALLED ===");
    console.log("Total fields received:", extractedFields.length);
    
    // Get current user for agent assignment
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    // Build property data from extracted fields
    const propertyData: Record<string, unknown> = {
      // Set defaults
      isActive: true,
      formPosition: 1,
    };

    // Map extracted fields to property data
    extractedFields.forEach(field => {
      if (field.dbTable === "properties") {
        // Handle boolean conversions
        if (field.fieldType === "boolean") {
          propertyData[field.dbColumn] = Boolean(field.value);
        }
        // Handle number conversions
        else if (field.fieldType === "number" || field.fieldType === "decimal") {
          const numValue = typeof field.value === "string" 
            ? parseFloat(field.value) 
            : field.value;
          if (!isNaN(Number(numValue))) {
            propertyData[field.dbColumn] = numValue;
          }
        }
        // Handle string values
        else {
          propertyData[field.dbColumn] = String(field.value);
        }
      }
    });

    // Generate title from extracted property data
    const propertyType = propertyData.propertyType as string || "piso";
    const street = propertyData.street as string || "";
    const neighborhood = propertyData.neighborhood as string || "";
    
    // Auto-generate title using the standard function
    const generatedTitle = generatePropertyTitle(propertyType, street, neighborhood);
    propertyData.title = generatedTitle;
    
    console.log("=== PROPERTY DATA TO CREATE ===");
    console.log("Property data keys:", Object.keys(propertyData));
    console.log("Generated title:", generatedTitle);
    console.log("Property data:", propertyData);

    // Create the property - provide required fields with defaults
    const newProperty = await createProperty({
      propertyType: "piso",
      hasHeating: false,
      hasElevator: false,
      hasGarage: false,
      hasStorageRoom: false,
      isActive: true,
      ...propertyData
    } as Parameters<typeof createProperty>[0]);
    
    if (!newProperty?.propertyId) {
      throw new Error("Error al crear la propiedad");
    }

    console.log("Property created with ID:", newProperty.propertyId);

    // Extract listing-specific fields
    const listingFields = extractedFields.filter(f => f.dbTable === "listings");
    
    // Extract listing type and price from extracted fields (for potential future use)
    // Currently unused but may be needed for validation or logging

    // Create default listing with extracted data
    const newListing = await createDefaultListing(Number(newProperty.propertyId));
    
    if (!newListing?.listingId) {
      console.warn("Warning: Could not create default listing");
    }

    // If we have listing-specific data, update the listing
    if (listingFields.length > 0 && newListing?.listingId) {
      const { updateListingWithAuth } = await import("~/server/queries/listing");
      
      const listingUpdateData: Record<string, unknown> = {};
      
      listingFields.forEach(field => {
        if (field.dbColumn === "price") {
          listingUpdateData.price = String(field.value);
        } else if (field.dbColumn === "listingType") {
          listingUpdateData.listingType = String(field.value);
        } else if (field.fieldType === "boolean") {
          listingUpdateData[field.dbColumn] = Boolean(field.value);
        } else {
          listingUpdateData[field.dbColumn] = field.value;
        }
      });

      // Set the agent to current user and ensure listing is active
      listingUpdateData.agentId = currentUser.id;
      listingUpdateData.isActive = true; // Ensure listing is active
      
      // Set Spanish status based on listing type
      const listingType = listingUpdateData.listingType ?? "Sale";
      if (listingType === "Sale") {
        listingUpdateData.status = "En Venta";
      } else if (listingType === "Rent" || listingType === "RentWithOption" || listingType === "RoomSharing") {
        listingUpdateData.status = "En Alquiler";
      } else {
        // Default fallback
        listingUpdateData.status = "En Venta";
      }
      
      if (Object.keys(listingUpdateData).length > 0) {
        await updateListingWithAuth(Number(newListing.listingId), listingUpdateData);
        console.log("Listing updated with extracted data");
      }
    }

    // Associate contacts with the listing if provided
    if (contactIds.length > 0 && newListing?.listingId) {
      try {
        const { db } = await import("~/server/db");
        const { listingContacts } = await import("~/server/db/schema");
        
        for (const contactId of contactIds) {
          await db.insert(listingContacts).values({
            listingId: BigInt(newListing.listingId),
            contactId: BigInt(contactId),
            contactType: "buyer", // Default contact type for voice-created listings
            isActive: true,
          });
        }
        
        console.log(`Associated ${contactIds.length} contacts with listing ${newListing.listingId}`);
      } catch (error) {
        console.error("Error associating contacts with listing:", error);
        // Don't fail the entire operation if contact association fails
      }
    }

    // Create default tasks when property and listing creation is completed
    if (newListing?.listingId) {
      console.log("=== CREATING DEFAULT TASKS ===");
      console.log("Agent ID:", currentUser.id);
      console.log("Listing ID:", newListing.listingId);
      
      // Create tasks asynchronously (don't wait for completion)
      await createPropertyTasksAsync({
        userId: currentUser.id,
        listingId: BigInt(newListing.listingId),
      });
    }

    console.log("=== VOICE PROPERTY CREATION COMPLETED ===");
    
    return {
      success: true,
      propertyId: Number(newProperty.propertyId),
      listingId: newListing ? Number(newListing.listingId) : undefined,
    };
    
  } catch (error) {
    console.error("Error saving voice property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la propiedad",
    };
  }
}