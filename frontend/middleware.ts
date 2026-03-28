import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the auth token in cookies or headers (if implemented with cookies)
  // For local dev with zustand/localStorage, middleware cannot easily check localStorage.
  // Instead, we can check a 'swarlipi_token' cookie if we set it.
  
  // For now, let's keep it simple: if the path is /projects and no cookie exists, redirect.
  // (Assuming we set a cookie on login as well)
  
  const token = request.cookies.get('swarlipi_token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/projects') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/projects', '/projects/:path*'],
};
