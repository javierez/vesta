import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { userIntegrations } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { syncFromGoogle } from "~/lib/google-calendar-sync";

export async function POST(request: NextRequest) {
  try {
    // Get headers for webhook verification
    const channelId = request.headers.get("x-goog-channel-id");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _channelToken = request.headers.get("x-goog-channel-token");
    const resourceState = request.headers.get("x-goog-resource-state");
    const resourceId = request.headers.get("x-goog-resource-id");

    // Validate required headers
    if (!channelId || !resourceId) {
      console.error("Missing required webhook headers");
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // Find the user associated with this channel
    const integration = await db
      .select()
      .from(userIntegrations)
      .where(
        and(
          eq(userIntegrations.channelId, channelId),
          eq(userIntegrations.resourceId, resourceId),
          eq(userIntegrations.provider, "google_calendar"),
          eq(userIntegrations.isActive, true),
        ),
      )
      .limit(1);

    if (!integration.length) {
      console.error("No integration found for channel:", channelId);
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const userIntegration = integration[0]!;
    const userId = userIntegration.userId;

    // Handle different resource states
    if (resourceState === "sync") {
      // Initial sync message - acknowledge but don't process
      console.log("Received initial sync notification for user:", userId);
      return NextResponse.json({ success: true });
    }

    if (resourceState === "exists") {
      // Calendar has changes - trigger incremental sync
      console.log("Calendar changed for user:", userId, "- triggering sync");

      // Trigger sync asynchronously to respond quickly
      syncFromGoogle(userId).catch((error) => {
        console.error("Async sync failed for user:", userId, error);
      });
    }

    // Respond quickly to Google
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to avoid Google retrying
    return NextResponse.json({ success: true });
  }
}

// Handle GET requests (verification)
export async function GET(_request: NextRequest) {
  // Some webhook services send verification requests
  return NextResponse.json({ success: true });
}
