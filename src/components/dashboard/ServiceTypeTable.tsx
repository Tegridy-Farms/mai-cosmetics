"use client";

import React, { useState } from "react";
import type { ServiceTypeMetric } from "@/types";

interface ServiceTypeTableProps {
  data: ServiceTypeMetric[];
}

type SortKey = keyof ServiceTypeMetric;
type SortDir = "ascending" | "descending";

function formatAmount(value: number): string {
  return `$${value.toFixed(2)}`;
}

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Service Type" },
  { key: "total_sessions", label: "Total Sessions" },
  { key: "total_hours", label: "Total Hours" },
  { key: "gross_income", label: "Gross Income" },
  { key: "expense_share", label: "Expense Share" },
  { key: "net_income", label: "Net Income" },
];

export function ServiceTypeTable({ data }: ServiceTypeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("net_income");
  const [sortDir, setSortDir] = useState<SortDir>("descending");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "descending" ? "ascending" : "descending"));
    } else {
      setSortKey(key);
      setSortDir("descending");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "descending" ? bVal - aVal : aVal - bVal;
    }
    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDir === "descending"
      ? bStr.localeCompare(aStr)
      : aStr.localeCompare(bStr);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={sortKey === col.key ? sortDir : "none"}
                onClick={() => handleSort(col.key)}
                className="text-[12px] font-semibold uppercase text-[#6B7280] text-left px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              >
                {col.label}
                {sortKey === col.key ? (
                  <span className="ml-1">{sortDir === "descending" ? "↓" : "↑"}</span>
                ) : (
                  <span className="ml-1 opacity-40">↕</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const netColor =
              row.net_income > 0
                ? "text-[#057A55]"
                : row.net_income < 0
                ? "text-[#C81E1E]"
                : "text-[#111827]";
            const rowBg = idx % 2 === 1 ? "bg-[#F9FAFB]" : "";
            return (
              <tr key={row.name} className={`${rowBg} min-h-[44px]`}>
                <td className="px-4 py-3 text-[14px] text-[#111827]">{row.name}</td>
                <td className="px-4 py-3 text-[14px] text-[#111827]">
                  {row.total_sessions}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#111827]">
                  {row.total_hours.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#111827]">
                  {formatAmount(row.gross_income)}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#111827]">
                  {formatAmount(row.expense_share)}
                </td>
                <td
                  className={`px-4 py-3 text-[14px] font-medium ${netColor}`}
                  data-testid={`net-income-${row.name}`}
                >
                  {formatAmount(row.net_income)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
