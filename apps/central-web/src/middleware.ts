import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIX = '/portal';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Better Auth stores the session token in one of these cookies
  const sessionCookie =
    req.cookies.get('better-auth.session_token') ||
    req.cookies.get('__Secure-better-auth.session_token');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
