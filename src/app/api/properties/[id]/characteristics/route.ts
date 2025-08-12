import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getListingDetailsWithAuth } from "~/server/queries/listing";
import { convertDbListingToPropertyListing } from "~/types/property-listing";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id);

    const listing = await getListingDetailsWithAuth(listingId);

    if (!listing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const convertedListing = convertDbListingToPropertyListing(listing);

    return NextResponse.json(convertedListing);
  } catch (error) {
    console.error("Error fetching property characteristics:", error);
    return NextResponse.json(
      { error: "Failed to fetch property characteristics" },
      { status: 500 },
    );
  }
}
