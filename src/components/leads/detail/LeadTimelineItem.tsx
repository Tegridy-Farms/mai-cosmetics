import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { LeadEvent, LeadEventType } from '@/types';
import {
  conversionCustomerId,
  conversionIsDeduped,
  isConversionPayload,
  isNotePayload,
  isStageChangePayload,
  leadEventVisual,
  safeStringifyPayload,
  stageDisplayName,
  type LeadStageLabels,
} from '@/lib/leads/event-presentation';

export interface LeadTimelineLabels {
  stageFlowArrow: string;
  stageLabels: LeadStageLabels;
  unknownStage: string;
  technicalDetails: string;
  eventTypeTitle: Record<LeadEventType, string>;
  conversionMilestone: string;
  conversionDeduped: string;
  viewCustomerCard: string;
  contactAttemptBody: string;
}

interface LeadTimelineItemProps {
  event: LeadEvent;
  labels: LeadTimelineLabels;
  isLast: boolean;
}

function formatEventTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('he-IL', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function LeadTimelineItem({ event, labels, isLast }: LeadTimelineItemProps) {
  const visual = leadEventVisual(event.type);
  const payload = event.payload ?? {};
  const title = labels.eventTypeTitle[event.type];
  const time = formatEventTime(event.created_at);

  let body: React.ReactNode = null;
  let showTechnical = false;

  switch (event.type) {
    case 'stage_change': {
      if (isStageChangePayload(payload)) {
        const fromLabel = stageDisplayName(payload.from, labels.stageLabels);
        const toLabel = stageDisplayName(payload.to, labels.stageLabels);
        body = (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-text-primary">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 font-medium shadow-sm ring-1 ring-black/5">
              {fromLabel}
            </span>
            <span className="text-text-muted text-xs shrink-0" aria-hidden>
              {labels.stageFlowArrow}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 font-semibold text-primary-dark shadow-sm ring-1 ring-primary/15">
              {toLabel}
            </span>
          </div>
        );
      } else {
        showTechnical = true;
        body = <p className="text-sm text-text-muted">{labels.unknownStage}</p>;
      }
      break;
    }
    case 'note': {
      if (isNotePayload(payload)) {
        body = (
          <blockquote className="border-s-4 border-amber-400/80 ps-3 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {payload.text}
          </blockquote>
        );
      } else {
        showTechnical = true;
        body = null;
      }
      break;
    }
    case 'conversion': {
      if (isConversionPayload(payload)) {
        const customerId = conversionCustomerId(payload);
        const deduped = conversionIsDeduped(payload);
        body = (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-900/90">{labels.conversionMilestone}</p>
            {deduped ? (
              <p className="text-sm text-emerald-800/80">{labels.conversionDeduped}</p>
            ) : null}
            {customerId ? (
              <Link href={`/customers/${customerId}`}>
                <Button variant="ghost" className="!px-0 text-emerald-800 underline-offset-2 hover:underline">
                  {labels.viewCustomerCard}
                </Button>
              </Link>
            ) : null}
          </div>
        );
      } else {
        showTechnical = true;
        body = null;
      }
      break;
    }
    case 'contact_attempt': {
      body = <p className="text-sm text-text-primary">{labels.contactAttemptBody}</p>;
      showTechnical = Object.keys(payload).length > 0;
      break;
    }
  }

  return (
    <div className="flex gap-3 flex-row">
      <div className="flex flex-col items-center w-4 shrink-0 pt-1.5" aria-hidden>
        <span className={`h-3.5 w-3.5 rounded-full ring-4 ring-background shrink-0 ${visual.dot}`} />
        {!isLast ? <span className={`w-0.5 flex-1 min-h-[1.25rem] ${visual.rail}`} /> : null}
      </div>
      <article
        className={`flex-1 rounded-xl border px-4 py-3 mb-1 shadow-sm ${visual.card}`}
      >
        <header className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-2">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <time className="text-xs text-text-muted tabular-nums shrink-0" dateTime={event.created_at}>
            {time}
          </time>
        </header>
        {body}
        {showTechnical ? (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs font-medium text-text-secondary list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
              <span className="underline-offset-2 group-open:underline">{labels.technicalDetails}</span>
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-white/60 p-2 text-xs font-mono text-text-secondary border border-border-muted">
              {safeStringifyPayload(payload)}
            </pre>
          </details>
        ) : null}
      </article>
    </div>
  );
}
