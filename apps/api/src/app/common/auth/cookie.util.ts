const DEFAULT_COOKIE_PATH = '/';

function encodeCookieValue(value: string) {
  return encodeURIComponent(value);
}

export function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    path?: string;
  } = {}
) {
  const parts = [`${name}=${encodeCookieValue(value)}`];
  parts.push(`Path=${options.path ?? DEFAULT_COOKIE_PATH}`);

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.httpOnly ?? true) {
    parts.push('HttpOnly');
  }

  if (options.sameSite ?? 'Lax') {
    parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  }

  if (options.secure ?? process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function clearCookie(name: string) {
  return serializeCookie(name, '', { maxAge: 0 });
}

export function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;

  for (const entry of cookieHeader.split(';')) {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}
