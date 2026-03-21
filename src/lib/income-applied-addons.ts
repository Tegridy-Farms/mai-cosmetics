import { query } from '@/lib/db';
import { ApiError } from '@/lib/http/api-error';

/**
 * Ensures every id in applied_addon_ids exists and allows the given service type.
 */
export async function assertAppliedAddonsAllowed(
  serviceTypeId: number,
  appliedAddonIds: number[]
): Promise<void> {
  if (appliedAddonIds.length === 0) return;

  const unique = [...new Set(appliedAddonIds)];
  const rows = await query<{ id: number }>(
    `SELECT id FROM addons
     WHERE id = ANY($1::int[])
       AND ($2::int = ANY(service_type_ids))`,
    [unique, serviceTypeId]
  );
  const allowed = new Set(rows.map((r) => r.id));
  for (const id of appliedAddonIds) {
    if (!allowed.has(id)) {
      throw new ApiError(400, 'Invalid addon selection for this service type');
    }
  }
}
