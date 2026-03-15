/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders with default styles', () => {
    render(<Input placeholder="Enter value" />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toBeInTheDocument();
    expect(input.className).toContain('border-[#E5E7EB]');
    expect(input.className).toContain('h-[44px]');
  });

  it('is full width by default', () => {
    render(<Input placeholder="test" />);
    expect(screen.getByPlaceholderText('test').className).toContain('w-full');
  });

  it('applies error border when error prop is true', () => {
    render(<Input error placeholder="test" />);
    const input = screen.getByPlaceholderText('test');
    expect(input.className).toContain('border-[#C81E1E]');
    expect(input.className).not.toContain('border-[#E5E7EB]');
  });

  it('forwards aria-invalid', () => {
    render(<Input aria-invalid="true" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards aria-describedby', () => {
    render(<Input aria-describedby="error-msg" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveAttribute('aria-describedby', 'error-msg');
  });

  it('forwards aria-label', () => {
    render(<Input aria-label="My input" />);
    expect(screen.getByLabelText('My input')).toBeInTheDocument();
  });

  it('forwards disabled prop', () => {
    render(<Input disabled placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toBeDisabled();
  });

  it('accepts additional className', () => {
    render(<Input className="pl-7" placeholder="test" />);
    expect(screen.getByPlaceholderText('test').className).toContain('pl-7');
  });
});
