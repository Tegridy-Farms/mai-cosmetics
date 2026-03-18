'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: { id: number }) => void;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/lead-sources')
        .then((r) => r.json())
        .then((data) => setLeadSources(Array.isArray(data) ? data : []))
        .catch(() => setLeadSources([]));
    }
  }, [isOpen]);

  const handleSuccess = (customer?: { id: number }) => {
    if (customer?.id) {
      onSuccess(customer);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          aria-labelledby="add-customer-modal-title"
          aria-describedby="add-customer-modal-description"
          className="fixed top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface w-[min(calc(100vw-2rem),440px)] max-h-[85vh] overflow-y-auto rounded-xl shadow-lg z-50 p-6"
        >
          <Dialog.Title id="add-customer-modal-title" className="text-[18px] font-semibold text-text-primary">
            {t.forms.addCustomerForIncome}
          </Dialog.Title>
          <p id="add-customer-modal-description" className="text-[14px] text-text-muted mt-1 mb-4">
            {t.forms.incomeSavedAddCustomer}
          </p>
          <CustomerForm
            leadSources={leadSources}
            onSuccess={handleSuccess}
            hideBackLink
          />
          <div className="mt-4">
            <Dialog.Close asChild>
              <Button variant="ghost" className="w-full">
                {t.entries.cancel}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
