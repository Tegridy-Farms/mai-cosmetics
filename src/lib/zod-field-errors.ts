import type { ZodIssue } from 'zod';

/** Maps first path segment of each Zod issue to a single message (first wins per field). */
export function zodIssuesToFieldErrors(details: unknown): Record<string, string> {
  if (!Array.isArray(details)) return {};
  const out: Record<string, string> = {};
  for (const issue of details as ZodIssue[]) {
    const first = issue.path[0];
    const key = first === undefined || first === null ? '_' : String(first);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
