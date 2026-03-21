'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientApiError, getJson } from '@/lib/api-client';
import { t } from '@/lib/translations';

type Report = {
  days: number;
  summary: {
    leads_total: number;
    leads_converted: number;
    conversion_rate_pct: number | null;
    avg_minutes_to_first_contact: number | null;
    avg_minutes_to_convert: number | null;
  };
  byStage: { stage: string; total: number }[];
  bySource: { source_channel: string; total: number; conversion_rate_pct: number | null }[];
  byCampaign: {
    campaign_id: number | null;
    campaign_name: string | null;
    total: number;
    conversion_rate_pct: number | null;
    revenue_ils: number | string | null;
  }[];
  perDay: { day: string; total: number }[];
};

function metric(value: number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value}${suffix}`;
}

function isAnalyticsReport(json: unknown): json is Report {
  return (
    !!json &&
    typeof json === 'object' &&
    'summary' in json &&
    !!(json as Report).summary &&
    typeof (json as Report).summary.leads_total === 'number'
  );
}

export default function MarketingLeadsAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getJson<unknown>(`/api/leads/report?days=${days}`)
      .then((json) => {
        if (!isAnalyticsReport(json)) throw new Error('Unexpected response');
        setReport(json);
      })
      .catch((e) => {
        setReport(null);
        if (e instanceof ClientApiError) {
          setLoadError(e.body.error || t.toast.couldNotLoad);
        } else {
          setLoadError(t.toast.couldNotLoad);
        }
      })
      .finally(() => setLoading(false));
  }, [days]);

  const perDayMax = useMemo(() => Math.max(...(report?.perDay ?? []).map((d) => d.total), 1), [report?.perDay]);

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t.leads.analytics} ({days} ימים)
        </h2>
        <div className="flex gap-2">
          <Button variant={days === 7 ? 'primary' : 'ghost'} onClick={() => setDays(7)}>
            7
          </Button>
          <Button variant={days === 30 ? 'primary' : 'ghost'} onClick={() => setDays(30)}>
            30
          </Button>
          <Button variant={days === 90 ? 'primary' : 'ghost'} onClick={() => setDays(90)}>
            90
          </Button>
          <Link href="/marketing/leads">
            <Button variant="ghost">↩️ {t.leads.title}</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      ) : !report ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted">
          {loadError ?? t.toast.couldNotLoad}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">Leads</div>
              <div className="text-2xl font-bold">{report.summary?.leads_total ?? '—'}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">Converted</div>
              <div className="text-2xl font-bold">{report.summary?.leads_converted ?? '—'}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">Conversion rate</div>
              <div className="text-2xl font-bold">{metric(report.summary?.conversion_rate_pct, '%')}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">Avg minutes to first contact</div>
              <div className="text-2xl font-bold">{metric(report.summary?.avg_minutes_to_first_contact)}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">Avg minutes to convert</div>
              <div className="text-2xl font-bold">{metric(report.summary?.avg_minutes_to_convert)}</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 mb-6">
            <div className="text-sm font-semibold text-text-primary mb-3">Leads per day</div>
            <div className="flex items-end gap-1 h-24">
              {report.perDay.map((d) => (
                <div key={d.day} className="flex-1 min-w-[6px]" title={`${d.day}: ${d.total}`}>
                  <div
                    className="w-full bg-primary/40 rounded-t"
                    style={{ height: `${Math.max(4, Math.round((d.total / perDayMax) * 96))}px` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold">By stage</div>
              <table className="w-full text-sm">
                <tbody>
                  {report.byStage.map((r) => (
                    <tr key={r.stage} className="border-b border-border">
                      <td className="py-2 px-4">{r.stage}</td>
                      <td className="py-2 px-4 text-end font-mono">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold">By source</div>
              <table className="w-full text-sm">
                <tbody>
                  {report.bySource.map((r) => (
                    <tr key={r.source_channel} className="border-b border-border">
                      <td className="py-2 px-4">{r.source_channel}</td>
                      <td className="py-2 px-4 text-end font-mono">{r.total}</td>
                      <td className="py-2 px-4 text-end font-mono">{metric(r.conversion_rate_pct, '%')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold">Top campaigns</div>
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="py-2 px-4 text-start font-medium text-text-muted">Campaign</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">Leads</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">CR</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byCampaign.map((r, idx) => (
                    <tr key={`${r.campaign_id ?? 'none'}-${idx}`} className="border-b border-border">
                      <td className="py-2 px-4">{r.campaign_name || '—'}</td>
                      <td className="py-2 px-4 text-end font-mono">{r.total}</td>
                      <td className="py-2 px-4 text-end font-mono">{metric(r.conversion_rate_pct, '%')}</td>
                      <td className="py-2 px-4 text-end font-mono">
                        {r.revenue_ils !== null && r.revenue_ils !== undefined ? String(r.revenue_ils) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

