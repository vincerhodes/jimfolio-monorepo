import { cookies } from 'next/headers';

const VALID_USERS = new Set<string>(['mark', 'bec', 'jim', 'stan', 'prajna']);

export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('wesplit_session')?.value;
  if (!session || !VALID_USERS.has(session)) return null;
  return session;
}

export function verifyPassword(username: string, password: string): boolean {
  if (!VALID_USERS.has(username)) return false;
  const envKey = `${username.toUpperCase()}_PASSWORD`;
  const expected = process.env[envKey];
  return !!expected && password === expected;
}
