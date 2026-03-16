/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpensesPage from '@/app/expenses/page';

// Mock next/link
jest.mock('next/link', () => {
  function MockLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock @radix-ui/react-dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement(React.Fragment, null, children) : null,
  Portal: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Overlay: ({ className }: { className?: string }) =>
    React.createElement('div', { className, 'data-testid': 'dialog-overlay' }),
  Content: ({
    children,
    role,
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    className,
  }: {
    children: React.ReactNode;
    role?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    className?: string;
  }) =>
    React.createElement(
      'div',
      { role, 'aria-labelledby': labelledby, 'aria-describedby': describedby, className },
      children
    ),
  Title: ({
    children,
    id,
    className,
  }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
  }) => React.createElement('h4', { id, className }, children),
  Description: ({
    children,
    id,
    className,
  }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
  }) => React.createElement('p', { id, className }, children),
  Close: ({ children }: { children: React.ReactNode; asChild?: boolean }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock @radix-ui/react-select for FilterBar
jest.mock('@/components/ui/select', () => ({
  Select: ({
    options,
    onValueChange,
    value,
    id,
    placeholder,
  }: {
    options: { value: string; label: string }[];
    onValueChange?: (v: string) => void;
    value?: string;
    id?: string;
    placeholder?: string;
  }) => (
    <select
      id={id}
      data-testid={id}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      value={value ?? ''}
    >
      <option value="">{placeholder}</option>
      {(options || []).map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

const mockExpenseEntries = [
  {
    id: 1,
    description: 'Nail polish supply',
    category: 'materials',
    date: '2026-03-10',
    amount: 120.0,
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 2,
    description: 'New UV lamp',
    category: 'equipment',
    date: '2026-03-11',
    amount: 350.0,
    created_at: '2026-03-11T10:00:00Z',
  },
];

function mockFetchSuccess() {
  return jest.fn().mockImplementation((url: string) => {
    if (url.includes('/api/expenses') && !url.includes('/api/expenses/')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockExpenseEntries,
            total: 2,
            page: 1,
            pageSize: 20,
          }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe('ExpensesPage', () => {
  beforeEach(() => {
    global.fetch = mockFetchSuccess() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders "Expense Entries" heading', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    expect(screen.getByRole('heading', { name: /רשומות הוצאות/ })).toBeInTheDocument();
  });

  it('renders "+ Add Expense" button linking to /expenses/new', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    const link = screen.getByText(/הוספת הוצאה/).closest('a');
    expect(link).toHaveAttribute('href', '/expenses/new');
  });

  it('renders "Export CSV" button', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    expect(screen.getByText(/ייצוא CSV/)).toBeInTheDocument();
  });

  it('"Export CSV" button links to /api/expenses/export', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    const exportLink = screen.getByText(/ייצוא CSV/).closest('a');
    expect(exportLink).toHaveAttribute('href', '/api/expenses/export');
  });

  it('fetches and displays expense entries', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
      expect(screen.getByText('New UV lamp')).toBeInTheDocument();
    });
  });

  it('renders filter bar with expense variant (category filter)', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    // Category label exists in the filter bar
    expect(screen.getByTestId('category')).toBeInTheDocument();
    expect(screen.getByLabelText(/^מ$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^עד$/)).toBeInTheDocument();
  });

  it('shows category options in filter bar', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    // Category select should contain all options
    const categorySelect = screen.getByTestId('category');
    expect(categorySelect).toBeInTheDocument();
    const options = categorySelect.querySelectorAll('option');
    const optionValues = Array.from(options).map((o) => o.value);
    expect(optionValues).toContain('equipment');
    expect(optionValues).toContain('materials');
    expect(optionValues).toContain('consumables');
    expect(optionValues).toContain('other');
  });

  it('opens delete dialog when trash icon clicked', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*Nail polish supply/i));
    expect(screen.getByText(/למחוק את הרשומה/)).toBeInTheDocument();
  });

  it('closes delete dialog on Cancel', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*Nail polish supply/i));
    expect(screen.getByText(/למחוק את הרשומה/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ביטול/ }));
    await waitFor(() => {
      expect(screen.queryByText(/למחוק את הרשומה/)).not.toBeInTheDocument();
    });
  });

  it('deletes entry on confirm and re-fetches', async () => {
    const fetchMock = mockFetchSuccess();
    let deleteCallCount = 0;
    fetchMock.mockImplementation((url: string, opts?: { method?: string }) => {
      if (opts?.method === 'DELETE') {
        deleteCallCount++;
        return Promise.resolve({ ok: true, status: 204 });
      }
      if (url.includes('/api/expenses') && !url.includes('/api/expenses/')) {
        if (deleteCallCount > 0) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [mockExpenseEntries[1]],
                total: 1,
                page: 1,
                pageSize: 20,
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockExpenseEntries,
              total: 2,
              page: 1,
              pageSize: 20,
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*Nail polish supply/i));
    await act(async () => {
      fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /מחק/ }));
    });
    await waitFor(() => {
      expect(screen.queryByText('Nail polish supply')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when delete fails', async () => {
    const fetchMock = mockFetchSuccess();
    fetchMock.mockImplementation((url: string, opts?: { method?: string }) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/api/expenses')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockExpenseEntries,
              total: 2,
              page: 1,
              pageSize: 20,
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*Nail polish supply/i));
    await act(async () => {
      fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /מחק/ }));
    });
    await waitFor(() => {
      expect(screen.getByText(/לא ניתן למחוק/)).toBeInTheDocument();
    });
  });

  it('resets to page 1 when category filter changes', async () => {
    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('category'), { target: { value: 'equipment' } });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastExpenseCall = calls
        .filter((c: string[]) => c[0].includes('/api/expenses?'))
        .pop();
      expect(lastExpenseCall[0]).toContain('page=1');
      expect(lastExpenseCall[0]).toContain('category=equipment');
    });
  });

  it('shows empty state when no entries returned', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            total: 0,
            page: 1,
            pageSize: 20,
          }),
      });
    }) as unknown as typeof fetch;

    await act(async () => {
      render(<ExpensesPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/אין רשומות התואמות את הסינון/)).toBeInTheDocument();
    });
  });
});
