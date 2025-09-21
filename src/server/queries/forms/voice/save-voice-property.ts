"use server";

import type { ExtractedFieldResult } from "~/types/textract-enhanced";
import { createProperty } from "~/server/queries/properties";
import { createDefaultListing } from "~/server/queries/listing";
import { getCurrentUser } from "~/lib/dal";

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

    console.log("=== PROPERTY DATA TO CREATE ===");
    console.log("Property data keys:", Object.keys(propertyData));
    console.log("Property data:", propertyData);

    // Create the property
    const newProperty = await createProperty(propertyData);
    
    if (!newProperty || !newProperty.propertyId) {
      throw new Error("Error al crear la propiedad");
    }

    console.log("Property created with ID:", newProperty.propertyId);

    // Extract listing-specific fields
    const listingFields = extractedFields.filter(f => f.dbTable === "listings");
    
    // Determine listing type and price from extracted fields
    let listingType = "Sale";
    let price = "0";
    
    const listingTypeField = listingFields.find(f => f.dbColumn === "listingType");
    if (listingTypeField) {
      listingType = String(listingTypeField.value);
    }
    
    const priceField = listingFields.find(f => f.dbColumn === "price");
    if (priceField) {
      price = String(priceField.value);
    }

    // Create default listing with extracted data
    const newListing = await createDefaultListing(Number(newProperty.propertyId));
    
    if (!newListing || !newListing.listingId) {
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
      listingUpdateData.status = "Active"; // Set status to Active
      
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