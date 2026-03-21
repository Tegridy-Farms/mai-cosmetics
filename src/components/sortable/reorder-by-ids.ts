import { parseSortableId } from '@/components/sortable/sortable-ids';

/** Reorders `items` to match `nextOrderIds` (dnd-kit sortable string ids). */
export function reorderItemsBySortableIds<T extends { id: number }>(
  items: T[],
  nextOrderIds: string[]
): T[] {
  const idMap = new Map(items.map((x) => [x.id, x] as const));
  const out: T[] = [];
  for (const sid of nextOrderIds) {
    const id = parseSortableId(sid);
    if (id == null) continue;
    const row = idMap.get(id);
    if (row) out.push(row);
  }
  return out;
}
