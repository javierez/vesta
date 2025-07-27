"use server";

import type { 
  ExtractedFieldResult, 
  DatabaseSaveResult
} from "~/types/textract-enhanced";
import { updateProperty } from "./properties";
import { updateListing } from "./listing";
import type { Property, Listing } from "~/lib/data";

/**
 * Database Persistence Layer for Textract Extracted Data
 * Saves extracted property and listing data with confidence filtering
 */

// Save extracted data to database with confidence filtering
export async function saveExtractedDataToDatabase(
  propertyId: number,
  listingId: number,
  extractedFields: ExtractedFieldResult[],
  confidenceThreshold = 50
): Promise<DatabaseSaveResult> {
  console.log(`💾 [DATABASE] Starting save operation for property ${propertyId}, listing ${listingId}`);
  console.log(`🎯 [DATABASE] Confidence threshold: ${confidenceThreshold}%`);
  console.log(`📊 [DATABASE] Total fields to process: ${extractedFields.length}`);

  const startTime = Date.now();
  const result: DatabaseSaveResult = {
    success: false,
    propertyUpdated: false,
    listingUpdated: false,
    propertyErrors: [],
    listingErrors: [],
    fieldsProcessed: extractedFields.length,
    fieldsSaved: 0,
    confidenceThreshold
  };

  try {
    // Filter fields by confidence threshold
    const highConfidenceFields = extractedFields.filter(
      field => field.confidence >= confidenceThreshold
    );

    console.log(`🔍 [DATABASE] Fields above ${confidenceThreshold}% confidence: ${highConfidenceFields.length}/${extractedFields.length}`);

    if (highConfidenceFields.length === 0) {
      console.log(`⚠️ [DATABASE] No fields meet confidence threshold. Skipping database save.`);
      result.success = true; // Not an error, just no data to save
      return result;
    }

    // Separate property and listing fields
    const propertyFields = highConfidenceFields.filter(field => field.dbTable === 'properties');
    const listingFields = highConfidenceFields.filter(field => field.dbTable === 'listings');

    console.log(`📋 [DATABASE] Property fields to save: ${propertyFields.length}`);
    console.log(`📋 [DATABASE] Listing fields to save: ${listingFields.length}`);

    // Build property update data
    const propertyUpdateData: Record<string, unknown> = {};
    if (propertyFields.length > 0) {
      for (const field of propertyFields) {
        try {
          // Type-safe assignment with proper conversion
          const key = field.dbColumn;
          propertyUpdateData[key] = field.value;
          
          console.log(`✅ [DATABASE] Property field prepared: ${field.dbColumn} = ${String(field.value)} (${field.confidence.toFixed(1)}% confidence)`);
        } catch (error) {
          const errorMsg = `Failed to prepare property field ${field.dbColumn}: ${String(error)}`;
          console.error(`❌ [DATABASE] ${errorMsg}`);
          result.propertyErrors.push(errorMsg);
        }
      }
    }

    // Build listing update data
    const listingUpdateData: Record<string, unknown> = {};
    if (listingFields.length > 0) {
      for (const field of listingFields) {
        try {
          // Type-safe assignment with proper conversion
          const key = field.dbColumn;
          listingUpdateData[key] = field.value;
          
          console.log(`✅ [DATABASE] Listing field prepared: ${field.dbColumn} = ${String(field.value)} (${field.confidence.toFixed(1)}% confidence)`);
        } catch (error) {
          const errorMsg = `Failed to prepare listing field ${field.dbColumn}: ${String(error)}`;
          console.error(`❌ [DATABASE] ${errorMsg}`);
          result.listingErrors.push(errorMsg);
        }
      }
    }

    // Update property if we have property data
    if (Object.keys(propertyUpdateData).length > 0) {
      try {
        console.log(`🔄 [DATABASE] Updating property ${propertyId} with ${Object.keys(propertyUpdateData).length} fields...`);
        
        await updateProperty(propertyId, propertyUpdateData as Omit<Partial<Property>, "propertyId" | "createdAt" | "updatedAt" | "referenceNumber">);
        
        result.propertyUpdated = true;
        result.fieldsSaved += Object.keys(propertyUpdateData).length;
        console.log(`✅ [DATABASE] Property ${propertyId} updated successfully`);
        
        // Log detailed field updates
        Object.entries(propertyUpdateData).forEach(([key, value]) => {
          const field = propertyFields.find(f => f.dbColumn === key);
          console.log(`   └─ ${key}: ${String(value)} (source: ${field?.extractionSource}, confidence: ${field?.confidence.toFixed(1)}%)`);
        });
        
      } catch (error) {
        const errorMsg = `Failed to update property ${propertyId}: ${String(error)}`;
        console.error(`❌ [DATABASE] ${errorMsg}`);
        result.propertyErrors.push(errorMsg);
      }
    } else {
      console.log(`ℹ️ [DATABASE] No property fields to update`);
    }

    // Update listing if we have listing data
    if (Object.keys(listingUpdateData).length > 0) {
      try {
        console.log(`🔄 [DATABASE] Updating listing ${listingId} with ${Object.keys(listingUpdateData).length} fields...`);
        
        await updateListing(listingId, listingUpdateData as Omit<Partial<Listing>, "listingId" | "createdAt" | "updatedAt">);
        
        result.listingUpdated = true;
        result.fieldsSaved += Object.keys(listingUpdateData).length;
        console.log(`✅ [DATABASE] Listing ${listingId} updated successfully`);
        
        // Log detailed field updates
        Object.entries(listingUpdateData).forEach(([key, value]) => {
          const field = listingFields.find(f => f.dbColumn === key);
          console.log(`   └─ ${key}: ${String(value)} (source: ${field?.extractionSource}, confidence: ${field?.confidence.toFixed(1)}%)`);
        });
        
      } catch (error) {
        const errorMsg = `Failed to update listing ${listingId}: ${String(error)}`;
        console.error(`❌ [DATABASE] ${errorMsg}`);
        result.listingErrors.push(errorMsg);
      }
    } else {
      console.log(`ℹ️ [DATABASE] No listing fields to update`);
    }

    // Determine overall success
    const hasErrors = result.propertyErrors.length > 0 || result.listingErrors.length > 0;
    const hasUpdates = result.propertyUpdated || result.listingUpdated;
    
    result.success = !hasErrors && (hasUpdates || highConfidenceFields.length === 0);

    const duration = Date.now() - startTime;
    console.log(`🎯 [DATABASE] Save operation completed in ${duration}ms:`);
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Property updated: ${result.propertyUpdated}`);
    console.log(`   - Listing updated: ${result.listingUpdated}`);
    console.log(`   - Fields saved: ${result.fieldsSaved}/${result.fieldsProcessed}`);
    console.log(`   - Property errors: ${result.propertyErrors.length}`);
    console.log(`   - Listing errors: ${result.listingErrors.length}`);

    if (result.propertyErrors.length > 0) {
      console.error(`❌ [DATABASE] Property errors:`, result.propertyErrors);
    }
    if (result.listingErrors.length > 0) {
      console.error(`❌ [DATABASE] Listing errors:`, result.listingErrors);
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DATABASE] Critical error during save operation (${duration}ms):`, error);
    
    result.success = false;
    result.propertyErrors.push(`Critical error: ${String(error)}`);
    result.listingErrors.push(`Critical error: ${String(error)}`);
    
    return result;
  }
}

