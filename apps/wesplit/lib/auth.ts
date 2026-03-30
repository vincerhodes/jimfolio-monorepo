import { cookies } from 'next/headers';

const VALID_USERS = new Set<string>(['mark', 'bec', 'jim', 'stan', 'prajna']);

export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('wesplit_session')?.value;
  if (!session || !VALID_USERS.has(session)) return null;
  return session;
}

export function verifyAppPassword(password: string): boolean {
  const expected = process.env.WESPLIT_PASSWORD;
  return !!expected && password === expected;
}
