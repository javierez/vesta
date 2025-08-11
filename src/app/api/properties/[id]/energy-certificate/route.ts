import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getEnergyCertificate } from "~/server/queries/document";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    const energyCertificate = await getEnergyCertificate(propertyId);

    return NextResponse.json(energyCertificate);
  } catch (error) {
    console.error("Error fetching energy certificate:", error);
    return NextResponse.json(
      { error: "Failed to fetch energy certificate" },
      { status: 500 }
    );
  }
}