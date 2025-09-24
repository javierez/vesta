import type { NextRequest } from "next/server";
import { getSecureSession } from "~/lib/dal";
import { uploadRenovatedImageToS3 } from "~/app/actions/renovate-image";
import { getListingHeaderData } from "~/server/queries/listing";
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

    // 4. Save renovated image to S3 and database
    const newImageOrder = parseInt(data.currentImageOrder) + 1;
    
    try {
      const propertyImage = await uploadRenovatedImageToS3(
        data.renovatedImageBase64,
        propertyId,
        data.referenceNumber,
        newImageOrder,
        data.renovationType
      );

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