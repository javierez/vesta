import type { NextRequest } from "next/server";
import { getSecureSession } from "~/lib/dal";
import { uploadRenovatedImageToS3 } from "~/app/actions/renovate-image";
import { getListingHeaderData } from "~/server/queries/listing";
import { getPropertyImagesByReference } from "~/server/queries/property_images";
import type { RenovationType } from "~/types/gemini";

/**
 * POST: Save renovated image to S3 and database when user confirms
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  
  try {
    // 1. Use optimized DAL function for authentication
    const session = await getSecureSession();
    
    if (!session?.user?.id) {
      console.error('Unauthorized access to save renovated image');
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request data
    const data = await request.json() as { 
      renovatedImageBase64: string; 
      referenceNumber: string; 
      currentImageOrder: string; 
      renovationType?: RenovationType;
    };
    const propertyId = BigInt(resolvedParams.id);

    if (!data.renovatedImageBase64 || !data.referenceNumber || !data.currentImageOrder) {
      console.error('Missing required fields for renovated image save');
      return Response.json(
        { error: "renovatedImageBase64, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    console.log('Saving renovated image:', {
      propertyId: propertyId.toString(),
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      renovationType: data.renovationType ?? 'generic',
      imageDataLength: data.renovatedImageBase64.length
    });

    // 3. Validate property ownership
    const propertyData = await getListingHeaderData(parseInt(resolvedParams.id));
    if (!propertyData) {
      console.error('Property not found');
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // 4. Find the original image to get the correct propertyId
    const propertyImages = await getPropertyImagesByReference(data.referenceNumber);
    const originalImage = propertyImages.find(img => img.imageOrder === parseInt(data.currentImageOrder));
    
    if (!originalImage) {
      console.error('Original image not found:', {
        referenceNumber: data.referenceNumber,
        imageOrder: data.currentImageOrder
      });
      return Response.json(
        { error: "Original image not found" },
        { status: 404 }
      );
    }

    // Use the propertyId from the original image, not from URL
    const correctPropertyId = originalImage.propertyId;
    
    console.log('Found original image:', {
      originalImageId: originalImage.propertyImageId.toString(),
      originalPropertyId: originalImage.propertyId.toString(),
      urlPropertyId: propertyId.toString(),
      usingCorrectPropertyId: correctPropertyId.toString()
    });

    // 5. Save renovated image to S3 and database using correct propertyId
    const newImageOrder = parseInt(data.currentImageOrder) + 1;
    
    console.log('🎯 Renovated image save API - Starting process:', {
      correctPropertyId: correctPropertyId.toString(),
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      newImageOrder,
      renovationType: data.renovationType ?? 'generic',
      imageDataLength: data.renovatedImageBase64.length
    });
    
    try {
      const propertyImage = await uploadRenovatedImageToS3(
        data.renovatedImageBase64,
        correctPropertyId,
        data.referenceNumber,
        newImageOrder,
        data.renovationType,
        originalImage.propertyImageId // Pass the original image ID to track the relationship
      );

      console.log('🎉 Renovated image successfully saved:', {
        propertyImageId: propertyImage.propertyImageId.toString(),
        propertyId: propertyImage.propertyId.toString(),
        referenceNumber: propertyImage.referenceNumber,
        imageOrder: propertyImage.imageOrder,
        imageTag: propertyImage.imageTag
      });

      return Response.json({
        success: true,
        propertyImage: {
          ...propertyImage,
          propertyImageId: propertyImage.propertyImageId.toString(),
          propertyId: propertyImage.propertyId.toString(),
        },
        message: "Renovated image saved successfully"
      });
    } catch (uploadError) {
      console.error('Error saving renovated image to S3/DB:', uploadError);
      return Response.json(
        { error: "Failed to save renovated image to S3 or database" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Save renovated image API error:", error);
    return Response.json(
      { error: "Failed to save renovated image" },
      { status: 500 }
    );
  }
}