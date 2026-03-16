"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { t } from "@/lib/translations";

const navItems = [
  { label: t.nav.dashboard, href: "/" },
  { label: t.nav.income, href: "/income" },
  { label: t.nav.expenses, href: "/expenses" },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: vertical sidebar - RTL: sidebar on right */}
      <nav
        className="hidden lg:flex flex-col w-[220px] min-h-screen bg-white border-e border-border shrink-0"
        aria-label="ניווט ראשי"
      >
        <div className="px-4 py-5">
          <Link href="/" className="block" aria-label={t.nav.maiCosmetics}>
            <Image
              src="/Logo-01.svg"
              alt={t.nav.maiCosmetics}
              width={140}
              height={48}
              className="max-h-10 w-auto object-contain object-start"
              priority
            />
          </Link>
        </div>
        <ul className="flex flex-col mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center h-[44px] px-4 text-[14px] font-medium transition-colors rounded-s-lg ${
                    isActive
                      ? "bg-primary-tint border-s-[3px] border-primary text-primary"
                      : "text-text-primary hover:bg-background"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: bottom tab bar - explicit left/right for reliable full-width in RTL */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 w-full flex flex-row items-center min-h-[56px] pb-[env(safe-area-inset-bottom)] bg-white border-t border-border z-50"
        aria-label="ניווט ראשי"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] text-[11px] font-medium transition-colors touch-manipulation ${
                isActive ? "text-primary" : "text-text-muted"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
