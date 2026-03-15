/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IncomeForm } from '@/components/forms/IncomeForm';

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

const mockServiceTypes = [
  { id: 1, name: 'Manicure' },
  { id: 2, name: 'Pedicure' },
  { id: 3, name: 'Gel Nails' },
];

describe('IncomeForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 5 fields', () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument();
    expect(screen.getByTestId('service_type_id')).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it('renders all provided service types in dropdown', () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    const select = screen.getByTestId('service_type_id');
    expect(select.querySelectorAll('option')).toHaveLength(4); // 3 + placeholder
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Pedicure')).toBeInTheDocument();
    expect(screen.getByText('Gel Nails')).toBeInTheDocument();
  });

  it('shows validation error when service name is empty', async () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/service name is required/i)).toBeInTheDocument();
    });
  });

  it('shows "Duration must be greater than 0 minutes" for duration <= 0', async () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '0' } });
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);
    });
    await waitFor(() => {
      expect(screen.getByText(/duration must be greater than 0 minutes/i)).toBeInTheDocument();
    });
  });

  it('shows "Amount must be greater than 0" for amount <= 0', async () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '0' } });
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);
    });
    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('does not submit when validation fails', async () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/service name is required/i)).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls fetch with correct payload on valid submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Manicure Session' } });
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/income', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Manicure Session'),
      }));
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.service_type_id).toBe(1);
    expect(body.duration_minutes).toBe(60);
    expect(body.amount).toBe(50);
  });

  it('shows "Saving…" and disables button during submission', async () => {
    let resolvePromise: (v: unknown) => void;
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Manicure Session' } });
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText('Saving…')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    // Resolve to clean up
    await act(async () => {
      resolvePromise!({ ok: true, json: async () => ({ id: 1 }) });
    });
  });

  it('shows "Income logged" toast on success and resets form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Manicure Session' } });
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Income logged')).toBeInTheDocument();
    });
    expect((screen.getByLabelText(/service name/i) as HTMLInputElement).value).toBe('');
  });

  it('shows error toast on 500 response and retains field values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    fireEvent.change(screen.getByLabelText(/service name/i), { target: { value: 'Manicure Session' } });
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Could not save. Please try again.')).toBeInTheDocument();
    });
    expect((screen.getByLabelText(/service name/i) as HTMLInputElement).value).toBe('Manicure Session');
  });

  it('"← Back to Dashboard" link points to /', () => {
    render(<IncomeForm serviceTypes={mockServiceTypes} />);
    const backLink = screen.getByText('← Back to Dashboard');
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
});
