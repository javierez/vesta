import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createVisitAction, getUserCompletedVisitsAction } from "~/server/actions/visits";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import type { VisitFormData } from "~/types/visits";

/**
 * POST /api/visits - Create a new visit
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json() as {
      appointmentId: string | number;
      notes?: string;
      agentSignature?: string;
      visitorSignature?: string;
    };
    const formData: VisitFormData = {
      appointmentId: BigInt(data.appointmentId),
      notes: data.notes,
      agentSignature: data.agentSignature,
      visitorSignature: data.visitorSignature,
    };
    const result = await createVisitAction(formData);
    
    if (result.success) {
      return NextResponse.json(result.appointment, { status: 201 });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visits - Get all visits for current user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const result = await getUserCompletedVisitsAction();
    
    if (result.success) {
      return NextResponse.json(result.visits ?? []);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}