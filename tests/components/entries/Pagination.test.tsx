/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Pagination } from '@/components/entries/Pagination';

describe('Pagination', () => {
  it('shows Hebrew pagination text on page 1 with 45 total', () => {
    render(<Pagination total={45} page={1} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByText(/מציג 1–20 מתוך 45 רשומות/)).toBeInTheDocument();
  });

  it('shows Hebrew pagination text on page 2', () => {
    render(<Pagination total={45} page={2} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByText(/מציג 21–40 מתוך 45 רשומות/)).toBeInTheDocument();
  });

  it('shows Hebrew pagination text on last partial page', () => {
    render(<Pagination total={45} page={3} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByText(/מציג 41–45 מתוך 45 רשומות/)).toBeInTheDocument();
  });

  it('Prev button is disabled on page 1', () => {
    render(<Pagination total={45} page={1} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /הקודם/ })).toBeDisabled();
  });

  it('Next button is disabled on last page', () => {
    render(<Pagination total={45} page={3} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /הבא/ })).toBeDisabled();
  });

  it('Prev button is enabled on page 2', () => {
    render(<Pagination total={45} page={2} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /הקודם/ })).not.toBeDisabled();
  });

  it('Next button is enabled on page 1 when more pages exist', () => {
    render(<Pagination total={45} page={1} pageSize={20} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /הבא/ })).not.toBeDisabled();
  });

  it('calls onChange with page+1 when Next clicked', () => {
    const onChange = jest.fn();
    render(<Pagination total={45} page={1} pageSize={20} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /הבא/ }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with page-1 when Prev clicked', () => {
    const onChange = jest.fn();
    render(<Pagination total={45} page={2} pageSize={20} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /הקודם/ }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('returns null (hidden) when total fits on one page', () => {
    const { container } = render(
      <Pagination total={10} page={1} pageSize={20} onChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when total equals pageSize exactly', () => {
    const { container } = render(
      <Pagination total={20} page={1} pageSize={20} onChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when total exceeds pageSize', () => {
    const { container } = render(
      <Pagination total={21} page={1} pageSize={20} onChange={jest.fn()} />
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('uses default pageSize of 20 when not provided', () => {
    render(<Pagination total={45} page={1} onChange={jest.fn()} />);
    expect(screen.getByText(/מציג 1–20 מתוך 45 רשומות/)).toBeInTheDocument();
  });
});
