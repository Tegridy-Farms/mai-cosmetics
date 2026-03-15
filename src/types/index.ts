export interface ServiceType {
  id: number;
  name: string;
  created_at?: string;
}

export interface IncomeEntry {
  id: number;
  service_name: string;
  service_type_id: number;
  date: string;
  duration_minutes: number;
  amount: number;
  created_at: string;
}

export interface ExpenseEntry {
  id: number;
  description: string;
  category: 'equipment' | 'materials' | 'consumables' | 'other';
  date: string;
  amount: number;
  created_at: string;
}

export interface ServiceTypeMetric {
  name: string;
  total_sessions: number;
  total_hours: number;
  gross_income: number;
  expense_share: number;
  net_income: number;
}

export interface DashboardMetrics {
  gross_income: number;
  total_expenses: number;
  net_income: number;
  net_per_hour: number;
  by_service_type: ServiceTypeMetric[];
}

export interface MonthlyTrend {
  month: string;
  gross: number;
  expenses: number;
  net: number;
}

export interface FilterState {
  service_type_id?: number;
  category?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
