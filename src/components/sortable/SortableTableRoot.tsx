'use client';

import React, { useCallback } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export interface SortableTableRootProps {
  itemIds: string[];
  onReorderIds: (nextOrderIds: string[]) => void;
  children: React.ReactNode;
}

/**
 * Wraps a `<table>` (or fragment containing it). Place `<SortableContext>` inside `<tbody>`.
 */
export function SortableTableRoot({ itemIds, onReorderIds, children }: SortableTableRootProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      onReorderIds(arrayMove(itemIds, oldIndex, newIndex));
    },
    [itemIds, onReorderIds]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
