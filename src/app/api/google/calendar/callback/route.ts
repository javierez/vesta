import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/dal";
import { exchangeCodeForTokens, storeUserIntegration, startWatchChannel } from "~/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(new URL(`/calendario?error=oauth_failed`, request.url));
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(new URL(`/calendario?error=invalid_callback`, request.url));
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL(`/calendario?error=unauthorized`, request.url));
    }

    // Verify state parameter (basic verification - in production you'd want more robust state management)
    if (!state.startsWith(user.id)) {
      return NextResponse.redirect(new URL(`/calendario?error=invalid_state`, request.url));
    }

    try {
      // Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(code);
      
      if (!tokens?.access_token) {
        throw new Error("No access token received");
      }

      // Store tokens in database
      await storeUserIntegration(user.id, tokens);

      // Start watching for calendar changes
      const watchStarted = await startWatchChannel(user.id);
      if (!watchStarted) {
        console.warn("Failed to start watch channel for user:", user.id);
      }

      // Redirect back to calendar with success message
      return NextResponse.redirect(new URL(`/calendario?success=google_connected`, request.url));
    } catch (tokenError) {
      console.error("Error exchanging tokens:", tokenError);
      return NextResponse.redirect(new URL(`/calendario?error=token_exchange_failed`, request.url));
    }
  } catch (error) {
    console.error("Error in Google Calendar callback:", error);
    return NextResponse.redirect(new URL(`/calendario?error=callback_failed`, request.url));
  }
}