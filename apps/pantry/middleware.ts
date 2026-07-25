import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, BASE_PATH, expectedToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const expected = await expectedToken();
  if (!expected) return NextResponse.next(); // gate disabled (local dev)

  // nextUrl.pathname may or may not include the basePath depending on the
  // Next version — normalise by stripping it when present.
  let path = request.nextUrl.pathname;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    path = path.slice(BASE_PATH.length) || "/";
  }

  // Next internals and the login/logout endpoints stay public.
  if (
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path === "/login" ||
    path === "/api/login" ||
    path === "/api/logout"
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(AUTH_COOKIE)?.value === expected) {
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

// Match everything (including basePath-prefixed paths); exemptions above.
export const config = {
  matcher: ["/:path*"],
};
