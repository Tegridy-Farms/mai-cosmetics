'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';
import type { ExpenseEntry } from '@/types';

interface ExpenseTableProps {
  entries: ExpenseEntry[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  equipment: t.categories.equipment,
  materials: t.categories.materials,
  consumables: t.categories.consumables,
  other: t.categories.other,
};

const SKELETON_ROWS = 5;

export function ExpenseTable({ entries, isLoading, onDelete }: ExpenseTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.date}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.description}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.category}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted text-end">{t.entries.amount}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.actions}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-border">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-skeleton rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState
                  title={t.entries.noEntriesMatch}
                  description={t.entries.tryAdjusting}
                  ctaLabel={t.entries.addExpense}
                  ctaHref="/expenses/new"
                />
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border hover:bg-background">
                <td className="py-3 px-4 text-text-primary">{formatDate(entry.date)}</td>
                <td className="py-3 px-4 text-text-primary">{entry.description}</td>
                <td className="py-3 px-4 text-text-primary">{CATEGORY_LABELS[entry.category] ?? entry.category}</td>
                <td className="py-3 px-4 text-text-primary text-end font-mono">
                  {formatAmount(entry.amount)}
                </td>
                <td className="py-3 px-4">
                  <button
                    aria-label={`מחקי הוצאה: ${entry.description}, ${formatDate(entry.date)}`}
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
