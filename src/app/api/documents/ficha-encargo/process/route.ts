import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMinimalPropertyWithListing } from "~/server/queries/properties";
import { extractTextFromDocument } from "~/server/ocr/ocr-initial-form";
import { extractEnhancedPropertyData } from "~/server/ocr/field-extractor";
import { saveExtractedDataToDatabase } from "~/server/queries/textract-database-saver";
import { renameDocumentFolder } from "~/app/actions/upload";
import { getDocumentById } from "~/server/queries/document";
import { getSecureSession } from "~/lib/dal";
import { db } from "~/server/db";
import { documents } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { EnhancedExtractedPropertyData } from "~/types/textract-enhanced";

// Phase 2: Process documents and create property
export async function POST(request: NextRequest) {
  try {
    console.log("🏠 Starting Phase 2: Processing ficha de encargo documents...");
    
    // Get current user session
    const session = await getSecureSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tempReferenceNumber, documentIds } = body;

    if (!tempReferenceNumber) {
      return NextResponse.json(
        { error: "Temporary reference number is required" },
        { status: 400 },
      );
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Document IDs are required" },
        { status: 400 },
      );
    }

    console.log(`📝 Processing ${documentIds.length} documents with temp reference: ${tempReferenceNumber}`);

    // Step 1: Create minimal property and listing
    console.log("📝 Creating minimal property and listing...");
    const propertyResult = await createMinimalPropertyWithListing();
    const { propertyId, listingId, referenceNumber } = propertyResult;
    
    console.log(`✅ Property created: ${propertyId}, Listing: ${listingId}, Reference: ${referenceNumber}`);

    // Step 2: Rename S3 folder and update document records
    console.log("📁 Renaming S3 folder and updating document records...");
    try {
      const documentIdsBigInt = documentIds.map((id: string) => BigInt(id));
      const renamedDocuments = await renameDocumentFolder(
        tempReferenceNumber,
        referenceNumber,
        documentIdsBigInt,
      );
      console.log(`✅ Renamed ${renamedDocuments.length} documents`);

      // Update document records with property and listing IDs
      for (const docId of documentIds) {
        await db
          .update(documents)
          .set({
            propertyId: BigInt(propertyId),
            listingId: BigInt(listingId),
          })
          .where(eq(documents.docId, BigInt(docId)));
      }
      console.log("✅ Updated document records with property and listing IDs");

    } catch (error) {
      console.error("❌ Error renaming documents:", error);
      // Continue with processing even if renaming fails
    }

    // Step 3: Process documents with OCR for data extraction
    console.log("🔍 Processing documents with OCR...");
    let extractedData: EnhancedExtractedPropertyData | undefined;
    
    // Find the first PDF document for OCR processing
    for (const docId of documentIds) {
      try {
        const document = await getDocumentById(Number(docId));
        
        if (document && 
            (document.fileType === 'application/pdf' || 
             document.documentKey.toLowerCase().includes('.pdf'))) {
          
          console.log(`🎯 Processing PDF document: ${document.filename}`);
          
          // Use the updated documentKey (after renaming)
          const s3Key = document.documentKey.replace(tempReferenceNumber, referenceNumber);
          
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

              // Step 4: Update property and listing with extracted data
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
              
              // Only process the first PDF found
              break;
            } else {
              console.warn("⚠️ Data extraction failed or returned no data");
            }
          } else {
            console.warn("⚠️ OCR processing failed:", ocrResult.error);
          }
        }
      } catch (ocrError) {
        console.error("❌ OCR processing error for document:", docId, ocrError);
        // Continue with other documents if one fails
      }
    }

    if (!extractedData) {
      console.log("ℹ️ No PDF documents found or processed successfully for OCR");
    }

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        listingId,
        referenceNumber,
        extractedData,
        documentsUploaded: documentIds.length,
      },
      message: `Property created successfully with ${documentIds.length} documents processed.`,
    });

  } catch (error) {
    console.error("❌ Error in ficha de encargo processing:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process ficha de encargo",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 },
    );
  }
}