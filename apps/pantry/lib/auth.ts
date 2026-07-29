// User auth: scrypt password hashing + DB-backed sessions in an httpOnly
// cookie. Middleware only checks cookie presence; full validation happens
// here via getSessionUser() in server components and route handlers.
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { BASE_PATH, SESSION_COOKIE, cookieOptions } from "@/lib/auth-constants";
import type { User } from "@prisma/client";

const scrypt = promisify(scryptCb);

export { BASE_PATH, SESSION_COOKIE, cookieOptions };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Format: "<salt_hex>:<hash_hex>" (matches scripts/migrate-to-users.mjs).
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(actual, expected);
}

// Creates a Session row and sets the cookie. Call from route handlers only.
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id: token,
      userId,
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
    },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: THIRTY_DAYS_MS / 1000,
  });
}

// Current user from the session cookie, or null. Deletes expired sessions.
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: token } }).catch(() => {});
    return null;
  }
  return session.user;
}

// Deletes the Session row for the current cookie and clears the cookie.
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { id: token } }).catch(() => {});
  }
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
