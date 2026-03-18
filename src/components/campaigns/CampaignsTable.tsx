'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const SKELETON_ROWS = 5;

export function CampaignsTable({ campaigns, isLoading, onDelete }: CampaignsTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.campaigns.name}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.campaigns.slug}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.campaigns.channelFocus}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.campaigns.startDate}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.campaigns.endDate}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted text-end">
              {t.campaigns.budget}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.entries.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} data-testid="skeleton-row" className="border-b border-border">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-skeleton rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : campaigns.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  title={t.campaigns.noCampaigns}
                  description={t.campaigns.tryAdding}
                  ctaLabel={t.campaigns.addCampaign}
                  ctaHref="/campaigns/new"
                />
              </td>
            </tr>
          ) : (
            campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-background">
                <td className="py-3 px-4 text-text-primary">{c.name}</td>
                <td className="py-3 px-4 text-text-primary font-mono">{c.slug}</td>
                <td className="py-3 px-4 text-text-primary">{c.channel_focus}</td>
                <td className="py-3 px-4 text-text-primary">{c.start_date ? formatDate(c.start_date) : '—'}</td>
                <td className="py-3 px-4 text-text-primary">{c.end_date ? formatDate(c.end_date) : '—'}</td>
                <td className="py-3 px-4 text-text-primary text-end font-mono">
                  {c.budget !== null && c.budget !== undefined ? formatAmount(Number(c.budget)) : '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/campaigns/${c.id}/edit`}
                      className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors touch-manipulation"
                      aria-label={`ערוך ${c.name}`}
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
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      aria-label={`מחקי ${c.name}`}
                      onClick={() => onDelete(c.id)}
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

