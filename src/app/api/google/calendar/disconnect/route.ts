import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/dal";
import { disconnectIntegration } from "~/lib/google-calendar";

export async function POST(_request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Disconnect Google Calendar integration
    const success = await disconnectIntegration(user.id);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "Google Calendar disconnected successfully" 
      });
    } else {
      return NextResponse.json(
        { error: "Failed to disconnect Google Calendar" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}