import { ApiError } from '@/lib/http/api-error';
import { json } from '@/lib/http/json';
import { mapPostgresError } from '@/lib/http/postgres';

function logServerError(err: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[api]', err);
  } else {
    console.error('[api] unexpected error');
  }
}

export function toResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return json(err.toBody(), err.status);
  }

  const pg = mapPostgresError(err);
  if (pg) return json(pg.toBody(), pg.status);

  logServerError(err);
  return json({ error: 'Internal server error' }, 500);
}
