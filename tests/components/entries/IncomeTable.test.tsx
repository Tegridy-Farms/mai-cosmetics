/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IncomeTable } from '@/components/entries/IncomeTable';
import { IncomeEntry } from '@/types';

jest.mock('next/link', () => {
  function MockLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const mockEntries: IncomeEntry[] = [
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

describe('IncomeTable', () => {
  it('renders column headers: Date, Service Name, Service Type, Duration, Amount, Actions', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByText(/service name/i)).toBeInTheDocument();
    expect(screen.getByText(/service type/i)).toBeInTheDocument();
    expect(screen.getByText(/duration/i)).toBeInTheDocument();
    expect(screen.getByText(/amount/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });

  it('renders all entry rows', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText('Classic Manicure')).toBeInTheDocument();
    expect(screen.getByText('Gel Pedicure')).toBeInTheDocument();
  });

  it('renders delete buttons with descriptive aria-labels', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    const btn = screen.getByLabelText(/delete income entry.*classic manicure/i);
    expect(btn).toBeInTheDocument();
  });

  it('aria-label includes the entry date', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    const btn = screen.getByLabelText(/delete income entry.*classic manicure.*mar 12/i);
    expect(btn).toBeInTheDocument();
  });

  it('calls onDelete with the correct entry id when trash icon clicked', () => {
    const onDelete = jest.fn();
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={onDelete} />);
    const btn = screen.getByLabelText(/delete income entry.*classic manicure/i);
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onDelete with the correct id for the second entry', () => {
    const onDelete = jest.fn();
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/delete income entry.*gel pedicure/i));
    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it('shows skeleton rows when isLoading=true', () => {
    const { container } = render(
      <IncomeTable entries={[]} isLoading={true} onDelete={jest.fn()} />
    );
    const skeletons = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('does not render data rows when isLoading=true', () => {
    render(<IncomeTable entries={mockEntries} isLoading={true} onDelete={jest.fn()} />);
    expect(screen.queryByText('Classic Manicure')).not.toBeInTheDocument();
  });

  it('shows empty state message when entries is empty and not loading', () => {
    render(<IncomeTable entries={[]} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/no entries match your filters/i)).toBeInTheDocument();
  });

  it('does not show empty state when there are entries', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.queryByText(/no entries match your filters/i)).not.toBeInTheDocument();
  });

  it('formats amount with dollar sign and 2 decimal places', () => {
    render(<IncomeTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText('$45.00')).toBeInTheDocument();
    expect(screen.getByText('$65.00')).toBeInTheDocument();
  });
});
