import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { setDefaultCartelConfigurationWithAuth } from "~/server/queries/cartel-configurations";

// POST - Set cartel configuration as default
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

    const result = await setDefaultCartelConfigurationWithAuth(
      id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuration set as default successfully",
    });
  } catch (error) {
    console.error("Error setting default cartel configuration:", error);
    return NextResponse.json(
      { error: "Failed to set default configuration" },
      { status: 500 }
    );
  }
}