/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';

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

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  isDeleting: false,
  entryDescription: 'Classic Manicure, Mar 12',
};

describe('DeleteConfirmDialog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title in Hebrew', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText(/למחוק את הרשומה/)).toBeInTheDocument();
  });

  it('renders body in Hebrew', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText(/לא ניתן לבטל פעולה זו/)).toBeInTheDocument();
  });

  it('has role="alertdialog"', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('has aria-labelledby attribute pointing to the title', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const labelledby = dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = document.getElementById(labelledby!);
    expect(titleEl?.textContent).toMatch(/למחוק את הרשומה/);
  });

  it('has aria-describedby attribute pointing to the description', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const describedby = dialog.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    const descEl = document.getElementById(describedby!);
    expect(descEl?.textContent).toContain('לא ניתן לבטל פעולה זו');
  });

  it('renders Cancel and Delete buttons', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /ביטול/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /מחק/ })).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<DeleteConfirmDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /ביטול/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Delete clicked', () => {
    const onConfirm = jest.fn();
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /מחק/ }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('shows "Deleting…" text when isDeleting=true', () => {
    render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />);
    expect(screen.getByText(/מוחק/)).toBeInTheDocument();
  });

  it('disables the Delete button when isDeleting=true', () => {
    render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />);
    expect(screen.getByRole('button', { name: /מוחק/ })).toBeDisabled();
  });

  it('does not render dialog content when isOpen=false', () => {
    render(<DeleteConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not render Cancel or Delete buttons when closed', () => {
    render(<DeleteConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('button', { name: /ביטול/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /מחק/ })).not.toBeInTheDocument();
  });
});
