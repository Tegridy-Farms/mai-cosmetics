import { query, sql } from '@/lib/db';
import { ApiError } from '@/lib/http/api-error';
import { QueryResultRow } from '@vercel/postgres';

export type ReorderTable = 'lead_sources' | 'service_types';

function validatePermutation(orderedIds: number[], dbIds: number[]): void {
  if (dbIds.length === 0) {
    if (orderedIds.length !== 0) {
      throw new ApiError(400, 'ordered_ids must be empty when there are no rows');
    }
    return;
  }

  const dbSet = new Set(dbIds);
  if (orderedIds.length !== dbSet.size) {
    throw new ApiError(400, 'ordered_ids must list each record exactly once');
  }

  const seen = new Set<number>();
  for (const id of orderedIds) {
    if (!dbSet.has(id) || seen.has(id)) {
      throw new ApiError(400, 'ordered_ids must match the current set of records');
    }
    seen.add(id);
  }
}

/**
 * Validates `ordered_ids` is a permutation of all rows in `table`, then sets `sort_order` to each index.
 */
export async function applyReorder(table: ReorderTable, orderedIds: number[]): Promise<void> {
  const rows =
    table === 'lead_sources'
      ? await sql`SELECT id FROM lead_sources`
      : await sql`SELECT id FROM service_types`;

  const dbIds = rows.rows.map((r: QueryResultRow) => (r as { id: number }).id);
  validatePermutation(orderedIds, dbIds);

  if (orderedIds.length === 0) return;

  const tuples = orderedIds.map((id, i) => `(${id}, ${i})`).join(', ');
  const tableName = table === 'lead_sources' ? 'lead_sources' : 'service_types';

  await query(
    `UPDATE ${tableName} AS t SET sort_order = v.ord FROM (VALUES ${tuples}) AS v(id, ord) WHERE t.id = v.id`
  );
}
