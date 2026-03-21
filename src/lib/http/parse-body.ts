import { ApiError } from '@/lib/http/api-error';

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
}
