import { ApiError } from '@/lib/http/api-error';
import { API_ERROR_CODES } from '@/types/api';

function isPgError(err: unknown): err is { code?: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export function mapPostgresError(err: unknown): ApiError | null {
  if (!isPgError(err) || typeof err.code !== 'string') return null;
  if (err.code === '23505') {
    return new ApiError(409, 'Record already exists', { code: API_ERROR_CODES.DUPLICATE });
  }
  if (err.code === '23503') {
    return new ApiError(409, 'Related record prevents this operation', {
      code: API_ERROR_CODES.CONSTRAINT,
    });
  }
  return null;
}

/**
 * If `err` is a recognized Postgres error, throws ApiError. Otherwise rethrows `err`.
 */
export function rethrowAsApiErrorIfPostgres(err: unknown): never {
  const mapped = mapPostgresError(err);
  if (mapped) throw mapped;
  throw err;
}
