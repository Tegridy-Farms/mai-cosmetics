import { query } from '@/lib/db';

/** Returns true if every id exists in service_types (duplicates in list are ok). */
export async function assertServiceTypesExist(ids: number[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const unique = [...new Set(ids)];
  const rows = await query<{ c: number | string }>(
    `SELECT COUNT(DISTINCT id)::int AS c FROM service_types WHERE id = ANY($1::int[])`,
    [unique]
  );
  const row = rows[0];
  if (row == null) return false;
  return Number(row.c) === unique.length;
}
