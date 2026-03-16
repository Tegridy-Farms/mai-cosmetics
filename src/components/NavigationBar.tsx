"use client";

import Link from "next/link";
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
        className="hidden lg:flex flex-col w-[220px] min-h-screen bg-white border-e border-[#E5E7EB] shrink-0"
        aria-label="ניווט ראשי"
      >
        <div className="px-4 py-5">
          <span className="text-[16px] font-semibold text-[#111827]">
            {t.nav.maiCosmetics}
          </span>
        </div>
        <ul className="flex flex-col mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center h-[44px] px-4 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#EBF5FB] border-s-[3px] border-[#1A56DB] text-[#1A56DB]"
                      : "text-[#374151] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: bottom tab bar - remove Export (links to non-existent page) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-inline-0 h-[56px] bg-white border-t border-[#E5E7EB] flex items-center z-50"
        aria-hidden="true"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center text-[11px] font-medium transition-colors ${
                isActive ? "text-[#1A56DB]" : "text-[#6B7280]"
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