// Get property and listing IDs from document context
export async function getPropertyAndListingIds(documentKey: string): Promise<{
  propertyId?: number;
  listingId?: number;
} | null> {
  console.log(`🔍 [DATABASE] Extracting property/listing IDs from document key: ${documentKey}`);
  
  try {
    // Extract reference number from document key
    // Expected format: documents/VESTA20240000001/ficha_propiedad/...
    const match = /documents\/(VESTA\d+)/.exec(documentKey);
    if (!match) {
      console.warn(`⚠️ [DATABASE] Could not extract reference number from document key: ${documentKey}`);
      return null;
    }

    const referenceNumber = match[1];
    console.log(`📋 [DATABASE] Extracted reference number: ${referenceNumber}`);

    // Import here to avoid circular dependencies
    const { db } = await import("../db");
    const { properties, listings } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    // Find property by reference number
    const [property] = await db
      .select({ propertyId: properties.propertyId })
      .from(properties)
      .where(eq(properties.referenceNumber, referenceNumber!))
      .limit(1);

    if (!property) {
      console.warn(`⚠️ [DATABASE] No property found with reference number: ${referenceNumber}`);
      return null;
    }

    const propertyId = Number(property.propertyId);
    console.log(`✅ [DATABASE] Found property ID: ${propertyId}`);

    // Find listing for this property
    const [listing] = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .where(eq(listings.propertyId, property.propertyId))
      .limit(1);

    const listingId = listing ? Number(listing.listingId) : undefined;
    if (listingId) {
      console.log(`✅ [DATABASE] Found listing ID: ${listingId}`);
    } else {
      console.warn(`⚠️ [DATABASE] No listing found for property ID: ${propertyId}`);
    }

    return {
      propertyId,
      listingId
    };

  } catch (error) {
    console.error(`❌ [DATABASE] Error extracting property/listing IDs:`, error);
    return null;
  }
}

