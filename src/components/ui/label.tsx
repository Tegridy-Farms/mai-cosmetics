import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`text-[12px] font-medium text-[#374151] block mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
