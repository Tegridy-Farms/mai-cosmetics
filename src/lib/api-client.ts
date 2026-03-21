import type { ApiErrorBody } from '@/types/api';

export class ClientApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error);
    this.name = 'ClientApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function asErrorBody(data: unknown, fallback: string): ApiErrorBody {
  if (data && typeof data === 'object' && 'error' in data && typeof (data as ApiErrorBody).error === 'string') {
    return data as ApiErrorBody;
  }
  return { error: fallback };
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = await parseJsonBody(response);
  if (!response.ok) {
    throw new ClientApiError(response.status, asErrorBody(data, 'Request failed'));
  }
  return data as T;
}

export function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  return apiJson<T>(path, { ...init, method: 'GET' });
}

export function postJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return apiJson<T>(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: JSON.stringify(body),
  });
}

export function putJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return apiJson<T>(path, {
    ...init,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: JSON.stringify(body),
  });
}

export function deleteJson<T>(path: string, init?: RequestInit): Promise<T> {
  return apiJson<T>(path, { ...init, method: 'DELETE' });
}
