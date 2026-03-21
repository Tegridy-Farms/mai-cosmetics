import { cookies, headers } from 'next/headers';

/**
 * Server-only helpers for calling this app’s `/api/*` routes from Server Components.
 * Do not import from client components (`'use client'`) — use normal `fetch('/api/...')` there.
 *
 * Call sites: search the repo for `serverFetch(`.
 */

function inferProto(host: string, forwardedProto: string | null): string {
  if (forwardedProto) return forwardedProto;
  const h = host.split(':')[0];
  if (h === 'localhost' || h === '127.0.0.1') return 'http';
  return 'https';
}

/**
 * Absolute URL for same-origin API calls from Server Components / route handlers.
 * Relative `fetch('/api/...')` can omit cookies or resolve incorrectly; this uses the
 * incoming request host and forwards `Cookie` for middleware auth.
 */
export function serverOriginUrl(path: string): string {
  const pathWithSlash = path.startsWith('/') ? path : `/${path}`;
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = inferProto(host, h.get('x-forwarded-proto'));
    return `${proto}://${host}${pathWithSlash}`;
  }
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${pathWithSlash}`;
}

export function serverCookieHeader(): string | undefined {
  const all = cookies().getAll();
  if (all.length === 0) return undefined;
  return all.map((c) => `${c.name}=${c.value}`).join('; ');
}

export function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = serverOriginUrl(path);
  const cookie = serverCookieHeader();
  const nextHeaders = new Headers(init.headers);
  if (cookie && !nextHeaders.has('cookie')) {
    nextHeaders.set('cookie', cookie);
  }
  return fetch(url, {
    ...init,
    cache: init.cache ?? 'no-store',
    headers: nextHeaders,
  });
}
