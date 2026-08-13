import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const expected = await expectedToken();
  if (!expected) return NextResponse.next(); // gate disabled (local dev)

  const path = request.nextUrl.pathname;

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

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `?next=${encodeURIComponent(path)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
