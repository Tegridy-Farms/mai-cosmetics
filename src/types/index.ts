// ─── Service Types ───────────────────────────────────────────────────────────

export interface ServiceType {
  id: number;
  name: string;
  created_at?: string;
}

// ─── Income Entries ──────────────────────────────────────────────────────────

export interface IncomeEntry {
  id: number;
  date: string;
  service_type_id: number;
  service_type?: ServiceType;
  amount: number;
  notes?: string;
  created_at?: string;
}

// ─── Expense Entries ─────────────────────────────────────────────────────────

export interface ExpenseEntry {
  id: number;
  date: string;
  category: string;
  amount: number;
  notes?: string;
  created_at?: string;
}

// ─── Convenience re-exports ──────────────────────────────────────────────────

export type ServiceTypeName =
  | 'Manicure'
  | 'Pedicure'
  | 'Gel Nails'
  | 'Acrylic Nails'
  | 'Nail Art'
  | 'Eyebrow Shaping'
  | 'Eyelash Treatment'
  | 'Facial'
  | 'Other';
