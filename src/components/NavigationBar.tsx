"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Banknote,
  Receipt,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/lib/translations";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: t.nav.dashboard, href: "/", icon: LayoutDashboard },
  { label: t.nav.income, href: "/income", icon: Banknote },
  { label: t.nav.expenses, href: "/expenses", icon: Receipt },
  { label: t.nav.customers, href: "/customers", icon: Users },
  { label: t.nav.serviceTypes, href: "/service-types", icon: Sparkles },
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
            const isActive =
              pathname === item.href ||
              (item.href === '/customers' && pathname.startsWith('/customers'));
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

      {/* Mobile: iOS-style bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-label="ניווט ראשי"
      >
        <div
          className="flex flex-row items-center justify-around min-h-[60px] rounded-t-2xl bg-white/85 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] border border-b-0 border-border/50"
          style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/customers' && pathname.startsWith('/customers'));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[52px] min-w-[56px] py-2 transition-all duration-200 touch-manipulation active:scale-95 ${
                  isActive
                    ? "text-primary"
                    : "text-text-muted/80 hover:text-text-muted"
                }`}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  aria-hidden
                />
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
