import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, BASE_PATH, expectedToken, hashPassword } from "@/lib/auth";

const loginSchema = z.object({
  password: z.string().min(1),
});

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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const token = await hashPassword(parsed.data.password);
  if (token !== expected) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: BASE_PATH || "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}
