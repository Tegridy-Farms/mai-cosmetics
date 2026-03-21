import type { ZodIssue } from 'zod';
import { ClientApiError } from '@/lib/api-client';
import { t } from '@/lib/translations';
import { API_ERROR_CODES } from '@/types/api';

export type ShowToastFn = (message: string, type: 'error' | 'success') => void;

function firstZodIssueMessage(details: unknown): string | undefined {
  if (!Array.isArray(details) || details.length === 0) return undefined;
  const first = details[0] as ZodIssue;
  return typeof first?.message === 'string' ? first.message : undefined;
}

export function showToastForClientApiError(e: ClientApiError, toast: ShowToastFn): void {
  if (e.status === 400 && e.body.details) {
    const hint = firstZodIssueMessage(e.body.details);
    toast(hint ? `${t.api.errors.validationFailed} ${hint}` : t.api.errors.validationFailed, 'error');
    return;
  }
  if (e.status === 409) {
    const code = e.body.code;
    const msg =
      code === API_ERROR_CODES.IN_USE
        ? t.api.errors.inUse
        : code === API_ERROR_CODES.DUPLICATE
          ? t.api.errors.duplicate
          : code === API_ERROR_CODES.CONSTRAINT
            ? t.api.errors.constraint
            : e.body.error;
    toast(msg, 'error');
    return;
  }
  if (e.status === 429) {
    toast(t.api.errors.tooManyRequests, 'error');
    return;
  }
  toast(e.body.error || t.toast.couldNotSave, 'error');
}
