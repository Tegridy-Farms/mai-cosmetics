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
      className="fixed bottom-4 end-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-[6px] text-white text-sm font-medium shadow-lg ${
            toast.variant === 'success' ? 'bg-[#057A55]' : 'bg-[#C81E1E]'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
