import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSecureSession } from "~/lib/dal";
import { freepikClient } from "~/lib/freepik-client";
import { imageUrlToBase64, validateImageSize, getImageSizeInMB } from "~/lib/image-utils";
import { getListingHeaderData } from "~/server/queries/listing";

/**
 * POST: Start image enhancement with Freepik API
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
      console.error('Unauthorized access to enhancement API');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request data
    const data = await request.json() as { imageUrl: string; referenceNumber: string; currentImageOrder: number };
    const propertyId = BigInt(resolvedParams.id);

    if (!data.imageUrl || !data.referenceNumber || data.currentImageOrder === undefined) {
      console.error('Missing required fields for enhancement');
      return NextResponse.json(
        { error: "imageUrl, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    // 3. Validate property ownership
    const propertyData = await getListingHeaderData(parseInt(resolvedParams.id));
    if (!propertyData) {
      console.error('Property not found for enhancement');
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // 4. Download and validate image
    const imageBase64 = await imageUrlToBase64(data.imageUrl);
    
    // Validate size (max 10MB)
    if (!validateImageSize(imageBase64, 10)) {
      const sizeMB = getImageSizeInMB(imageBase64);
      console.error('Image too large for enhancement:', `${sizeMB.toFixed(2)}MB`);
      return NextResponse.json(
        { error: `Image too large (${sizeMB.toFixed(2)}MB). Maximum size is 10MB` },
        { status: 400 }
      );
    }

    // 5. Call Freepik API to start enhancement
    const result = await freepikClient.enhance(imageBase64);

    // 6. Return task information for polling
    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      propertyId: propertyId.toString(),
    });

  } catch (error) {
    console.error("Freepik enhancement API error:", error);
    
    // Return specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: "Failed to download image. Please check the image URL." },
          { status: 400 }
        );
      }
      if (error.message.includes('API error')) {
        return NextResponse.json(
          { error: "Enhancement service temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to start image enhancement" },
      { status: 500 }
    );
  }
}

/**
 * GET: Check enhancement status and upload to S3 when complete
 */
export async function GET(
  request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Use optimized DAL function for authentication
    const session = await getSecureSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const referenceNumber = searchParams.get('referenceNumber');
    const currentImageOrder = searchParams.get('currentImageOrder');

    if (!taskId || !referenceNumber || !currentImageOrder) {
      return NextResponse.json(
        { error: "taskId, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    // 3. Check Freepik task status
    const status = await freepikClient.checkStatus(taskId);

    // 4. If still processing, return status
    if (status.status === 'IN_PROGRESS') {
      return NextResponse.json({ 
        status: 'IN_PROGRESS',
        progress: status.progress ?? 0,
      });
    }

    // 5. If failed, return error
    if (status.status === 'FAILED') {
      return NextResponse.json({
        status: 'FAILED',
        error: status.error ?? 'Enhancement failed',
      });
    }

    // 6. If successful, return temporary Freepik URL (don't save to S3 yet)
    if (status.status === 'COMPLETED' && status.result?.generated?.[0]) {
      const enhancedImageUrl = status.result.generated[0];
      
      // Return the temporary Freepik URL and metadata needed for saving later
      return NextResponse.json({
        status: 'SUCCESS',
        enhancedImageUrl: enhancedImageUrl, // Freepik's temporary URL
        referenceNumber: referenceNumber,
        currentImageOrder: currentImageOrder,
      });
    }

    // 7. Unexpected status
    return NextResponse.json({
      status: status.status,
      error: "Unexpected enhancement status",
    });

  } catch (error) {
    console.error("Enhancement status check error:", error);
    return NextResponse.json(
      { error: "Failed to check enhancement status" },
      { status: 500 }
    );
  }
}