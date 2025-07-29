import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { getUserRoles } from "~/server/queries/user-roles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { userId } = await params;
    
    // Verify the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can only fetch their own roles unless they're superadmin
    if (session.user.id !== userId) {
      // Check if requesting user is superadmin
      const requestingUserRoles = await getUserRoles(session.user.id);
      const isSuperAdmin = requestingUserRoles.some(role => Number(role.roleId) === 2);
      
      if (!isSuperAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const userRoles = await getUserRoles(userId);
    return NextResponse.json(userRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}