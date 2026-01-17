import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth/utils';

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to login if no token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `returnTo=${request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  // Verify token
  const user = verifyToken(token);
  if (!user) {
    // Redirect to login if token is invalid
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check role-based access if needed
  const requiredRole = getRequiredRoleForPath(request.nextUrl.pathname);
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to unauthorized page
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  // Allow access
  return NextResponse.next();
}

// Define role requirements for different paths
function getRequiredRoleForPath(pathname: string): string | null {
  if (pathname.startsWith('/pegawai-rmp')) {
    return 'pegawai_rmp';
  } else if (pathname.startsWith('/pegawai-mp')) {
    return 'pegawai_mp';
  } else if (pathname.startsWith('/hr')) {
    return 'staff_hr';
  } else if (pathname.startsWith('/manajer')) {
    return 'manajer';
  }
  return null;
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};