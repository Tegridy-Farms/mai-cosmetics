'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { MonthlyTrend } from '@/types';
import { formatMonthLabel } from '@/lib/format';
import { t } from '@/lib/translations';

interface TrendChartProps {
  data: MonthlyTrend[];
  isLoading?: boolean;
}

// Recharts internals loaded only on the client
const RechartsChart = dynamic(
  () => import('./TrendChartInner').then((mod) => mod.TrendChartInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-[280px] bg-skeleton rounded-xl animate-pulse"
        aria-label="Loading trend chart"
        data-testid="trend-chart-skeleton"
      />
    ),
  }
);

export function TrendChart({ data, isLoading = false }: TrendChartProps) {
  // Compute date range for figcaption
  const rangeLabel =
    data.length > 0
      ? `${formatMonthLabel(data[0].month)} – ${formatMonthLabel(data[data.length - 1].month)}`
      : 'no data';

  return (
    <figure className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
      <figcaption className="sr-only">
        {`Monthly gross income, expenses, and net income for ${rangeLabel}`}
      </figcaption>
      {isLoading ? (
        <div
          className="w-full h-[280px] bg-skeleton rounded-xl animate-pulse"
          aria-label="Loading trend chart"
          data-testid="trend-chart-skeleton"
        />
      ) : data.length === 0 ? (
        <div
          className="w-full h-[280px] flex items-center justify-center text-[14px] text-text-muted"
          data-testid="trend-chart-empty"
        >
          {t.dashboard.noMonthlyData}
        </div>
      ) : (
        <RechartsChart data={data} />
      )}
    </figure>
  );
}
