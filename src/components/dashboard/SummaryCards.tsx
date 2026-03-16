"use client";

import React, { useState } from "react";
import type { DashboardMetrics } from "@/types";
import { formatAmount } from "@/lib/format";
import { t } from "@/lib/translations";

interface SummaryCardsProps {
  initialMonthData: DashboardMetrics;
  initialAllData: DashboardMetrics;
}

interface CardProps {
  label: string;
  value: number;
  colorClass: string;
  suffix?: string;
  ariaLabel?: string;
  testId?: string;
}

function SummaryCard({ label, value, colorClass, suffix, ariaLabel, testId }: CardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 min-w-[180px] shadow-sm">
      <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`text-[32px] font-bold ${colorClass}`}
        data-testid={testId}
        aria-label={ariaLabel}
      >
        {formatAmount(value)}
        {suffix && <span className="text-[20px] font-normal ms-1">{suffix}</span>}
      </p>
    </div>
  );
}

export function SummaryCards({ initialMonthData, initialAllData }: SummaryCardsProps) {
  const [period, setPeriod] = useState<"month" | "all">("month");
  const data = period === "month" ? initialMonthData : initialAllData;

  const netIncomeColor =
    data.net_income > 0
      ? "text-success"
      : data.net_income < 0
      ? "text-error"
      : "text-text-primary";

  return (
    <div>
      {/* Period toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPeriod("month")}
          className={`px-3 py-1 rounded-full text-[14px] font-medium transition-colors ${
            period === "month"
              ? "bg-primary-tint text-primary"
              : "text-text-muted hover:bg-background"
          }`}
        >
          {t.dashboard.thisMonth}
        </button>
        <button
          onClick={() => setPeriod("all")}
          className={`px-3 py-1 rounded-full text-[14px] font-medium transition-colors ${
            period === "all"
              ? "bg-primary-tint text-primary"
              : "text-text-muted hover:bg-background"
          }`}
        >
          {t.dashboard.allTime}
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label={t.dashboard.grossIncome}
          value={data.gross_income}
          colorClass="text-text-primary"
        />
        <SummaryCard
          label={t.dashboard.totalExpenses}
          value={data.total_expenses}
          colorClass="text-text-primary"
        />
        <SummaryCard
          label={t.dashboard.netIncome}
          value={data.net_income}
          colorClass={netIncomeColor}
          testId="net-income-value"
        />
        <SummaryCard
          label={t.dashboard.netIncomePerHour}
          value={data.net_per_hour}
          colorClass="text-text-primary"
          suffix={t.dashboard.perHour}
          ariaLabel={`${t.dashboard.netIncomePerHour}: ${formatAmount(data.net_per_hour)}`}
          testId="net-per-hour-value"
        />
      </div>
    </div>
  );
}
