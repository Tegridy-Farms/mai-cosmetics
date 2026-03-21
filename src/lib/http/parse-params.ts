import { ApiError } from '@/lib/http/api-error';

export function parseIdParam(param: string | string[] | undefined): number {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
    throw new ApiError(400, 'Invalid id');
  }
  return id;
}
