import { sql } from '@vercel/postgres';

export { sql };

export async function query<T = unknown>(queryText: string, params?: unknown[]): Promise<T[]> {
  const result = await sql.query(queryText, params);
  return result.rows as T[];
}
