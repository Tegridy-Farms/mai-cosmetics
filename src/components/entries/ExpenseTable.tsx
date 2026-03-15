'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import type { ExpenseEntry } from '@/types';

interface ExpenseTableProps {
  entries: ExpenseEntry[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

const SKELETON_ROWS = 5;

export function ExpenseTable({ entries, isLoading, onDelete }: ExpenseTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-[#E5E7EB]">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">Date</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">Description</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">Category</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280] text-right">Amount</th>
            <th scope="col" className="py-3 px-4 font-medium text-[#6B7280]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-[#E5E7EB]">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-[#E5E7EB] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState
                  title="No entries match your filters."
                  description="Try adjusting your filters or add a new entry."
                  ctaLabel="Add Expense"
                  ctaHref="/expenses/new"
                />
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                <td className="py-3 px-4 text-[#111827]">{formatDate(entry.date)}</td>
                <td className="py-3 px-4 text-[#111827]">{entry.description}</td>
                <td className="py-3 px-4 text-[#111827]">{entry.category}</td>
                <td className="py-3 px-4 text-[#111827] text-right font-mono">
                  {formatAmount(entry.amount)}
                </td>
                <td className="py-3 px-4">
                  <button
                    aria-label={`Delete expense entry: ${entry.description}, ${formatDate(entry.date)}`}
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
