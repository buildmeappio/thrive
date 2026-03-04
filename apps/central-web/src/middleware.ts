import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './domains/auth/server/better-auth/auth';

const PROTECTED_PREFIX = '/portal';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const headersList = req.headers;

  // Better Auth stores the session token in one of these cookies
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/portal/:path*'],
  runtime: 'nodejs',
};
