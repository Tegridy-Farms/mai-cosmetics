'use client';

import { useCallback, useState } from 'react';
import { ClientApiError } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import { zodIssuesToFieldErrors } from '@/lib/zod-field-errors';

export type ShowToastFn = (message: string, type: 'error' | 'success') => void;

/**
 * Shared client submit state: API field errors + loading flag.
 * Pair with `showToastForClientApiError` or use `onSubmitError`.
 */
export function useApiFormSubmit() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldErrors = useCallback(() => setFieldErrors({}), []);

  const onSubmitError = useCallback((e: unknown, toast: ShowToastFn) => {
    if (e instanceof ClientApiError) {
      showToastForClientApiError(e, toast);
      if (e.status === 400 && e.body.details) {
        setFieldErrors(zodIssuesToFieldErrors(e.body.details));
      }
      return;
    }
    toast(t.toast.couldNotSave, 'error');
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    clearFieldErrors,
    isSubmitting,
    setIsSubmitting,
    onSubmitError,
  };
}

export { showToastForClientApiError } from '@/lib/api-error-toast';
