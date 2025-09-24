import type { NextRequest } from "next/server";
import { getSecureSession } from "~/lib/dal";
import { geminiClient } from "~/lib/gemini-client";
import { imageUrlToBase64, validateImageSize, getImageSizeInMB } from "~/lib/image-utils";
import { getListingHeaderData } from "~/server/queries/listing";
import type { RenovationType } from "~/types/gemini";

/**
 * POST: Start image renovation with Gemini API
 */
export async function POST(
  request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await _params;
  
  try {
    // 1. Use optimized DAL function for authentication
    const session = await getSecureSession();
    
    if (!session?.user?.id) {
      console.error('Unauthorized access to renovation API');
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request data
    const data = await request.json() as { 
      imageUrl: string; 
      referenceNumber: string; 
      currentImageOrder: number;
      renovationType?: RenovationType;
    };
    const propertyId = BigInt(resolvedParams.id);

    if (!data.imageUrl || !data.referenceNumber || data.currentImageOrder === undefined) {
      console.error('Missing required fields for renovation');
      return Response.json(
        { error: "imageUrl, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    // 3. Validate property ownership
    const propertyData = await getListingHeaderData(parseInt(resolvedParams.id));
    if (!propertyData) {
      console.error('Property not found for renovation');
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // 4. Download and validate image
    const imageBase64 = await imageUrlToBase64(data.imageUrl);
    
    // Validate size (max 20MB for Gemini)
    if (!validateImageSize(imageBase64, 20)) {
      const sizeMB = getImageSizeInMB(imageBase64);
      console.error('Image too large for renovation:', `${sizeMB.toFixed(2)}MB`);
      return Response.json(
        { error: `Image too large (${sizeMB.toFixed(2)}MB). Maximum size is 20MB` },
        { status: 400 }
      );
    }

    // 5. Additional Gemini-specific validation
    const validation = geminiClient.validateImageInput(imageBase64);
    if (!validation.valid) {
      console.error('Gemini image validation failed:', validation.error);
      return Response.json(
        { error: validation.error ?? "Invalid image format for renovation" },
        { status: 400 }
      );
    }

    console.log('Starting Gemini renovation:', {
      propertyId: propertyId.toString(),
      imageSize: getImageSizeInMB(imageBase64).toFixed(2) + 'MB',
      renovationType: data.renovationType ?? 'auto-detect'
    });

    // 6. Call Gemini API for renovation (synchronous)
    const result = await geminiClient.renovateImage(imageBase64, data.renovationType);

    if (!result.success) {
      console.error('Gemini renovation failed:', result.error);
      return Response.json(
        { error: result.error ?? "Renovation failed" },
        { status: 500 }
      );
    }

    if (!result.renovatedImageBase64) {
      console.error('No renovated image returned from Gemini');
      return Response.json(
        { error: "No renovated image generated" },
        { status: 500 }
      );
    }

    // 7. Return successful renovation result
    return Response.json({
      success: true,
      status: 'COMPLETED',
      renovatedImageBase64: result.renovatedImageBase64,
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      propertyId: propertyId.toString(),
      renovationType: data.renovationType ?? 'generic'
    });

  } catch (error) {
    console.error("Gemini renovation API error:", error);
    
    // Return specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return Response.json(
          { error: "Failed to download image. Please check the image URL." },
          { status: 400 }
        );
      }
      if (error.message.includes('API') || error.message.includes('Gemini')) {
        return Response.json(
          { error: "Renovation service temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
      if (error.message.includes('Missing required')) {
        return Response.json(
          { error: "Renovation service configuration error." },
          { status: 500 }
        );
      }
    }
    
    return Response.json(
      { error: "Failed to start image renovation" },
      { status: 500 }
    );
  }
}