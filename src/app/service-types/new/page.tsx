'use client';

import React from 'react';
import { ServiceTypeForm } from '@/components/forms/ServiceTypeForm';
import { t } from '@/lib/translations';

export default function NewServiceTypePage() {
  return (
    <main className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.serviceTypes.addServiceType}
      </h1>
      <ServiceTypeForm />
    </main>
  );
}
