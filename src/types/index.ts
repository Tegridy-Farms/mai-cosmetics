export interface ServiceType {
  id: number;
  name: string;
  default_price?: number | null;
  default_duration?: number | null;
  created_at?: string;
}

export interface LeadSource {
  id: number;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  lead_source_id?: number | null;
  questionnaire_data?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeEntry {
  id: number;
  service_name: string;
  service_type_id: number;
  customer_id?: number | null;
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

export interface CustomerFilterState {
  search?: string;
  lead_source_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
