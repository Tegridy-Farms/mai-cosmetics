import { ApiError } from '@/lib/http/api-error';
import { toResponse } from '@/lib/http/to-response';

describe('toResponse', () => {
  it('maps ApiError to JSON with status', async () => {
    const res = toResponse(new ApiError(404, 'Not found'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('maps unknown errors to 500', async () => {
    const res = toResponse(new Error('boom'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
