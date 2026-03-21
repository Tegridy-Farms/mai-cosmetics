import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, options?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }

  toBody(): ApiErrorBody {
    const body: ApiErrorBody = { error: this.message };
    if (this.code !== undefined) body.code = this.code;
    if (this.details !== undefined) body.details = this.details as ApiErrorBody['details'];
    return body;
  }
}