// Validate extracted data before saving
export async function validateExtractedData(
  extractedFields: ExtractedFieldResult[]
): Promise<{
  valid: ExtractedFieldResult[];
  invalid: Array<{ field: ExtractedFieldResult; reason: string }>;
}> {
  console.log(`🔍 [DATABASE] Validating ${extractedFields.length} extracted fields...`);
  
  const valid: ExtractedFieldResult[] = [];
  const invalid: Array<{ field: ExtractedFieldResult; reason: string }> = [];

  for (const field of extractedFields) {
    try {
      // Basic validation checks
      if (!field.dbColumn || !field.dbTable) {
        invalid.push({ field, reason: 'Missing database column or table' });
        continue;
      }

      if (field.confidence < 0 || field.confidence > 100) {
        invalid.push({ field, reason: 'Invalid confidence score' });
        continue;
      }

      if (field.value === null || field.value === undefined) {
        invalid.push({ field, reason: 'Null or undefined value' });
        continue;
      }

      // Type validation
      switch (field.fieldType) {
        case 'number':
          if (typeof field.value !== 'number' || isNaN(field.value)) {
            invalid.push({ field, reason: 'Invalid number value' });
            continue;
          }
          break;
        case 'boolean':
          if (typeof field.value !== 'boolean') {
            invalid.push({ field, reason: 'Invalid boolean value' });
            continue;
          }
          break;
        case 'string':
          if (typeof field.value !== 'string' || field.value.trim() === '') {
            invalid.push({ field, reason: 'Invalid or empty string value' });
            continue;
          }
          break;
        case 'decimal':
          if (typeof field.value !== 'number' || isNaN(field.value)) {
            invalid.push({ field, reason: 'Invalid decimal value' });
            continue;
          }
          break;
      }

      // Value range validation for specific fields
      if (field.dbColumn === 'bedrooms' && typeof field.value === 'number' && (field.value < 0 || field.value > 10)) {
        invalid.push({ field, reason: 'Bedroom count out of valid range (0-10)' });
        continue;
      }

      if (field.dbColumn === 'bathrooms' && typeof field.value === 'number' && (field.value < 0 || field.value > 10)) {
        invalid.push({ field, reason: 'Bathroom count out of valid range (0-10)' });
        continue;
      }

      if (field.dbColumn === 'yearBuilt' && typeof field.value === 'number' && (field.value < 1800 || field.value > new Date().getFullYear() + 5)) {
        invalid.push({ field, reason: 'Year built out of valid range' });
        continue;
      }

      if (field.dbColumn === 'price' && typeof field.value === 'number' && field.value <= 0) {
        invalid.push({ field, reason: 'Price must be positive' });
        continue;
      }

      // If we get here, the field is valid
      valid.push(field);

    } catch (error) {
      invalid.push({ field, reason: `Validation error: ${String(error)}` });
    }
  }

  console.log(`✅ [DATABASE] Validation completed: ${valid.length} valid, ${invalid.length} invalid fields`);
  
  if (invalid.length > 0) {
    console.warn(`⚠️ [DATABASE] Invalid fields:`, invalid.map(i => `${i.field.dbColumn}: ${i.reason}`));
  }

  return { valid, invalid };
}

// Create audit log entry for database updates
export async function createAuditLog(
  documentKey: string,
  propertyId?: number,
  listingId?: number,
  fieldsUpdated?: ExtractedFieldResult[],
  saveResult?: DatabaseSaveResult
): Promise<void> {
  console.log(`📝 [DATABASE] Creating audit log entry...`);
  
  try {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      documentKey,
      propertyId,
      listingId,
      fieldsUpdated: fieldsUpdated?.length ?? 0,
      fieldsSaved: saveResult?.fieldsSaved ?? 0,
      success: saveResult?.success ?? false,
      propertyUpdated: saveResult?.propertyUpdated ?? false,
      listingUpdated: saveResult?.listingUpdated ?? false,
      errors: [
        ...(saveResult?.propertyErrors ?? []),
        ...(saveResult?.listingErrors ?? [])
      ],
      fieldDetails: fieldsUpdated?.map(field => ({
        column: field.dbColumn,
        table: field.dbTable,
        value: field.value,
        confidence: field.confidence,
        source: field.extractionSource
      }))
    };

    console.log(`📄 [DATABASE] Audit log entry:`, JSON.stringify(auditEntry, null, 2));
    
    // In a production environment, you would save this to an audit table
    // For now, we'll just log it for debugging purposes
    
  } catch (error) {
    console.error(`❌ [DATABASE] Failed to create audit log:`, error);
  }
}