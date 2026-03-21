import React from 'react';
import { Button } from '@/components/ui/button';
import type { IncomeEntry } from '@/types';
import {
  CustomerTreatmentTimelineItem,
  type TreatmentFieldLabels,
  type TreatmentTimelineCopy,
} from './CustomerTreatmentTimelineItem';

interface CustomerTreatmentTimelineProps {
  entries: IncomeEntry[];
  total: number;
  serviceTypeName: (serviceTypeId: number) => string;
  fieldLabels: TreatmentFieldLabels;
  copy: TreatmentTimelineCopy & {
    timelineTitle: string;
    noSessions: string;
    loadMore: string;
    loadingMore: string;
    showingCount: (loaded: number, total: number) => string;
  };
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export function CustomerTreatmentTimeline({
  entries,
  total,
  serviceTypeName,
  fieldLabels,
  copy,
  onLoadMore,
  loadingMore = false,
}: CustomerTreatmentTimelineProps) {
  const hasMore = entries.length < total;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-l from-primary-tint/50 to-transparent">
        <h2 className="text-lg font-semibold text-text-primary">{copy.timelineTitle}</h2>
      </div>
      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">{copy.noSessions}</p>
        ) : (
          <>
            <div className="space-y-0">
              {entries.map((entry, index) => (
                <CustomerTreatmentTimelineItem
                  key={entry.id}
                  entry={entry}
                  serviceTypeName={serviceTypeName(entry.service_type_id)}
                  fieldLabels={fieldLabels}
                  copy={copy}
                  isLast={index === entries.length - 1}
                />
              ))}
            </div>
            {total > 0 ? (
              <p className="text-center text-xs text-text-muted mt-4">
                {copy.showingCount(entries.length, total)}
              </p>
            ) : null}
            {hasMore && onLoadMore ? (
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="ghost" onClick={onLoadMore} loading={loadingMore}>
                  {loadingMore ? copy.loadingMore : copy.loadMore}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
