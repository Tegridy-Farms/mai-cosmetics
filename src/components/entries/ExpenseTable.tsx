'use client';

import React from 'react';
import Link from 'next/link';
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
            <th scope="col" className="py-3 px-4 font-medium text-text-muted text-center">{t.entries.invoice}</th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">{t.entries.actions}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-border">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-skeleton rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={6}>
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
                <td className="py-3 px-4 text-center">
                  {entry.invoice_url ? (
                    <a
                      href={entry.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.entries.openInvoiceAria}
                      className="inline-flex items-center justify-center p-2 -m-2 min-w-[44px] min-h-[44px] text-primary hover:text-primary-dark transition-colors touch-manipulation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/expenses/${entry.id}/edit`}
                      aria-label={`עריכת הוצאה: ${entry.description}, ${formatDate(entry.date)}`}
                      className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors touch-manipulation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
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
