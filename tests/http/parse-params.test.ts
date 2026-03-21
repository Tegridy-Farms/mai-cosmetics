import { ApiError } from '@/lib/http/api-error';
import { parseIdParam } from '@/lib/http/parse-params';

describe('parseIdParam', () => {
  it('parses positive integer string', () => {
    expect(parseIdParam('42')).toBe(42);
  });

  it('rejects invalid values', () => {
    expect(() => parseIdParam('abc')).toThrow(ApiError);
    expect(() => parseIdParam('0')).toThrow(ApiError);
    expect(() => parseIdParam('-1')).toThrow(ApiError);
  });
});
