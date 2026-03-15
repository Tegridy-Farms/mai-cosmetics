import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-[44px] px-3 border rounded-[6px] outline-none transition-colors ${
          error
            ? 'border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E] focus:border-[#C81E1E]'
            : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#3F83F8] focus:border-[#3F83F8]'
        } disabled:bg-[#F9FAFB] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
