/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterBar } from '@/components/entries/FilterBar';

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
      {(options || []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

const mockServiceTypes = [
  { id: 1, name: 'Manicure' },
  { id: 2, name: 'Pedicure' },
];

describe('FilterBar - income variant', () => {
  it('renders Service Type, From, and To labels', () => {
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.getByText(/service type/i)).toBeInTheDocument();
    expect(screen.getByText(/^from$/i)).toBeInTheDocument();
    expect(screen.getByText(/^to$/i)).toBeInTheDocument();
  });

  it('labels are associated with controls (accessible)', () => {
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument();
  });

  it('does not show Clear Filters when no filters active', () => {
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();
  });

  it('shows Clear Filters when service_type_id filter active', () => {
    render(
      <FilterBar
        variant="income"
        filters={{ service_type_id: 1 }}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('shows Clear Filters when date_from filter active', () => {
    render(
      <FilterBar
        variant="income"
        filters={{ date_from: '2026-01-01' }}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('calls onChange with updated service_type_id when select changes', () => {
    const onChange = jest.fn();
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={onChange}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    fireEvent.change(screen.getByTestId('service_type_id'), { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ service_type_id: 1 }));
  });

  it('calls onChange with date_from when From input changes', () => {
    const onChange = jest.fn();
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={onChange}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    fireEvent.change(screen.getByLabelText(/^from$/i), { target: { value: '2026-01-01' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ date_from: '2026-01-01' }));
  });

  it('calls onChange with date_to when To input changes', () => {
    const onChange = jest.fn();
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={onChange}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    fireEvent.change(screen.getByLabelText(/^to$/i), { target: { value: '2026-03-31' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ date_to: '2026-03-31' }));
  });

  it('calls onClear when Clear Filters clicked', () => {
    const onClear = jest.fn();
    render(
      <FilterBar
        variant="income"
        filters={{ date_from: '2026-01-01' }}
        onChange={jest.fn()}
        onClear={onClear}
        serviceTypes={mockServiceTypes}
      />
    );
    fireEvent.click(screen.getByText(/clear filters/i));
    expect(onClear).toHaveBeenCalled();
  });

  it('announces "Filters cleared" via aria-live region on clear', () => {
    const { container } = render(
      <FilterBar
        variant="income"
        filters={{ date_from: '2026-01-01' }}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    fireEvent.click(screen.getByText(/clear filters/i));
    const liveRegion = container.querySelector('[aria-live]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion?.textContent).toContain('Filters cleared');
  });

  it('renders service type options passed via serviceTypes prop', () => {
    render(
      <FilterBar
        variant="income"
        filters={{}}
        onChange={jest.fn()}
        onClear={jest.fn()}
        serviceTypes={mockServiceTypes}
      />
    );
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Pedicure')).toBeInTheDocument();
  });
});

describe('FilterBar - expense variant', () => {
  it('renders Category, From, and To labels', () => {
    render(
      <FilterBar variant="expense" filters={{}} onChange={jest.fn()} onClear={jest.fn()} />
    );
    expect(screen.getByText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByText(/^from$/i)).toBeInTheDocument();
    expect(screen.getByText(/^to$/i)).toBeInTheDocument();
  });

  it('shows category options: equipment, materials, consumables, other', () => {
    render(
      <FilterBar variant="expense" filters={{}} onChange={jest.fn()} onClear={jest.fn()} />
    );
    expect(screen.getByText('equipment')).toBeInTheDocument();
    expect(screen.getByText('materials')).toBeInTheDocument();
    expect(screen.getByText('consumables')).toBeInTheDocument();
    expect(screen.getByText('other')).toBeInTheDocument();
  });

  it('shows Clear Filters when category filter active', () => {
    render(
      <FilterBar
        variant="expense"
        filters={{ category: 'equipment' }}
        onChange={jest.fn()}
        onClear={jest.fn()}
      />
    );
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('calls onChange with updated category when select changes', () => {
    const onChange = jest.fn();
    render(
      <FilterBar variant="expense" filters={{}} onChange={onChange} onClear={jest.fn()} />
    );
    fireEvent.change(screen.getByTestId('category'), { target: { value: 'materials' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'materials' }));
  });

  it('does not render service type select for expense variant', () => {
    render(
      <FilterBar variant="expense" filters={{}} onChange={jest.fn()} onClear={jest.fn()} />
    );
    expect(screen.queryByTestId('service_type_id')).not.toBeInTheDocument();
  });
});
