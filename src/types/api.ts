import type { ZodIssue } from 'zod';

/** JSON body for failed API responses (stable contract). */
export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: ZodIssue[] | unknown;
}

export const API_ERROR_CODES = {
  IN_USE: 'IN_USE',
  DUPLICATE: 'DUPLICATE',
  CONSTRAINT: 'CONSTRAINT',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginatedMeta;
}
