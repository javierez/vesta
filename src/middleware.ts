import { type NextRequest, NextResponse } from "next/server";

// Public paths that should not require authentication
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",  
  "/auth/forgot-password",
  "/auth/account-setup",
  "/api/auth",
  "/api/puppet/template",
  "/templates",
  "/producto/caracteristicas",
  "/producto/integraciones",
  "/producto/seguridad",
  "/producto/api",
  "/soluciones/equipos-ventas",
  "/soluciones/equipos-marketing",
  "/soluciones/servicio-cliente",
  "/soluciones/pequenas-empresas",
  "/soluciones/empresas",
  "/precios",
  "/recursos/documentacion",
  "/recursos/blog",
  "/recursos/soporte",
  "/empresa/nosotros",
  "/empresa/carreras",
  "/empresa/socios",
  "/empresa/contacto",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public paths and static assets
  if (
    publicPaths.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Everything else is protected - requires authentication
  // Use cookie-based check to avoid Edge Runtime database issues
  const sessionToken = request.cookies.get("better-auth.session_token");
  
  if (!sessionToken?.value) {
    // No session token, redirect to signin
    const signinUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  // For authenticated users, let the DAL handle full session validation
  // We just pass through with basic session indication
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-has-session-token", "true");


  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
