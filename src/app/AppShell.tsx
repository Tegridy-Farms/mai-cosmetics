'use client';

import { usePathname } from 'next/navigation';
import { NavigationBar } from '@/components/NavigationBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const isPublic = pathname === '/login' || pathname.startsWith('/f/');

  if (isPublic) {
    return <main className="min-h-screen bg-background text-text-primary">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <NavigationBar />
      <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
    </div>
  );
}

