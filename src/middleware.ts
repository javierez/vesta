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
    publicPaths.some((path) => pathname.startsWith(path)) ||
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
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: cookieHeader || "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("No valid session");
    }

    const session = await response.json();

    if (!session?.user) {
      // Redirect to signin with return URL
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Add authenticated user context to request headers for server components
    // Architecture: User authenticates -> User belongs to account -> Account filters data
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);
    requestHeaders.set(
      "x-user-account-id",
      session.user.accountId?.toString() || "",
    );
    requestHeaders.set(
      "x-user-name",
      `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim(),
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Session validation failed, redirect to signin
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
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
