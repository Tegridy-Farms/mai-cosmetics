'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import {
  reorderItemsBySortableIds,
  SortableTableBody,
  SortableTableRoot,
  SortableTableRow,
  toSortableId,
} from '@/components/sortable';
import { showToastForClientApiError, type ShowToastFn } from '@/lib/api-error-toast';
import { ClientApiError, putJson } from '@/lib/api-client';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

interface LeadSourcesTableProps {
  leadSources: LeadSource[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  showToast: ShowToastFn;
  onReorderComplete?: () => void | Promise<void>;
}

const SKELETON_ROWS = 5;

export function LeadSourcesTable({
  leadSources,
  isLoading,
  onDelete,
  showToast,
  onReorderComplete,
}: LeadSourcesTableProps) {
  const [ordered, setOrdered] = useState<LeadSource[]>(leadSources);

  useEffect(() => {
    setOrdered(leadSources);
  }, [leadSources]);

  const itemIds = useMemo(() => ordered.map((ls) => toSortableId(ls.id)), [ordered]);

  const handleReorderIds = useCallback(
    (nextOrderIds: string[]) => {
      setOrdered((current) => {
        const reordered = reorderItemsBySortableIds(current, nextOrderIds);
        if (reordered.length !== current.length) return current;
        const snapshotPrev = current;
        queueMicrotask(() => {
          void (async () => {
            try {
              await putJson('/api/lead-sources/reorder', {
                ordered_ids: reordered.map((r) => r.id),
              });
              await onReorderComplete?.();
            } catch (e) {
              setOrdered(snapshotPrev);
              if (e instanceof ClientApiError) {
                showToastForClientApiError(e, showToast);
              } else {
                showToast(t.sortable.orderSaveError, 'error');
              }
            }
          })();
        });
        return reordered;
      });
    },
    [onReorderComplete, showToast]
  );

  const tableContent = (
    <table className="w-full text-sm text-start">
      <thead className="border-b border-border">
        <tr>
          <th scope="col" className="py-3 px-2 w-12 font-medium text-text-muted" aria-hidden />
          <th scope="col" className="py-3 px-4 font-medium text-text-muted">
            {t.leadSources.name}
          </th>
          <th scope="col" className="py-3 px-4 font-medium text-text-muted">
            {t.entries.actions}
          </th>
        </tr>
      </thead>
      {isLoading ? (
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} data-testid="skeleton-row" className="border-b border-border">
              {Array.from({ length: 3 }).map((_, j) => (
                <td key={j} className="py-3 px-4">
                  <div className="h-4 bg-skeleton rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ) : ordered.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan={3}>
              <EmptyState
                title={t.leadSources.noLeadSources}
                description={t.leadSources.tryAdding}
                ctaLabel={t.leadSources.addLeadSource}
                ctaHref="/customers/lead-sources/new"
              />
            </td>
          </tr>
        </tbody>
      ) : (
        <SortableTableBody itemIds={itemIds}>
          {ordered.map((ls) => (
            <SortableTableRow key={ls.id} id={toSortableId(ls.id)}>
              {({ dragHandle }) => (
                <>
                  <td className="py-3 px-2 w-12 align-middle text-center">{dragHandle}</td>
                  <td className="py-3 px-4 text-text-primary align-middle">{ls.name}</td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/customers/lead-sources/${ls.id}/edit`}
                        className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors touch-manipulation"
                        aria-label={`ערוך ${ls.name}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button
                        aria-label={`מחקי ${ls.name}`}
                        onClick={() => onDelete(ls.id)}
                        className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-error transition-colors touch-manipulation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </>
              )}
            </SortableTableRow>
          ))}
        </SortableTableBody>
      )}
    </table>
  );

  if (isLoading || ordered.length === 0) {
    return (
      <div className="overflow-x-auto overscroll-x-contain">{tableContent}</div>
    );
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <SortableTableRoot itemIds={itemIds} onReorderIds={handleReorderIds}>
        {tableContent}
      </SortableTableRoot>
    </div>
  );
}
