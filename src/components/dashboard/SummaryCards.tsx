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
    <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6 min-w-[180px]">
      <p className="text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
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
      ? "text-[#057A55]"
      : data.net_income < 0
      ? "text-[#C81E1E]"
      : "text-[#111827]";

  return (
    <div>
      {/* Period toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPeriod("month")}
          className={`px-3 py-1 rounded-full text-[14px] font-medium transition-colors ${
            period === "month"
              ? "bg-[#EBF5FB] text-[#1A56DB]"
              : "text-[#6B7280] hover:bg-[#F9FAFB]"
          }`}
        >
          {t.dashboard.thisMonth}
        </button>
        <button
          onClick={() => setPeriod("all")}
          className={`px-3 py-1 rounded-full text-[14px] font-medium transition-colors ${
            period === "all"
              ? "bg-[#EBF5FB] text-[#1A56DB]"
              : "text-[#6B7280] hover:bg-[#F9FAFB]"
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
          colorClass="text-[#111827]"
        />
        <SummaryCard
          label={t.dashboard.totalExpenses}
          value={data.total_expenses}
          colorClass="text-[#111827]"
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
          colorClass="text-[#111827]"
          suffix={t.dashboard.perHour}
          ariaLabel={`${t.dashboard.netIncomePerHour}: ${formatAmount(data.net_per_hour)}`}
          testId="net-per-hour-value"
        />
      </div>
    </div>
  );
}
