'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export interface SortableTableBodyProps {
  itemIds: string[];
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders `<tbody>` with a `SortableContext`. Children must be `<SortableTableRow>` components only.
 */
export function SortableTableBody({ itemIds, children, className }: SortableTableBodyProps) {
  return (
    <tbody className={className}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </tbody>
  );
}
