import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isInternalMode = process.env.INTERNAL_MODE === 'true';
  const path = request.nextUrl.pathname;

  // If internal mode and accessing root, redirect to /internal
  if (isInternalMode && path === '/') {
    return NextResponse.redirect(new URL('/internal', request.url));
  }

  // If NOT internal mode and trying to access /internal, redirect to home
  if (!isInternalMode && path.startsWith('/internal')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/internal/:path*'],
};
