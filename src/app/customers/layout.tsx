'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/translations';

const customersTabs = [
  { label: t.customers.title, href: '/customers' },
  { label: t.leadSources.title, href: '/customers/lead-sources' },
];

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="border-b border-border mb-6">
        <nav
          className="flex gap-6 -mb-px"
          aria-label={t.customers.title}
        >
          {customersTabs.map((tab) => {
            const isCustomersTab = tab.href === '/customers';
            const isActive =
              tab.href === pathname ||
              (isCustomersTab &&
                pathname.startsWith('/customers') &&
                !pathname.includes('/lead-sources'));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
