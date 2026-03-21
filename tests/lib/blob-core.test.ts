import {
  BLOB_MAX_FILE_BYTES,
  buildBlobPathname,
  getBlobReadWriteToken,
  isAllowedDocumentMime,
} from '@/lib/blob';

describe('blob config', () => {
  const orig = process.env.BLOB_READ_WRITE_TOKEN;

  afterEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = orig;
  });

  it('exposes a sane max file size', () => {
    expect(BLOB_MAX_FILE_BYTES).toBe(4 * 1024 * 1024);
  });

  it('getBlobReadWriteToken throws when unset', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(() => getBlobReadWriteToken()).toThrow(/BLOB_READ_WRITE_TOKEN/);
  });

  it('getBlobReadWriteToken returns token when set', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    expect(getBlobReadWriteToken()).toBe('test-token');
  });

  it('isAllowedDocumentMime allows PDF and images', () => {
    expect(isAllowedDocumentMime('application/pdf')).toBe(true);
    expect(isAllowedDocumentMime('image/jpeg')).toBe(true);
    expect(isAllowedDocumentMime('image/png')).toBe(true);
    expect(isAllowedDocumentMime('image/webp')).toBe(true);
    expect(isAllowedDocumentMime('application/zip')).toBe(false);
  });
});

describe('buildBlobPathname', () => {
  it('places file under segment with uuid prefix', () => {
    const p = buildBlobPathname('expenses/invoices', 'scan.pdf');
    expect(p.startsWith('expenses/invoices/')).toBe(true);
    expect(p.endsWith('-scan.pdf')).toBe(true);
  });

  it('sanitizes path segments in filename', () => {
    const p = buildBlobPathname('docs', '../../../evil.exe');
    expect(p).not.toContain('..');
    expect(p).toContain('evil.exe');
  });

  it('handles empty basename', () => {
    const p = buildBlobPathname('x', '///');
    expect(p.includes('-file')).toBe(true);
  });
});
