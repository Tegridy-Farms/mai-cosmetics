import { zodIssuesToFieldErrors } from '@/lib/zod-field-errors';

describe('zodIssuesToFieldErrors', () => {
  it('returns empty for non-array', () => {
    expect(zodIssuesToFieldErrors(null)).toEqual({});
  });

  it('maps first path segment to message', () => {
    const details = [
      { path: ['service_name'], message: 'Required', code: 'too_small' },
      { path: ['amount'], message: 'Too small', code: 'too_small' },
    ];
    expect(zodIssuesToFieldErrors(details)).toEqual({
      service_name: 'Required',
      amount: 'Too small',
    });
  });
});
