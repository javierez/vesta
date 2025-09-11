import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { getUserRolesFromDB, getPermissionsForRoles } from "~/lib/auth";
import { getCachedUserRoles } from "~/lib/auth-cache";
import { headers } from "next/headers";

export async function GET(_request: NextRequest) {
  try {
    // Get session with proper headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // If no accountId, return basic session
    if (!session.user.accountId) {
      return NextResponse.json(session);
    }

    // Enrich session with roles and permissions (using cache)
    console.log(`🚀 Enriching session for user ${session.user.id}, account ${session.user.accountId}`);
    const userRoles = await getCachedUserRoles(
      session.user.id,
      Number(session.user.accountId),
    );
    const permissions = getPermissionsForRoles(userRoles);

    const enrichedSession = {
      ...session,
      user: {
        ...session.user,
        roles: userRoles,
        permissions: permissions,
      },
    };

    // Convert BigInt values to strings to avoid serialization issues
    const serializedData = JSON.stringify(
      enrichedSession,
      (_key, value: unknown) =>
        typeof value === "bigint"
          ? value.toString()
          : (value as string | number | boolean | null | undefined | object),
    );
    const serializedSession: Record<string, unknown> = JSON.parse(
      serializedData,
    ) as Record<string, unknown>;

    return NextResponse.json(serializedSession);
  } catch (error) {
    console.error("Error fetching enriched session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 },
    );
  }
}
