'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';
import Link from 'next/link';
import type { IncomeEntry, ServiceType } from '@/types';

interface IncomeTableProps {
  entries: IncomeEntry[];
  serviceTypes: ServiceType[];
  addonNameById: Map<number, string>;
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const SKELETON_ROWS = 5;
const COL_COUNT = 8;

function formatAppliedAddons(
  ids: number[] | undefined,
  nameById: Map<number, string>
): string {
  if (!ids || ids.length === 0) return '—';
  const counts = new Map<number, number>();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const parts: string[] = [];
  for (const [id, n] of counts) {
    const label = nameById.get(id) ?? `#${id}`;
    parts.push(n > 1 ? `${label}×${n}` : label);
  }
  return parts.join('، ');
}

export function IncomeTable({ entries, serviceTypes, addonNameById, isLoading, onDelete }: IncomeTableProps) {
  const getServiceTypeName = (id: number) =>
    serviceTypes.find((st) => st.id === id)?.name ?? String(id);
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.date}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.serviceName}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.serviceType}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.durationMin}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted text-end">{t.entries.amount}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted max-w-[160px]">{t.entries.addons}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted max-w-[200px]">{t.entries.comment}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.actions}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-border">
                {Array.from({ length: COL_COUNT }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-skeleton rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={COL_COUNT}>
                <EmptyState
                  title={t.entries.noEntriesMatch}
                  description={t.entries.tryAdjusting}
                  ctaLabel={t.entries.addIncome}
                  ctaHref="/income/new"
                />
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border hover:bg-background">
                <td className="py-3 px-4 text-text-primary">{formatDate(entry.date)}</td>
                <td className="py-3 px-4 text-text-primary">{entry.service_name}</td>
                <td className="py-3 px-4 text-text-primary">{getServiceTypeName(entry.service_type_id)}</td>
                <td className="py-3 px-4 text-text-primary">{entry.duration_minutes}</td>
                <td className="py-3 px-4 text-text-primary text-end font-mono">
                  {formatAmount(entry.amount)}
                </td>
                <td className="py-3 px-4 text-text-secondary text-[13px] max-w-[160px] leading-snug">
                  <span className="line-clamp-2" title={formatAppliedAddons(entry.applied_addon_ids, addonNameById)}>
                    {formatAppliedAddons(entry.applied_addon_ids, addonNameById)}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-secondary max-w-[200px]">
                  {entry.comment ? (
                    <span className="line-clamp-2" title={entry.comment}>
                      {entry.comment}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/income/${entry.id}/edit`}
                      aria-label={`עריכת הכנסה: ${entry.service_name}, ${formatDate(entry.date)}`}
                      className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors touch-manipulation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      aria-label={`מחקי הכנסה: ${entry.service_name}, ${formatDate(entry.date)}`}
                      onClick={() => onDelete(entry.id)}
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
