"use server";

import { createMinimalPropertyWithListing } from "~/server/queries/properties";
import { uploadDocument } from "~/app/actions/upload";
import { extractTextFromDocument } from "~/server/ocr/ocr-initial-form";
import { extractEnhancedPropertyData } from "~/server/ocr/field-extractor";
import { saveExtractedDataToDatabase } from "~/server/queries/textract-database-saver";
import { getSecureSession } from "~/lib/dal";
import type { EnhancedExtractedPropertyData } from "~/types/textract-enhanced";

type CreateFichaEncargoResult = 
  | {
      success: true;
      data: {
        propertyId: number;
        listingId: number;
        referenceNumber: string;
        extractedData?: EnhancedExtractedPropertyData;
        documentsUploaded: number;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function createFichaEncargoPropertyAction(
  files: File[]
): Promise<CreateFichaEncargoResult> {
  try {
    console.log("🏠 Starting ficha de encargo property creation with OCR processing...");
    
    // 1. Get current user session
    const session = await getSecureSession();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    // 2. Create minimal property and listing (same as quick form)
    console.log("📝 Creating minimal property and listing...");
    const propertyResult = await createMinimalPropertyWithListing();
    const { propertyId, listingId, referenceNumber } = propertyResult;
    
    console.log(`✅ Property created: ${propertyId}, Listing: ${listingId}, Reference: ${referenceNumber}`);

    // 3. Upload all files to the proper property folder
    console.log("📤 Uploading documents to property folder...");
    const uploadPromises = files.map(async (file, index) => {
      return await uploadDocument(
        file,
        session.user.id,
        referenceNumber,
        index + 1, // documentOrder
        "ficha-encargo", // documentTag
        undefined, // contactId
        BigInt(listingId), // listingId
        undefined, // listingContactId
        undefined, // dealId
        undefined, // appointmentId
        BigInt(propertyId), // propertyId
        "initial-docs" // folderType
      );
    });

    const uploadedDocuments = await Promise.all(uploadPromises);
    console.log(`✅ Uploaded ${uploadedDocuments.length} documents successfully`);

    // 4. Process documents with OCR/Textract for data extraction
    console.log("🔍 Processing documents with OCR...");
    let extractedData: EnhancedExtractedPropertyData | undefined;
    
    // Process the first PDF document for data extraction
    const pdfDocument = uploadedDocuments.find(doc => 
      doc.fileType === 'application/pdf' || doc.documentKey.toLowerCase().includes('.pdf')
    );

    if (pdfDocument) {
      try {
        console.log(`🎯 Processing document: ${pdfDocument.filename}`);
        
        // Extract S3 key from documentKey for Textract
        const s3Key = pdfDocument.documentKey;
        
        // Process document with Textract
        const ocrResult = await extractTextFromDocument(s3Key);
        
        if (ocrResult.success) {
          console.log("✅ OCR processing successful, extracting property data...");
          
          // Extract structured data using the field extractor
          const fieldExtractionResult = await extractEnhancedPropertyData({
            extractedText: ocrResult.extractedText,
            detectedFields: ocrResult.detectedFields,
            blocks: ocrResult.blocks,
            confidence: ocrResult.confidence,
          });

          if (fieldExtractionResult.extractedFields.length > 0) {
            extractedData = fieldExtractionResult.propertyData;
            console.log("✅ Data extraction successful:", fieldExtractionResult.extractedFields.length, "fields extracted");

            // 5. Update property and listing with extracted data
            console.log("💾 Saving extracted data to property and listing...");
            const saveResult = await saveExtractedDataToDatabase(
              Number(propertyId),
              Number(listingId),
              Number(session.user.id),
              fieldExtractionResult.extractedFields,
              80 // confidence threshold
            );
            
            if (saveResult.success) {
              console.log("✅ Property and listing updated with extracted data");
            } else {
              console.warn("⚠️ Some fields could not be saved:", saveResult);
            }
            console.log("✅ Property and listing updated with extracted data");
          } else {
            console.warn("⚠️ Data extraction failed or returned no data");
          }
        } else {
          console.warn("⚠️ OCR processing failed:", ocrResult.error);
        }
      } catch (ocrError) {
        console.error("❌ OCR processing error:", ocrError);
        // Don't fail the entire process if OCR fails - property is still created
      }
    } else {
      console.log("ℹ️ No PDF document found for OCR processing");
    }

    return {
      success: true,
      data: {
        propertyId,
        listingId,
        referenceNumber,
        extractedData,
        documentsUploaded: uploadedDocuments.length,
      },
    };

  } catch (error) {
    console.error("❌ Error in createFichaEncargoPropertyAction:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create property from ficha de encargo",
    };
  }
}

// Helper function to get processing status
export async function getFichaEncargoProcessingStatus(
  referenceNumber: string
): Promise<{
  propertyCreated: boolean;
  documentsUploaded: boolean;
  ocrProcessed: boolean;
  dataExtracted: boolean;
}> {
  // This could be implemented to track processing progress
  // For now, return a simple status
  return {
    propertyCreated: true,
    documentsUploaded: true,
    ocrProcessed: true,
    dataExtracted: true,
  };
}