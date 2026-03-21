/** Stable string ids for @dnd-kit (sortable keys must be strings). */

const PREFIX = 'row:';

export function toSortableId(numericId: number): string {
  return `${PREFIX}${numericId}`;
}

export function parseSortableId(id: string | number): number | null {
  const s = String(id);
  if (!s.startsWith(PREFIX)) return null;
  const n = Number(s.slice(PREFIX.length));
  return Number.isFinite(n) ? n : null;
}
