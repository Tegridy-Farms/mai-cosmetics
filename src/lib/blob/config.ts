/** Stay under Vercel serverless request body limits (~4.5MB). */
export const BLOB_MAX_FILE_BYTES = 4 * 1024 * 1024;

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type DocumentMimeType = (typeof DOCUMENT_MIME_TYPES)[number];

export function getBlobReadWriteToken(): string {
  const t = process.env.BLOB_READ_WRITE_TOKEN;
  if (!t?.trim()) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }
  return t;
}

export function isAllowedDocumentMime(type: string): boolean {
  return (DOCUMENT_MIME_TYPES as readonly string[]).includes(type);
}
