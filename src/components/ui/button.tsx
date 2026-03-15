import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'destructive' | 'link';
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[#1A56DB] hover:bg-[#1E429F] text-white h-[44px] px-4 rounded-[6px] font-medium',
  ghost: 'bg-transparent border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] h-[44px] px-4 rounded-[6px]',
  destructive: 'bg-[#C81E1E] text-white hover:bg-[#9B1C1C] h-[44px] px-4 rounded-[6px] font-medium',
  link: 'bg-transparent text-[#1A56DB] underline hover:text-[#1E429F] p-0',
};

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving…
        </>
      ) : children}
    </button>
  );
}
