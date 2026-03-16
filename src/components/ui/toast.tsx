'use client';

import React, { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return { showToast, toasts };
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-[calc(4rem+4px+env(safe-area-inset-bottom))] end-4 start-4 sm:start-auto z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-[6px] text-white text-sm font-medium shadow-lg ${
            toast.variant === 'success' ? 'bg-success' : 'bg-error'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
