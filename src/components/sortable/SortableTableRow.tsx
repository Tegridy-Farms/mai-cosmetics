'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { t } from '@/lib/translations';

export interface SortableTableRowProps {
  id: string;
  children: (ctx: {
    dragHandle: React.ReactNode;
    isDragging: boolean;
  }) => React.ReactNode;
}

/**
 * Renders a `<tr>`. Use the `dragHandle` node in the first cell (or any cell) as the drag activator.
 */
export function SortableTableRow({ id, children }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-background touch-manipulation cursor-grab active:cursor-grabbing"
      aria-label={t.sortable.dragToReorder}
      {...attributes}
      {...listeners}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </button>
  );

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border hover:bg-background">
      {children({ dragHandle, isDragging })}
    </tr>
  );
}
