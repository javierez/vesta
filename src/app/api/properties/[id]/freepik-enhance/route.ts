import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { freepikClient } from "~/lib/freepik-client";
import { imageUrlToBase64, validateImageSize, getImageSizeInMB } from "~/lib/image-utils";
import { uploadEnhancedImageToS3 } from "~/app/actions/enhance-image";
import { getListingHeaderData } from "~/server/queries/listing";

/**
 * POST: Start image enhancement with Freepik API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  console.log('🎯 [FreepikAPI] POST /freepik-enhance called', {
    propertyId: resolvedParams.id,
    timestamp: new Date().toISOString()
  });
  
  try {
    // 1. Check authentication
    console.log('🔐 [FreepikAPI] Checking authentication');
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      console.error('❌ [FreepikAPI] Unauthorized - no session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('✅ [FreepikAPI] Authentication successful', {
      userId: session.user.id
    });

    // 2. Get request data
    console.log('📝 [FreepikAPI] Parsing request data');
    const data = await request.json() as { imageUrl: string; referenceNumber: string; currentImageOrder: number };
    const propertyId = BigInt(resolvedParams.id);
    
    console.log('📝 [FreepikAPI] Request data parsed', {
      imageUrl: data.imageUrl,
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      propertyId: propertyId.toString()
    });

    if (!data.imageUrl || !data.referenceNumber || data.currentImageOrder === undefined) {
      console.error('❌ [FreepikAPI] Missing required fields', {
        hasImageUrl: !!data.imageUrl,
        hasReferenceNumber: !!data.referenceNumber,
        hasCurrentImageOrder: data.currentImageOrder !== undefined
      });
      return NextResponse.json(
        { error: "imageUrl, referenceNumber, and currentImageOrder are required" },
        { status: 400 }
      );
    }

    // 3. Validate property ownership (optional but recommended)
    console.log('🏠 [FreepikAPI] Validating property ownership');
    const propertyData = await getListingHeaderData(parseInt(resolvedParams.id));
    if (!propertyData) {
      console.error('❌ [FreepikAPI] Property not found', {
        propertyId: resolvedParams.id
      });
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }
    
    console.log('✅ [FreepikAPI] Property validation successful', {
      propertyFound: !!propertyData
    });

    // 4. Download and validate image
    console.log(`🎨 [FreepikAPI] Starting image enhancement`, {
      propertyId: propertyId.toString(),
      imageUrl: data.imageUrl
    });
    
    console.log('📞 [FreepikAPI] Converting image to base64');
    const imageBase64 = await imageUrlToBase64(data.imageUrl);
    console.log('✅ [FreepikAPI] Image converted to base64', {
      base64Length: imageBase64.length
    });
    
    // Validate size (max 10MB)
    console.log('📏 [FreepikAPI] Validating image size');
    if (!validateImageSize(imageBase64, 10)) {
      const sizeMB = getImageSizeInMB(imageBase64);
      console.error('❌ [FreepikAPI] Image too large', {
        sizeInMB: sizeMB,
        maxSizeInMB: 10
      });
      return NextResponse.json(
        { error: `Image too large (${sizeMB.toFixed(2)}MB). Maximum size is 10MB` },
        { status: 400 }
      );
    }
    console.log('✅ [FreepikAPI] Image size validation passed');

    // 5. Call Freepik API to start enhancement
    console.log('🚀 [FreepikAPI] Calling Freepik API');
    const result = await freepikClient.enhance(imageBase64);
    
    console.log('✅ [FreepikAPI] Freepik enhancement started successfully', {
      taskId: result.taskId,
      status: result.status,
      hasGenerated: !!result.generated,
      hasError: !!result.error
    });

    // 6. Return task information for polling
    const responseData = {
      success: true,
      taskId: result.taskId,
      status: result.status,
      referenceNumber: data.referenceNumber,
      currentImageOrder: data.currentImageOrder,
      propertyId: propertyId.toString(),
    };
    
    console.log('📝 [FreepikAPI] Returning response data', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("❌ [FreepikAPI] Enhancement error:", error);
    
    // Return specific error messages for common issues
    if (error instanceof Error) {
      console.error('❌ [FreepikAPI] Error details', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.message.includes('fetch')) {
        console.error('❌ [FreepikAPI] Image download failed');
        return NextResponse.json(
          { error: "Failed to download image. Please check the image URL." },
          { status: 400 }
        );
      }
      if (error.message.includes('API error')) {
        console.error('❌ [FreepikAPI] Freepik API error');
        return NextResponse.json(
          { error: "Enhancement service temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
    }
    
    console.error('❌ [FreepikAPI] Unknown error, returning generic error');
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
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
    
    console.log(`🔍 [FreepikAPI] Task ${taskId} status: ${status.status}`, {
      status: status.status,
      hasResult: !!status.result,
      hasGenerated: !!status.result?.generated,
      generatedLength: status.result?.generated?.length,
      firstUrl: status.result?.generated?.[0],
      progress: status.progress,
      error: status.error
    });

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

    // 6. If successful, upload to S3 and create database record
    console.log('🔍 [FreepikAPI] Checking COMPLETED condition', {
      statusIsCompleted: status.status === 'COMPLETED',
      hasResult: !!status.result,
      hasGenerated: !!status.result?.generated,
      hasFirstUrl: !!status.result?.generated?.[0],
      fullCondition: status.status === 'COMPLETED' && status.result?.generated?.[0]
    });
    
    if (status.status === 'COMPLETED' && status.result?.generated?.[0]) {
      try {
        const enhancedImageUrl = status.result.generated[0];
        const propertyId = BigInt((await params).id);
        
        console.log(`✅ [FreepikAPI] Enhancement successful. Uploading to S3: ${enhancedImageUrl}`);
        
        // Place enhanced image right after the original (increment by 1)
        // Database image_order column expects integer values, not decimals
        const newImageOrder = parseInt(currentImageOrder) + 1;
        
        // Upload to S3 and create database record
        const propertyImage = await uploadEnhancedImageToS3(
          enhancedImageUrl,
          propertyId,
          referenceNumber,
          newImageOrder
        );

        console.log(`✅ [FreepikAPI] Enhanced image uploaded successfully. New image ID: ${propertyImage.propertyImageId}`);

        return NextResponse.json({
          status: 'SUCCESS',
          propertyImage: {
            ...propertyImage,
            propertyImageId: propertyImage.propertyImageId.toString(),
            propertyId: propertyImage.propertyId.toString(),
          },
          enhancedImageUrl: propertyImage.imageUrl,
        });
      } catch (uploadError) {
        console.error('❌ [FreepikAPI] Error uploading enhanced image:', uploadError);
        return NextResponse.json(
          { error: "Enhancement completed but failed to save image" },
          { status: 500 }
        );
      }
    } else {
      console.warn('⚠️ [FreepikAPI] COMPLETED status but condition not met', {
        status: status.status,
        hasResult: !!status.result,
        hasGenerated: !!status.result?.generated,
        generatedArray: status.result?.generated
      });
    }

    // 7. Unexpected status
    return NextResponse.json({
      status: status.status,
      error: "Unexpected enhancement status",
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check enhancement status" },
      { status: 500 }
    );
  }
}