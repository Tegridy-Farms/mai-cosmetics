/** Coerce values for @vercel/postgres `sql` tagged templates when Zod output types are too wide. */
export function asSqlString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  return String(v);
}
