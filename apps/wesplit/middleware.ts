import { NextRequest, NextResponse } from 'next/server';

const VALID_USERS = new Set(['mark', 'bec', 'jim', 'stan', 'prajna']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/wesplit/login' ||
    pathname.startsWith('/wesplit/_next/') ||
    pathname === '/wesplit/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('wesplit_session')?.value;

  if (!session || !VALID_USERS.has(session)) {
    return NextResponse.redirect(new URL('/wesplit/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/wesplit', '/wesplit/:path*'],
};
