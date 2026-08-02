import { NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, hashPassword } from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const expected = await expectedToken();
  if (!expected) {
    return NextResponse.json({ error: "gate_disabled" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const password =
    typeof (body as { password?: unknown })?.password === "string"
      ? (body as { password: string }).password
      : null;
  if (!password || password.length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const token = await hashPassword(password);
  if (token !== expected) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}
