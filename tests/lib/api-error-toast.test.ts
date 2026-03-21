import { ClientApiError } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { API_ERROR_CODES } from '@/types/api';

describe('showToastForClientApiError', () => {
  it('shows validation message for 400 with details', () => {
    const toast = jest.fn();
    showToastForClientApiError(
      new ClientApiError(400, { error: 'Validation failed', details: [] }),
      toast
    );
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('appends first Zod issue message for 400', () => {
    const toast = jest.fn();
    showToastForClientApiError(
      new ClientApiError(400, {
        error: 'Validation failed',
        details: [{ code: 'custom', path: ['slug'], message: 'Bad slug' }],
      }),
      toast
    );
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('Bad slug'), 'error');
  });

  it('maps IN_USE', () => {
    const toast = jest.fn();
    showToastForClientApiError(
      new ClientApiError(409, { error: 'x', code: API_ERROR_CODES.IN_USE }),
      toast
    );
    expect(toast).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});
