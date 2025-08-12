import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/dal";
import { getUserIntegration } from "~/lib/google-calendar";

export async function GET(_request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Google Calendar integration
    const integration = await getUserIntegration(user.id);
    
    if (integration?.isActive) {
      return NextResponse.json({
        connected: true,
        lastSync: integration.syncToken ? new Date().toISOString() : null,
        calendarId: integration.calendarId,
      });
    } else {
      return NextResponse.json({
        connected: false,
        lastSync: null,
      });
    }
  } catch (error) {
    console.error("Error checking Google Calendar status:", error);
    return NextResponse.json(
      { error: "Failed to check integration status" },
      { status: 500 }
    );
  }
}