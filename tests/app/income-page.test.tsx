/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import IncomePage from '@/app/income/page';

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

const mockIncomeEntries = [
  {
    id: 1,
    service_name: 'Classic Manicure',
    service_type_id: 1,
    date: '2026-03-12',
    duration_minutes: 60,
    amount: 45.0,
    created_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 2,
    service_name: 'Gel Pedicure',
    service_type_id: 2,
    date: '2026-03-13',
    duration_minutes: 90,
    amount: 65.0,
    created_at: '2026-03-13T10:00:00Z',
  },
];

const mockServiceTypes = [
  { id: 1, name: 'Manicure' },
  { id: 2, name: 'Pedicure' },
  { id: 3, name: 'Gel Nails' },
];

function mockFetchSuccess() {
  return jest.fn().mockImplementation((url: string) => {
    if (url.includes('/api/service-types')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockServiceTypes),
      });
    }
    if (url.includes('/api/income') && !url.includes('/api/income/')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockIncomeEntries,
            total: 2,
            page: 1,
            pageSize: 20,
          }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe('IncomePage', () => {
  beforeEach(() => {
    global.fetch = mockFetchSuccess() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders "Income Entries" heading', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    expect(screen.getByRole('heading', { name: /income entries/i })).toBeInTheDocument();
  });

  it('renders "+ Add Income" button linking to /income/new', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    const link = screen.getByText('+ Add Income').closest('a');
    expect(link).toHaveAttribute('href', '/income/new');
  });

  it('renders "Export CSV" button', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('fetches and displays income entries', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
      expect(screen.getByText('Gel Pedicure')).toBeInTheDocument();
    });
  });

  it('fetches service types for the filter bar', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Manicure')).toBeInTheDocument();
    });
  });

  it('opens delete dialog when trash icon clicked', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/delete income entry.*classic manicure/i));
    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
  });

  it('closes delete dialog on Cancel', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/delete income entry.*classic manicure/i));
    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Delete this entry?')).not.toBeInTheDocument();
    });
  });

  it('deletes entry on confirm and re-fetches', async () => {
    const fetchMock = mockFetchSuccess();
    // After delete, return empty list
    let deleteCallCount = 0;
    fetchMock.mockImplementation((url: string, opts?: { method?: string }) => {
      if (opts?.method === 'DELETE') {
        deleteCallCount++;
        return Promise.resolve({ ok: true, status: 204 });
      }
      if (url.includes('/api/service-types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockServiceTypes),
        });
      }
      if (url.includes('/api/income') && !url.includes('/api/income/')) {
        if (deleteCallCount > 0) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [mockIncomeEntries[1]],
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
              data: mockIncomeEntries,
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
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/delete income entry.*classic manicure/i));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText('Classic Manicure')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when delete fails', async () => {
    const fetchMock = mockFetchSuccess();
    fetchMock.mockImplementation((url: string, opts?: { method?: string }) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({ ok: false, status: 500 });
      }
      if (url.includes('/api/service-types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockServiceTypes),
        });
      }
      if (url.includes('/api/income')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockIncomeEntries,
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
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/delete income entry.*classic manicure/i));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/could not delete/i)).toBeInTheDocument();
    });
  });

  it('resets to page 1 when filter changes', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    });

    // Change service type filter
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });

    // Verify fetch was called with page=1 and service_type_id=1
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastIncomeCall = calls
        .filter((c: string[]) => c[0].includes('/api/income?'))
        .pop();
      expect(lastIncomeCall[0]).toContain('page=1');
      expect(lastIncomeCall[0]).toContain('service_type_id=1');
    });
  });

  it('renders filter bar with income variant', async () => {
    await act(async () => {
      render(<IncomePage />);
    });
    // Filter bar controls exist
    expect(screen.getByTestId('service_type_id')).toBeInTheDocument();
    expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument();
  });

  it('shows empty state when no entries returned', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/service-types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockServiceTypes),
        });
      }
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
      render(<IncomePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/no entries match your filters/i)).toBeInTheDocument();
    });
  });
});
