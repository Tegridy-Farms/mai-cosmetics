import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatAmount, formatDate } from '@/lib/format';
import type { IncomeEntry } from '@/types';

export interface TreatmentFieldLabels {
  date: string;
  serviceName: string;
  serviceType: string;
  durationMin: string;
  amount: string;
  comment: string;
}

export interface TreatmentTimelineCopy {
  noComment: string;
  expandDetails: string;
  editTreatment: string;
  durationUnit: string;
}

interface CustomerTreatmentTimelineItemProps {
  entry: IncomeEntry;
  serviceTypeName: string;
  fieldLabels: TreatmentFieldLabels;
  copy: TreatmentTimelineCopy;
  isLast: boolean;
}

export function CustomerTreatmentTimelineItem({
  entry,
  serviceTypeName,
  fieldLabels,
  copy,
  isLast,
}: CustomerTreatmentTimelineItemProps) {
  const commentText = entry.comment?.trim() ?? '';

  return (
    <div className="flex gap-3 flex-row">
      <div className="flex flex-col items-center w-4 shrink-0 pt-1.5" aria-hidden>
        <span className="h-3.5 w-3.5 rounded-full ring-4 ring-background shrink-0 bg-rose-500" />
        {!isLast ? (
          <span className="w-0.5 flex-1 min-h-[1.25rem] bg-rose-200" />
        ) : null}
      </div>
      <article className="flex-1 rounded-xl border border-rose-200/70 bg-gradient-to-br from-primary-tint/50 to-surface px-4 py-3 mb-1 shadow-sm">
        <header className="flex flex-col-reverse sm:flex-row sm:items-baseline sm:justify-between gap-1 gap-x-3 mb-2">
          <h3 className="text-lg font-bold text-text-primary leading-tight">{entry.service_name}</h3>
          <time
            className="text-sm text-text-muted tabular-nums shrink-0 font-medium"
            dateTime={entry.date}
          >
            {formatDate(entry.date)}
          </time>
        </header>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary mb-3">
          <span className="font-medium text-text-primary">{serviceTypeName}</span>
          <span className="text-border-muted" aria-hidden>
            ·
          </span>
          <span>
            {entry.duration_minutes} {copy.durationUnit}
          </span>
          <span className="text-border-muted" aria-hidden>
            ·
          </span>
          <span className="font-mono text-primary font-semibold">{formatAmount(entry.amount)}</span>
        </div>

        {commentText ? (
          <blockquote className="border-s-4 border-amber-400/90 ps-3 py-1 mb-3 text-base text-text-primary leading-relaxed whitespace-pre-wrap break-words bg-amber-50/50 rounded-e-lg">
            {commentText}
          </blockquote>
        ) : (
          <p className="text-sm text-text-muted italic mb-3">{copy.noComment}</p>
        )}

        <details className="group rounded-lg border border-border-muted bg-white/40">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-primary hover:text-primary-dark underline-offset-2 marker:text-text-muted">
            <span className="group-open:underline">{copy.expandDetails}</span>
          </summary>
          <div className="px-3 pb-3 pt-1 border-t border-border-muted/80 space-y-3">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.date}</dt>
                <dd className="text-text-primary">{formatDate(entry.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.amount}</dt>
                <dd className="font-mono text-text-primary">{formatAmount(entry.amount)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.serviceName}</dt>
                <dd className="text-text-primary">{entry.service_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.serviceType}</dt>
                <dd className="text-text-primary">{serviceTypeName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.durationMin}</dt>
                <dd className="text-text-primary">
                  {entry.duration_minutes} {copy.durationUnit}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-text-muted mb-0.5">{fieldLabels.comment}</dt>
                <dd className="text-text-primary whitespace-pre-wrap break-words">
                  {commentText || '—'}
                </dd>
              </div>
            </dl>
            <Link href={`/income/${entry.id}/edit`} className="inline-block">
              <Button variant="primary" type="button">
                {copy.editTreatment}
              </Button>
            </Link>
          </div>
        </details>
      </article>
    </div>
  );
}
