export type {
  ApiErrorBody,
  ApiErrorCode,
  PaginatedMeta,
  PaginatedResult,
} from '@/types/api';
export { API_ERROR_CODES } from '@/types/api';

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

export type SourceChannel = 'instagram' | 'facebook' | 'referral' | 'other';
export type CampaignChannelFocus = 'instagram' | 'facebook' | 'referral' | 'mixed' | 'other';
export type FormStatus = 'draft' | 'published' | 'archived';
export type LeadStage = 'new' | 'qualified' | 'contacted' | 'scheduled' | 'converted' | 'lost';
export type LeadEventType = 'stage_change' | 'note' | 'contact_attempt' | 'conversion';

export interface Campaign {
  id: number;
  name: string;
  slug: string;
  channel_focus: CampaignChannelFocus;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  notes?: string | null;
  created_at?: string;
}

export interface Form {
  id: number;
  campaign_id?: number | null;
  name: string;
  slug: string;
  status: FormStatus;
  ui_schema: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: number;
  form_id?: number | null;
  campaign_id?: number | null;
  source_channel: SourceChannel;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  consent_marketing: boolean;
  stage: LeadStage;
  lost_reason?: string | null;
  converted_customer_id?: number | null;
  attribution: Record<string, unknown>;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadEvent {
  id: number;
  lead_id: number;
  type: LeadEventType;
  payload: Record<string, unknown>;
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
