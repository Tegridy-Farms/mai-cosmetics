import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = '', rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full min-h-[120px] px-3 py-2 border rounded-lg outline-none transition-colors resize-y font-sans text-text-primary ${
          error
            ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
            : 'border-border focus:ring-2 focus:ring-focusRing focus:border-focusRing'
        } disabled:bg-background disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
