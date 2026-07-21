// Shared-password gate. The cookie stores sha256(CREMA_PASSWORD) so the
// middleware (edge runtime) only ever compares hashes, never the password.
// Web Crypto is used instead of node:crypto so the same code runs in
// middleware and in route handlers.
export const AUTH_COOKIE = "crema_auth";

// Mirror of next.config.ts basePath.
export const BASE_PATH = process.env.VERCEL ? "" : "/crema";

export function gateEnabled(): boolean {
  return Boolean(process.env.CREMA_PASSWORD);
}

export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Hash the cookie must contain, or null when the gate is disabled.
export async function expectedToken(): Promise<string | null> {
  const password = process.env.CREMA_PASSWORD;
  if (!password) return null;
  return hashPassword(password);
}
