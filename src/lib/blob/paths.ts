import { randomUUID } from 'crypto';

const MAX_BASENAME_LEN = 120;

/**
 * Builds a store pathname under a folder segment, with a random prefix and sanitized filename.
 */
export function buildBlobPathname(segment: string, originalFilename: string): string {
  const folder = segment.replace(/^\/+|\/+$/g, '');
  const rawBase = originalFilename.replace(/^.*[/\\]/, '');
  const sanitized = rawBase.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
  const base = sanitized.length > MAX_BASENAME_LEN ? sanitized.slice(0, MAX_BASENAME_LEN) : sanitized;
  return `${folder}/${randomUUID()}-${base}`;
}
