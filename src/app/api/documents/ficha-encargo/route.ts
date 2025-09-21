import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadDocument } from "~/app/actions/upload";
import { getSecureSession } from "~/lib/dal";

// Phase 1: Upload files to temporary location only
export async function POST(request: NextRequest) {
  try {
    // Use optimized DAL function for session retrieval
    const session = await getSecureSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const referenceNumber = formData.get("referenceNumber") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 },
      );
    }

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 },
      );
    }

    // Validate file type and size
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed." },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Upload document to temporary location
    // No propertyId or listingId yet - will be set in phase 2
    const document = await uploadDocument(
      file,
      session.user.id,
      referenceNumber,
      1, // documentOrder - will be updated later
      "ficha-encargo", // documentTag for ficha de encargo documents
      undefined, // contactId
      undefined, // listingId - will be set in phase 2
      undefined, // listingContactId
      undefined, // dealId
      undefined, // appointmentId
      undefined, // propertyId - will be set in phase 2
      "initial-docs", // folderType
    );

    // Convert BigInt values to strings for JSON serialization
    const serializedDocument = {
      ...document,
      docId: document.docId.toString(),
      propertyId: document.propertyId?.toString(),
      contactId: document.contactId?.toString(),
      listingId: document.listingId?.toString(),
      listingContactId: document.listingContactId?.toString(),
      dealId: document.dealId?.toString(),
      appointmentId: document.appointmentId?.toString(),
    };

    return NextResponse.json({
      success: true,
      document: serializedDocument,
      message: "Document uploaded successfully to temporary location",
    });
  } catch (error) {
    console.error("Error uploading ficha de encargo document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}