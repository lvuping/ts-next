import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CacheControl, addCacheHeaders } from '@/lib/cache-headers';

const PUBLIC_PATHS = ['/login', '/api/auth'];
const STATIC_EXTENSIONS = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.css', '.js', '.woff', '.woff2'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle static files with appropriate cache headers
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    const response = NextResponse.next();
    const isFont = pathname.endsWith('.woff') || pathname.endsWith('.woff2');
    const isImage = pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.svg') || pathname.endsWith('.ico');
    
    if (isFont || isImage) {
      return addCacheHeaders(response, CacheControl.PUBLIC_IMMUTABLE);
    } else {
      return addCacheHeaders(response, CacheControl.PUBLIC_STATIC);
    }
  }
  
  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check authentication
  const authCookie = request.cookies.get('authenticated');
  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};