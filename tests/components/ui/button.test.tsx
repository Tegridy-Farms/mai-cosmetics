/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with primary variant classes by default', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-[#1A56DB]');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: /ghost/i });
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-[#E5E7EB]');
  });

  it('renders destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button', { name: /delete/i });
    expect(btn.className).toContain('bg-[#C81E1E]');
  });

  it('renders link variant', () => {
    render(<Button variant="link">Link text</Button>);
    const btn = screen.getByRole('button', { name: /link text/i });
    expect(btn.className).toContain('text-[#1A56DB]');
  });

  it('shows spinner and "Saving…" text when loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards className prop', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });

  it('passes through onClick and other props', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
