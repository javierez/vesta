import { type NextRequest, NextResponse } from "next/server";

// Public paths that should not require authentication
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public paths and static assets
  if (
    publicPaths.some((path) => path === "/" ? pathname === "/" : pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Everything else is protected - requires authentication
  try {
    // Verify session using BetterAuth
    const { headers } = request;
    const cookieHeader = headers.get("cookie");

    const response = await fetch(
      `${request.nextUrl.origin}/api/auth/enriched-session`,
      {
        headers: {
          cookie: cookieHeader ?? "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("No valid session");
    }

    const session = await response.json() as {
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        accountId?: number;
        roles?: string[];
        permissions?: string[];
      };
    };

    if (!session?.user) {
      // Redirect to signin page
      const signinUrl = new URL("/auth/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }

    // Add authenticated user context to request headers for server components
    // Architecture: User authenticates -> User belongs to account -> Account filters data
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);
    requestHeaders.set(
      "x-user-account-id",
      session.user.accountId?.toString() ?? "",
    );

    // Add roles and permissions to headers if available
    if (session.user.roles) {
      requestHeaders.set("x-user-roles", JSON.stringify(session.user.roles));
    }
    if (session.user.permissions) {
      requestHeaders.set("x-user-permissions", JSON.stringify(session.user.permissions));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Session validation failed, redirect to signin page
    const signinUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }
} 


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
