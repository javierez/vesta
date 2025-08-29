import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadDocument } from "~/app/actions/upload";
import { getDocumentsByFolderType } from "~/server/queries/document";
import { getListingDocumentsData } from "~/server/queries/listing";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await getListingDocumentsData(parseInt(id));

    if (!listing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderType = formData.get("folderType") as
      | "initial-docs"
      | "visitas"
      | "others";

    if (!file || !folderType) {
      return NextResponse.json(
        { error: "File and folder type are required" },
        { status: 400 },
      );
    }

    // Map folder types to document tags for database storage
    const documentTagMap = {
      "initial-docs": "documentacion-inicial",
      visitas: "visitas",
      others: "otros",
    };

    const documentTag = documentTagMap[folderType];

    const document = await uploadDocument(
      file,
      session.user.id,
      listing.referenceNumber ?? `TEMP_${listing.listingId}`,
      1, // documentOrder
      documentTag,
      undefined, // contactId
      listing.listingId, // listingId
      undefined, // listingContactId
      undefined, // dealId
      undefined, // appointmentId
      listing.propertyId, // propertyId
      folderType,
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

    return NextResponse.json(serializedDocument);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await getListingDocumentsData(parseInt(id));

    if (!listing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(request.url);
    const folderType = searchParams.get("folderType") as
      | "initial-docs"
      | "visitas"
      | "others"
      | null;

    if (!folderType) {
      return NextResponse.json(
        { error: "Folder type is required" },
        { status: 400 },
      );
    }

    // Map folder types to document tags for database query
    const documentTagMap = {
      "initial-docs": "documentacion-inicial",
      visitas: "visitas",
      others: "otros",
    };

    const documentTag = documentTagMap[folderType];
    const documents = await getDocumentsByFolderType(
      listing.propertyId,
      documentTag,
    );

    // Convert BigInt values to strings for JSON serialization
    const serializedDocuments = documents.map((doc) => ({
      ...doc,
      docId: doc.docId.toString(),
      propertyId: doc.propertyId?.toString(),
      contactId: doc.contactId?.toString(),
      listingId: doc.listingId?.toString(),
      listingContactId: doc.listingContactId?.toString(),
      dealId: doc.dealId?.toString(),
      appointmentId: doc.appointmentId?.toString(),
    }));

    return NextResponse.json(serializedDocuments);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
