import { type NextRequest, NextResponse } from "next/server";
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
    // Convert BigInt values to strings for JSON serialization
    const serializedRoles = userRoles.map(role => ({
      ...role,
      userRoleId: role.userRoleId.toString(),
      roleId: role.roleId.toString(),
    }));
    
    return NextResponse.json(serializedRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}