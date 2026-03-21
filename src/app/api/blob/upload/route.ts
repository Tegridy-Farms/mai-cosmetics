import {
  BLOB_MAX_FILE_BYTES,
  buildBlobPathname,
  isAllowedDocumentMime,
  uploadPublicBlob,
} from '@/lib/blob';
import { ApiError, json, withApiHandlerNoParams } from '@/lib/http';

const INVOICE_SEGMENT = 'expenses/invoices';

export const POST = withApiHandlerNoParams(async (request) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ApiError(400, 'Invalid form data');
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
    throw new ApiError(400, 'Missing file');
  }

  const contentType = file.type || 'application/octet-stream';
  if (!isAllowedDocumentMime(contentType)) {
    throw new ApiError(400, 'File type not allowed');
  }

  if (file.size > BLOB_MAX_FILE_BYTES) {
    throw new ApiError(400, 'File too large');
  }

  const pathname = buildBlobPathname(INVOICE_SEGMENT, file.name);

  try {
    const result = await uploadPublicBlob({
      pathname,
      body: file.stream(),
      contentType,
    });
    return json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('BLOB_READ_WRITE_TOKEN')) {
      throw new ApiError(503, 'File storage is not configured');
    }
    throw err;
  }
});
