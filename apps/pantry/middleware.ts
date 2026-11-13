import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Edge-safe gate: checks only for the *presence* of a session cookie.
// Full session validation happens in getSessionUser() inside pages/routes.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Next internals, static assets, and the auth pages/endpoints stay public.
  if (
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path === "/login" ||
    path === "/signup" ||
    path.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next();
  }

  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `?next=${encodeURIComponent(path)}`;
  return NextResponse.redirect(loginUrl);
}

// Match everything except Next internals and static assets; exemptions above.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
