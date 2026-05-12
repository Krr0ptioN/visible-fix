import 'server-only';

import { cookies } from 'next/headers';

export function getServerApiOrigin() {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL
  )?.replace(/\/api\/v1\/?$/, '');
}

export async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

export async function serverApiRequest(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const cookieHeader = await getCookieHeader();

  headers.set('accept', 'application/json');

  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  return fetch(`${getServerApiOrigin()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function parseApiResponse<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as { data?: T; message?: string } | null;

  if (!response.ok) {
    throw new Error(body?.message || `Request failed with status ${response.status}.`);
  }

  return body as { data: T; message?: string };
}
