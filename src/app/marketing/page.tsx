"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/translations";

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
  byCampaign: {
    campaign_id: number | null;
    campaign_name: string | null;
    total: number;
    conversion_rate_pct: number | null;
    revenue_ils: number | string | null;
  }[];
};

function metric(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

export default function MarketingDashboardPage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads/report?days=${days}`)
      .then((res) => res.json())
      .then((json) => setReport(json))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [days]);

  const topCampaigns = useMemo(() => (report?.byCampaign ?? []).slice(0, 5), [report?.byCampaign]);

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t.marketing.dashboard}</h2>
        <div className="flex gap-2">
          <Button variant={days === 7 ? "primary" : "ghost"} onClick={() => setDays(7)}>
            7
          </Button>
          <Button variant={days === 30 ? "primary" : "ghost"} onClick={() => setDays(30)}>
            30
          </Button>
          <Button variant={days === 90 ? "primary" : "ghost"} onClick={() => setDays(90)}>
            90
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">{t.marketing.kpi.leads}</div>
              <div className="text-2xl font-bold">{report?.summary?.leads_total ?? "—"}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">{t.marketing.kpi.converted}</div>
              <div className="text-2xl font-bold">{report?.summary?.leads_converted ?? "—"}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">{t.marketing.kpi.conversionRate}</div>
              <div className="text-2xl font-bold">{metric(report?.summary?.conversion_rate_pct, "%")}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">{t.marketing.kpi.avgMinutesToFirstContact}</div>
              <div className="text-2xl font-bold">{metric(report?.summary?.avg_minutes_to_first_contact)}</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-text-secondary">{t.marketing.kpi.avgMinutesToConvert}</div>
              <div className="text-2xl font-bold">{metric(report?.summary?.avg_minutes_to_convert)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-sm font-semibold text-text-primary">{t.marketing.quickActions}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                <Link href="/marketing/leads/new">
                  <Button className="w-full" variant="primary">
                    + {t.leads.addLead}
                  </Button>
                </Link>
                <Link href="/marketing/campaigns/new">
                  <Button className="w-full" variant="ghost">
                    + {t.campaigns.addCampaign}
                  </Button>
                </Link>
                <Link href="/marketing/forms/new">
                  <Button className="w-full" variant="ghost">
                    + {t.adminForms.addForm}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold flex items-center justify-between gap-3">
                <div className="text-text-primary">{t.marketing.topCampaigns}</div>
                <Link href="/marketing/leads/analytics">
                  <Button variant="ghost">{t.marketing.viewAnalytics}</Button>
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="py-2 px-4 text-start font-medium text-text-muted">{t.marketing.table.campaign}</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">{t.marketing.table.leads}</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">{t.marketing.table.cr}</th>
                    <th className="py-2 px-4 text-end font-medium text-text-muted">{t.marketing.table.revenue}</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.length === 0 ? (
                    <tr>
                      <td className="py-6 px-4 text-center text-text-muted" colSpan={4}>
                        {t.marketing.noCampaignData}
                      </td>
                    </tr>
                  ) : (
                    topCampaigns.map((r, idx) => (
                      <tr key={`${r.campaign_id ?? "none"}-${idx}`} className="border-b border-border">
                        <td className="py-2 px-4">{r.campaign_name || "—"}</td>
                        <td className="py-2 px-4 text-end font-mono">{r.total}</td>
                        <td className="py-2 px-4 text-end font-mono">{metric(r.conversion_rate_pct, "%")}</td>
                        <td className="py-2 px-4 text-end font-mono">
                          {r.revenue_ils !== null && r.revenue_ils !== undefined ? String(r.revenue_ils) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

