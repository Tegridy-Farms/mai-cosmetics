import { reorderItemsBySortableIds } from '@/components/sortable/reorder-by-ids';
import { toSortableId } from '@/components/sortable/sortable-ids';
import { ReorderBodySchema } from '@/lib/validation/reorder';

describe('ReorderBodySchema', () => {
  it('accepts ordered_ids array', () => {
    expect(ReorderBodySchema.parse({ ordered_ids: [3, 1, 2] })).toEqual({ ordered_ids: [3, 1, 2] });
  });

  it('rejects non-positive ids', () => {
    expect(() => ReorderBodySchema.parse({ ordered_ids: [1, 0] })).toThrow();
  });
});

describe('reorderItemsBySortableIds', () => {
  it('reorders items to match id order', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];
    const next = [toSortableId(3), toSortableId(1), toSortableId(2)];
    expect(reorderItemsBySortableIds(items, next)).toEqual([
      { id: 3, name: 'c' },
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ]);
  });
});
