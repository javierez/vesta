import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getVisitSignaturesAction } from "~/server/actions/visits";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/visits/[id] - Get visit signatures by appointment ID
 */
export async function GET(
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
    const appointmentId = parseInt(id);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
        { status: 400 },
      );
    }

    const result = await getVisitSignaturesAction(BigInt(appointmentId));

    if (result.success) {
      return NextResponse.json(result.signatures ?? []);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching visit signatures:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH and DELETE methods removed since we're using appointments table
// Visit status is managed through appointment status
// Signatures are stored as documents
