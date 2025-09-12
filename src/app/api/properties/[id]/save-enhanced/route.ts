import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSecureSession } from "~/lib/dal";
import { uploadEnhancedImageToS3 } from "~/app/actions/enhance-image";
import { getListingHeaderData } from "~/server/queries/listing";

/**
 * POST: Save enhanced image to S3 and database when user confirms
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
      console.error('Unauthorized access to save enhanced image');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request data
    const data = await request.json() as { 
      enhancedImageUrl: string; 
      referenceNumber: string; 
      currentImageOrder: string; 
    };
    const propertyId = BigInt(resolvedParams.id);

    if (!data.enhancedImageUrl || !data.referenceNumber || !data.currentImageOrder) {
      console.error('Missing required fields for enhanced image save');
      return NextResponse.json(
        { error: "enhancedImageUrl, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    // 3. Validate property ownership
    const propertyData = await getListingHeaderData(parseInt(resolvedParams.id));
    if (!propertyData) {
      console.error('Property not found');
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // 4. Save enhanced image to S3 and database
    const newImageOrder = parseInt(data.currentImageOrder) + 1;
    
    try {
      const propertyImage = await uploadEnhancedImageToS3(
        data.enhancedImageUrl,
        propertyId,
        data.referenceNumber,
        newImageOrder
      );

      return NextResponse.json({
        success: true,
        propertyImage: {
          ...propertyImage,
          propertyImageId: propertyImage.propertyImageId.toString(),
          propertyId: propertyImage.propertyId.toString(),
        },
        message: "Enhanced image saved successfully"
      });
    } catch (uploadError) {
      console.error('Error saving enhanced image to S3/DB:', uploadError);
      return NextResponse.json(
        { error: "Failed to save enhanced image to S3 or database" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Save enhanced image API error:", error);
    return NextResponse.json(
      { error: "Failed to save enhanced image" },
      { status: 500 }
    );
  }
}