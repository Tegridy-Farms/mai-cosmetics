import { ApiError } from '@/lib/http/api-error';

describe('ApiError', () => {
  it('serializes to stable JSON body', () => {
    const e = new ApiError(400, 'Validation failed', {
      code: 'X',
      details: [{ path: ['a'], message: 'bad', code: 'custom' }],
    });
    expect(e.toBody()).toEqual({
      error: 'Validation failed',
      code: 'X',
      details: [{ path: ['a'], message: 'bad', code: 'custom' }],
    });
  });
});
