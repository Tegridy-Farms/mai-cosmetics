'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import { t } from '@/lib/translations';
import type { LeadStage } from '@/types';

export interface LeadListRow {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  stage: LeadStage;
  source_channel: string;
  campaign_name?: string | null;
  form_name?: string | null;
  submitted_at?: string | null;
}

interface LeadsTableProps {
  leads: LeadListRow[];
  isLoading: boolean;
}

const SKELETON_ROWS = 6;

function stageLabel(stage: LeadStage): string {
  return (t.leads as any)[stage] ?? stage;
}

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.name}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.phone}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.stage}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.source}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.campaign}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.form}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.leads.submittedAt}
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
          ) : leads.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  title={t.leads.noLeads}
                  description={t.leads.tryAdding}
                  ctaLabel={t.leads.addLead}
                  ctaHref="/marketing/leads/new"
                />
              </td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id} className="border-b border-border hover:bg-background">
                <td className="py-3 px-4 text-text-primary">
                  <Link href={`/marketing/leads/${l.id}`} className="text-primary underline hover:text-primary-dark">
                    {l.full_name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-text-primary">{l.phone || '—'}</td>
                <td className="py-3 px-4 text-text-primary">{stageLabel(l.stage)}</td>
                <td className="py-3 px-4 text-text-primary">{l.source_channel}</td>
                <td className="py-3 px-4 text-text-primary">{l.campaign_name || '—'}</td>
                <td className="py-3 px-4 text-text-primary">{l.form_name || '—'}</td>
                <td className="py-3 px-4 text-text-primary">{l.submitted_at ? formatDate(String(l.submitted_at).slice(0, 10)) : '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

