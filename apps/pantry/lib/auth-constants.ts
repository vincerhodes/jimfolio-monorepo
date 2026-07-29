// Edge-safe auth constants — imported by middleware (edge runtime), so this
// module must not pull in node:crypto, next/headers, or Prisma.
export const SESSION_COOKIE = "pantry_session";

// Mirror of next.config.ts basePath.
export const BASE_PATH = process.env.VERCEL ? "" : "/pantry";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: BASE_PATH || "/",
} as const;
