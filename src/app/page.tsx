import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ServiceTypeTable } from "@/components/dashboard/ServiceTypeTable";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { EmptyState } from "@/components/ui/empty-state";
import { serverFetch } from "@/lib/server-fetch";
import { t } from "@/lib/translations";
import type { DashboardMetrics, MonthlyTrend } from "@/types";

const emptyMetrics: DashboardMetrics = {
  gross_income: 0,
  total_expenses: 0,
  net_income: 0,
  net_per_hour: 0,
  by_service_type: [],
};

async function fetchTrendData(): Promise<MonthlyTrend[]> {
  try {
    const res = await serverFetch("/api/dashboard/trend");
    if (!res.ok) return [];
    const json = await res.json();
    return (json.months ?? []) as MonthlyTrend[];
  } catch {
    return [];
  }
}

async function fetchMetrics(period: "month" | "all"): Promise<DashboardMetrics> {
  try {
    const res = await serverFetch(`/api/dashboard?period=${period}`);
    if (!res.ok) return emptyMetrics;
    return (await res.json()) as DashboardMetrics;
  } catch {
    return emptyMetrics;
  }
}

export default async function DashboardPage() {
  const [monthData, allData, trendData] = await Promise.all([
    fetchMetrics("month"),
    fetchMetrics("all"),
    fetchTrendData(),
  ]);

  // "Month" is calendar month only; income dated in other months still exists in `allData`.
  const isEmpty =
    allData.gross_income === 0 && allData.total_expenses === 0;

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto w-full">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-4 sm:mb-6">{t.nav.dashboard}</h1>

      {isEmpty ? (
        <EmptyState
          title={t.dashboard.noDataYet}
          description={t.dashboard.startLogging}
          ctaLabel={t.dashboard.logIncome}
          ctaHref="/income/new"
        />
      ) : (
        <>
          <SummaryCards initialMonthData={monthData} initialAllData={allData} />

          <h2 className="text-lg sm:text-[20px] font-semibold text-text-primary mt-6 sm:mt-8 mb-3 sm:mb-4">
            {t.dashboard.incomeByServiceType}
          </h2>
          <ServiceTypeTable data={monthData.by_service_type} />

          <h2 className="text-lg sm:text-[20px] font-semibold text-text-primary mt-6 sm:mt-8 mb-3 sm:mb-4">
            {t.dashboard.monthlyTrend}
          </h2>
          <TrendChart data={trendData} />
        </>
      )}
    </div>
  );
}
