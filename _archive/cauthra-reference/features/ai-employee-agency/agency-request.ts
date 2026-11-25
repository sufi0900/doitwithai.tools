import { browserAccounts } from '@/features/tools-workspace/supabase';

export async function agencyRequest(path: string, options: RequestInit = {}) {
  const db = await browserAccounts();
  const session = await db?.auth.getSession();
  const headers = new Headers(options.headers);
  if (session?.data.session) headers.set('Authorization', 'Bearer ' + session.data.session.access_token);
  return fetch(path, { ...options, headers, cache: 'no-store' });
}
