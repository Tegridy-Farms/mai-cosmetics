/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExpenseForm } from '@/components/forms/ExpenseForm';

jest.mock('next/link', () => {
  function MockLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({
    options,
    onValueChange,
    placeholder,
    id,
    'aria-describedby': describedby,
    error,
    value,
    disabled,
  }: {
    options: { value: string; label: string }[];
    onValueChange?: (v: string) => void;
    placeholder?: string;
    id?: string;
    'aria-describedby'?: string;
    error?: boolean;
    value?: string;
    disabled?: boolean;
  }) => (
    <select
      id={id}
      aria-describedby={describedby}
      aria-invalid={error ? 'true' : undefined}
      data-testid={id}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      value={value ?? ''}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {(options || []).map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
}));

describe('ExpenseForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 4 fields', () => {
    render(<ExpenseForm />);
    expect(screen.getByLabelText(/תיאור/)).toBeInTheDocument();
    expect(screen.getByTestId('category')).toBeInTheDocument();
    expect(screen.getByLabelText(/תאריך/)).toBeInTheDocument();
    expect(screen.getByLabelText(/סכום/)).toBeInTheDocument();
  });

  it('renders the 4 category options in Hebrew', () => {
    render(<ExpenseForm />);
    const select = screen.getByTestId('category');
    expect(select.querySelectorAll('option')).toHaveLength(5); // 4 + placeholder
    expect(screen.getByText('ציוד')).toBeInTheDocument();
    expect(screen.getByText('חומרים')).toBeInTheDocument();
    expect(screen.getByText('מתכלים')).toBeInTheDocument();
    expect(screen.getByText('אחר')).toBeInTheDocument();
  });

  it('shows validation error when description is empty', async () => {
    render(<ExpenseForm />);
    fireEvent.click(screen.getByRole('button', { name: /שמירה/ }));
    await waitFor(() => {
      expect(screen.getByText(/נדרש תיאור/)).toBeInTheDocument();
    });
  });

  it('shows amount validation error for amount <= 0', async () => {
    render(<ExpenseForm />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/תיאור/), { target: { value: 'Test Expense' } });
      fireEvent.change(screen.getByTestId('category'), { target: { value: 'materials' } });
      fireEvent.change(screen.getByLabelText(/תאריך/), { target: { value: '2026-03-15' } });
      fireEvent.change(screen.getByLabelText(/סכום/), { target: { value: '0' } });
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /שמירה/ }).closest('form')!);
    });
    await waitFor(() => {
      expect(screen.getByText(/הסכום חייב להיות גדול מ-0/)).toBeInTheDocument();
    });
  });

  it('does not submit when validation fails', async () => {
    render(<ExpenseForm />);
    fireEvent.click(screen.getByRole('button', { name: /שמירה/ }));
    await waitFor(() => {
      expect(screen.getByText(/נדרש תיאור/)).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls fetch with correct payload on valid submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<ExpenseForm />);
    fireEvent.change(screen.getByLabelText(/תיאור/), { target: { value: 'Office Supplies' } });
    fireEvent.change(screen.getByTestId('category'), { target: { value: 'materials' } });
    fireEvent.change(screen.getByLabelText(/תאריך/), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/סכום/), { target: { value: '25.99' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /שמירה/ }));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/expenses', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Office Supplies'),
      }));
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.category).toBe('materials');
    expect(body.amount).toBe(25.99);
  });

  it('shows success toast on success and resets form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<ExpenseForm />);
    fireEvent.change(screen.getByLabelText(/תיאור/), { target: { value: 'Office Supplies' } });
    fireEvent.change(screen.getByTestId('category'), { target: { value: 'materials' } });
    fireEvent.change(screen.getByLabelText(/תאריך/), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/סכום/), { target: { value: '25.99' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /שמירה/ }));
    });
    await waitFor(() => {
      expect(screen.getByText(/ההוצאה נרשמה/)).toBeInTheDocument();
    });
    expect((screen.getByLabelText(/תיאור/) as HTMLInputElement).value).toBe('');
  });

  it('shows error toast on 500 response and retains field values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });
    render(<ExpenseForm />);
    fireEvent.change(screen.getByLabelText(/תיאור/), { target: { value: 'Office Supplies' } });
    fireEvent.change(screen.getByTestId('category'), { target: { value: 'materials' } });
    fireEvent.change(screen.getByLabelText(/תאריך/), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/סכום/), { target: { value: '25.99' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /שמירה/ }));
    });
    await waitFor(() => {
      expect(screen.getByText(/לא ניתן לשמור/)).toBeInTheDocument();
    });
    expect((screen.getByLabelText(/תיאור/) as HTMLInputElement).value).toBe('Office Supplies');
  });

  it('Back to Dashboard link points to /', () => {
    render(<ExpenseForm />);
    const backLink = screen.getByText(/חזרה ללוח הבקרה/);
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
});
