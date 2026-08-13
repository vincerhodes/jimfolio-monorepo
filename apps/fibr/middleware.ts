import { NextRequest, NextResponse } from "next/server";
import { BASE_PATH, SESSION_COOKIE } from "@/lib/auth-constants";

// Edge-safe gate: checks only for the *presence* of a session cookie.
// Full session validation happens in getSessionUser() inside pages/routes.
export function middleware(request: NextRequest) {
  // nextUrl.pathname may or may not include the basePath depending on the
  // Next version — normalise by stripping it when present.
  let path = request.nextUrl.pathname;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    path = path.slice(BASE_PATH.length) || "/";
  }

  // Next internals, static assets, and the auth pages/endpoints stay public.
  if (
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path === "/icon.svg" ||
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

  // NextResponse.redirect automatically prepends the configured basePath.
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
