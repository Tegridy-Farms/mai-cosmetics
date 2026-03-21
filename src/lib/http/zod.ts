import type { z } from 'zod';
import { ApiError } from '@/lib/http/api-error';

export function parseSchema<T>(schema: z.ZodType<T>, data: unknown, message = 'Validation failed'): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(400, message, { details: parsed.error.issues });
  }
  return parsed.data;
}

export function parseSearchParams<T>(
  schema: z.ZodType<T>,
  request: Request,
  message = 'Validation failed'
): T {
  const url = new URL(request.url);
  const obj = Object.fromEntries(url.searchParams.entries());
  return parseSchema(schema, obj, message);
}
