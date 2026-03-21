import { del } from '@vercel/blob';
import { getBlobReadWriteToken } from '@/lib/blob/config';

function isLikelyVercelBlobUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith('.public.blob.vercel-storage.com') || hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

/**
 * Deletes a blob by URL. No-op for empty strings. Only calls the API for URLs that look like Vercel Blob hosts.
 */
export async function deleteBlobByUrl(url: string | null | undefined): Promise<void> {
  if (!url?.trim()) return;
  if (!isLikelyVercelBlobUrl(url)) return;
  const token = getBlobReadWriteToken();
  await del(url, { token });
}
