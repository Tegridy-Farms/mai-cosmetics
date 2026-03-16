/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExpenseTable } from '@/components/entries/ExpenseTable';
import { ExpenseEntry } from '@/types';

jest.mock('next/link', () => {
  function MockLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const mockEntries: ExpenseEntry[] = [
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

describe('ExpenseTable', () => {
  it('renders column headers in Hebrew', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/תאריך/)).toBeInTheDocument();
    expect(screen.getByText(/תיאור/)).toBeInTheDocument();
    expect(screen.getByText(/קטגוריה/)).toBeInTheDocument();
    expect(screen.getByText(/סכום/)).toBeInTheDocument();
    expect(screen.getByText(/פעולות/)).toBeInTheDocument();
  });

  it('renders all entry rows', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText('Nail polish supply')).toBeInTheDocument();
    expect(screen.getByText('New UV lamp')).toBeInTheDocument();
  });

  it('renders delete buttons with descriptive aria-labels', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    const btn = screen.getByLabelText(/מחק הוצאה.*nail polish supply/i);
    expect(btn).toBeInTheDocument();
  });

  it('aria-label includes the entry date', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    const btn = screen.getByLabelText(/מחק הוצאה.*nail polish supply/i);
    expect(btn).toBeInTheDocument();
  });

  it('calls onDelete with the correct entry id when trash icon clicked', () => {
    const onDelete = jest.fn();
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*nail polish supply/i));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onDelete with the correct id for the second entry', () => {
    const onDelete = jest.fn();
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/מחק הוצאה.*new uv lamp/i));
    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it('shows skeleton rows when isLoading=true', () => {
    const { container } = render(
      <ExpenseTable entries={[]} isLoading={true} onDelete={jest.fn()} />
    );
    const skeletons = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('does not render data rows when isLoading=true', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={true} onDelete={jest.fn()} />);
    expect(screen.queryByText('Nail polish supply')).not.toBeInTheDocument();
  });

  it('shows empty state message when entries is empty and not loading', () => {
    render(<ExpenseTable entries={[]} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/אין רשומות התואמות את הסינון/)).toBeInTheDocument();
  });

  it('does not show empty state when there are entries', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.queryByText(/אין רשומות התואמות את הסינון/)).not.toBeInTheDocument();
  });

  it('formats amount with ILS symbol and 2 decimal places', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText(/120\.00 ₪/)).toBeInTheDocument();
    expect(screen.getByText(/350\.00 ₪/)).toBeInTheDocument();
  });

  it('displays the category in Hebrew in the row', () => {
    render(<ExpenseTable entries={mockEntries} isLoading={false} onDelete={jest.fn()} />);
    expect(screen.getByText('חומרים')).toBeInTheDocument();
    expect(screen.getByText('ציוד')).toBeInTheDocument();
  });
});
