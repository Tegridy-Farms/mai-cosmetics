'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';
import type { IncomeEntry } from '@/types';

interface IncomeTableProps {
  entries: IncomeEntry[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const SKELETON_ROWS = 5;

export function IncomeTable({ entries, isLoading, onDelete }: IncomeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-[#E5E7EB]">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">{t.entries.date}</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">{t.entries.serviceName}</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">{t.entries.serviceType}</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">{t.entries.durationMin}</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280] text-end">{t.entries.amount}</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">{t.entries.actions}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-[#E5E7EB]">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-[#E5E7EB] rounded animate-pulse" />
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
                  ctaLabel={t.entries.addIncome}
                  ctaHref="/income/new"
                />
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                <td className="py-3 px-4 text-[#111827]">{formatDate(entry.date)}</td>
                <td className="py-3 px-4 text-[#111827]">{entry.service_name}</td>
                <td className="py-3 px-4 text-[#111827]">{entry.service_type_id}</td>
                <td className="py-3 px-4 text-[#111827]">{entry.duration_minutes}</td>
                <td className="py-3 px-4 text-[#111827] text-end font-mono">
                  {formatAmount(entry.amount)}
                </td>
                <td className="py-3 px-4">
                  <button
                    aria-label={`מחק הכנסה: ${entry.service_name}, ${formatDate(entry.date)}`}
                    onClick={() => onDelete(entry.id)}
                    className="text-[#6B7280] hover:text-[#C81E1E] transition-colors"
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
