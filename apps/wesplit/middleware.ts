import { NextRequest, NextResponse } from 'next/server';

const VALID_USERS = new Set(['mark', 'bec', 'jim', 'stan', 'prajna']);
// Local dev serves under /wesplit (nginx-era basePath); Vercel serves at root.
const BASE = process.env.VERCEL ? '' : '/wesplit';

export function middleware(request: NextRequest) {
  let pathname = request.nextUrl.pathname;
  if (BASE && pathname.startsWith(BASE)) {
    pathname = pathname.slice(BASE.length) || '/';
  }

  if (
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('wesplit_session')?.value;

  if (!session || !VALID_USERS.has(session)) {
    return NextResponse.redirect(new URL(`${BASE}/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
