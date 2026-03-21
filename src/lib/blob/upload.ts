import { put, type PutBlobResult } from '@vercel/blob';
import { getBlobReadWriteToken } from '@/lib/blob/config';

type PutBody = Parameters<typeof put>[1];

export async function uploadPublicBlob(params: {
  pathname: string;
  body: PutBody;
  contentType: string;
}): Promise<PutBlobResult> {
  const token = getBlobReadWriteToken();
  return put(params.pathname, params.body, {
    access: 'public',
    token,
    contentType: params.contentType,
  });
}
