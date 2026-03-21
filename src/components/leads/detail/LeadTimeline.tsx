import React from 'react';
import type { LeadEvent } from '@/types';
import { LeadTimelineItem, type LeadTimelineLabels } from './LeadTimelineItem';

interface LeadTimelineProps {
  events: LeadEvent[];
  sectionTitle: string;
  emptyMessage: string;
  labels: LeadTimelineLabels;
}

export function LeadTimeline({ events, sectionTitle, emptyMessage, labels }: LeadTimelineProps) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-l from-primary-tint/40 to-transparent">
        <h2 className="text-lg font-semibold text-text-primary">{sectionTitle}</h2>
      </div>
      <div className="p-4">
        {events.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-0">
            {events.map((ev, index) => (
              <LeadTimelineItem
                key={ev.id}
                event={ev}
                labels={labels}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
