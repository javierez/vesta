import { NextRequest, NextResponse } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';

// Protected route patterns
const protectedPaths = [
  '/dashboard',
  '/contactos',
  '/inmuebles',
  '/configuracion',
  '/configuracion/integrations',
  '/api/dashboard',
  '/api/contactos',
  '/api/inmuebles',
  '/api/configuracion',
];

// Public paths that should not redirect
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/signup', 
  '/auth/forgot-password',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow public paths and static assets
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if current path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    try {
      // Verify session using BetterAuth
      const { headers } = request;
      const cookieHeader = headers.get('cookie');
      
      const response = await betterFetch('/api/auth/get-session', {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: cookieHeader || '',
        },
      });

      if (!response.ok) {
        throw new Error('No valid session');
      }

      const session = await response.json();
      
      if (!session || !session.user) {
        // Redirect to signin with return URL
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Add user session data to request headers for server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-account-id', session.user.accountId?.toString() || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Session validation failed, redirect to signin
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
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
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};