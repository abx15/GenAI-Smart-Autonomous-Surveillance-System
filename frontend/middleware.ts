import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  
  // Dashboard routes that require authentication
  const dashboardRoutes = ['/dashboard'];
  
  // Check if the path is a dashboard route
  const isDashboardRoute = dashboardRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // If trying to access dashboard routes, check authentication
  if (isDashboardRoute) {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token found, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Simple token validation - check if it's a valid JWT format
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        // Token expired, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access auth pages, redirect to dashboard
  if (isPublicRoute && pathname !== '/') {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp > currentTime) {
            // Valid token, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      } catch (error) {
        // Invalid token, continue to auth page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
