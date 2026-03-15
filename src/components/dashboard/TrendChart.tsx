'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { MonthlyTrend } from '@/types';

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
        className="w-full h-[280px] bg-[#E5E7EB] rounded-[8px] animate-pulse"
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
    <figure className="bg-white border border-[#E5E7EB] rounded-[8px] p-6">
      <figcaption className="sr-only">
        {`Monthly gross income, expenses, and net income for ${rangeLabel}`}
      </figcaption>
      {isLoading ? (
        <div
          className="w-full h-[280px] bg-[#E5E7EB] rounded-[8px] animate-pulse"
          aria-label="Loading trend chart"
          data-testid="trend-chart-skeleton"
        />
      ) : data.length === 0 ? (
        <div
          className="w-full h-[280px] flex items-center justify-center text-[14px] text-[#6B7280]"
          data-testid="trend-chart-empty"
        >
          No monthly data available yet.
        </div>
      ) : (
        <RechartsChart data={data} />
      )}
    </figure>
  );
}

function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
