import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-[44px] px-3 border rounded-lg outline-none transition-colors ${
          error
            ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
            : 'border-border focus:ring-2 focus:ring-focusRing focus:border-focusRing'
        } disabled:bg-background disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
