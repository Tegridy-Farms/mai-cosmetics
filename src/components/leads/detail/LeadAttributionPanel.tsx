import React from 'react';
import {
  buildAttributionRows,
  type AttributionLabelsMap,
} from '@/lib/leads/event-presentation';

interface LeadAttributionPanelProps {
  attribution: Record<string, unknown> | null | undefined;
  sectionTitle: string;
  labels: AttributionLabelsMap;
  rawExtraTitle: string;
  expandValueLabel: string;
}

export function LeadAttributionPanel({
  attribution,
  sectionTitle,
  labels,
  rawExtraTitle,
  expandValueLabel,
}: LeadAttributionPanelProps) {
  const { rows, unknownJson } = buildAttributionRows(attribution, labels);

  const hasMain = rows.length > 0;
  const hasUnknown = Boolean(unknownJson);

  if (!hasMain && !hasUnknown) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary mb-2">{sectionTitle}</h3>
        <p className="text-sm text-text-muted">—</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">{sectionTitle}</h3>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium text-text-muted mb-0.5">{row.label}</dt>
            <dd className="text-sm text-text-primary break-words">
              {row.full ? (
                <details className="group">
                  <summary className="cursor-pointer text-primary hover:text-primary-dark list-none flex flex-wrap items-center gap-x-1">
                    <span className="underline-offset-2 group-open:underline">{row.display}</span>
                    <span className="text-xs text-text-muted no-underline">({expandValueLabel})</span>
                  </summary>
                  <p className="mt-2 text-sm whitespace-pre-wrap break-all rounded-lg bg-background/80 p-2 border border-border-muted">
                    {row.full}
                  </p>
                </details>
              ) : (
                row.display
              )}
            </dd>
          </div>
        ))}
      </dl>
      {hasUnknown && unknownJson ? (
        <details className="rounded-lg border border-border-muted bg-background/50">
          <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-text-secondary">
            {rawExtraTitle}
          </summary>
          <pre className="px-3 pb-3 text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
            {unknownJson}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
