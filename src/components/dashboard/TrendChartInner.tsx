'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { MonthlyTrend } from '@/types';

interface TrendChartInnerProps {
  data: MonthlyTrend[];
}

function formatMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function formatYAxis(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
}

function formatTooltipValue(value: number): string {
  return `$${value.toFixed(2)}`;
}

const CHART_BLUE = '#3F83F8';
const CHART_SLATE = '#9CA3AF';
const CHART_GREEN = '#31C48D';

export function TrendChartInner({ data }: TrendChartInnerProps) {
  const chartData = data.map((d) => ({
    ...d,
    month: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        barGap={4}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatTooltipValue(value),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 13, color: '#6B7280' }}
          formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <Bar dataKey="gross" name="Gross Income" fill={CHART_BLUE} radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill={CHART_SLATE} radius={[3, 3, 0, 0]} />
        <Bar dataKey="net" name="Net Income" fill={CHART_GREEN} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
