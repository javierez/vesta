import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/dal";
import { syncFromGoogle } from "~/lib/google-calendar-sync";

export async function POST(_request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trigger manual sync from Google Calendar
    const result = await syncFromGoogle(user.id);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Sync completed successfully",
        syncedEvents: result.syncedEvents
      });
    } else {
      return NextResponse.json(
        { error: result.error ?? "Sync failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in manual sync:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}