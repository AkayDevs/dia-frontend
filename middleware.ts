import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
    // For development, bypass all auth checks and redirect to dashboard
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // For development, allow all requests
    return NextResponse.next();

    /* Comment out the actual auth checks for now
    const { pathname } = request.nextUrl;
    
    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
  
    // Redirect to login if accessing a protected route without a token
    if (!isPublicPath && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  
    // Redirect to dashboard if accessing auth pages with a valid token
    if (isPublicPath && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  
    return NextResponse.next();
    */
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /api/ (API routes)
         * 2. /_next/ (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /_vercel (Vercel internals)
         * 5. /favicon.ico, /sitemap.xml (static files)
         */
        '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
    ],
}; 