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
import { formatMonth, formatAmountShort, formatAmountTooltip } from '@/lib/format';
import { t } from '@/lib/translations';

interface TrendChartInnerProps {
  data: MonthlyTrend[];
}

const CHART_GROSS = '#C74B7C';
const CHART_EXPENSES = '#9D8B9E';
const CHART_NET = '#10B981';

export function TrendChartInner({ data }: TrendChartInnerProps) {
  const chartData = data.map((d) => ({
    ...d,
    month: formatMonth(d.month),
  }));

  const nameMap: Record<string, string> = {
    gross: t.chart.grossIncome,
    expenses: t.chart.expenses,
    net: t.chart.netIncome,
  };

  return (
    <div dir="ltr">
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        barGap={4}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F5E6EC" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatAmountShort}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatAmountTooltip(value),
            nameMap[name] ?? name,
          ]}
          contentStyle={{
            background: '#fff',
            border: '1px solid #F5E6EC',
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 13, color: '#6B7280' }}
          formatter={(value: string) => nameMap[value] ?? value}
        />
        <Bar dataKey="gross" name={t.chart.grossIncome} fill={CHART_GROSS} radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" name={t.chart.expenses} fill={CHART_EXPENSES} radius={[6, 6, 0, 0]} />
        <Bar dataKey="net" name={t.chart.netIncome} fill={CHART_NET} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
