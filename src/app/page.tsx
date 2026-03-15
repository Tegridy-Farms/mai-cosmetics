import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ServiceTypeTable } from "@/components/dashboard/ServiceTypeTable";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardMetrics } from "@/types";

const emptyMetrics: DashboardMetrics = {
  gross_income: 0,
  total_expenses: 0,
  net_income: 0,
  net_per_hour: 0,
  by_service_type: [],
};

async function fetchMetrics(period: "month" | "all"): Promise<DashboardMetrics> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard?period=${period}`, {
      cache: "no-store",
    });
    if (!res.ok) return emptyMetrics;
    return (await res.json()) as DashboardMetrics;
  } catch {
    return emptyMetrics;
  }
}

export default async function DashboardPage() {
  const [monthData, allData] = await Promise.all([
    fetchMetrics("month"),
    fetchMetrics("all"),
  ]);

  const isEmpty =
    monthData.gross_income === 0 && monthData.total_expenses === 0;

  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="text-[30px] font-bold text-[#111827] mb-6">Dashboard</h1>

      {isEmpty ? (
        <EmptyState
          title="No data yet"
          description="Start logging income and expenses to see your dashboard metrics."
          ctaLabel="Log Income"
          ctaHref="/income/new"
        />
      ) : (
        <>
          <SummaryCards initialMonthData={monthData} initialAllData={allData} />

          <h2 className="text-[20px] font-semibold text-[#111827] mt-8 mb-4">
            Income by Service Type
          </h2>
          <ServiceTypeTable data={monthData.by_service_type} />
        </>
      )}
    </div>
  );
}
