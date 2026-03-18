"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/translations";

type MarketingTab = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function MarketingSubNav() {
  const pathnameRaw = usePathname() ?? "";
  const pathname = normalizePathname(pathnameRaw);

  const tabs: MarketingTab[] = useMemo(
    () => [
      {
        label: t.marketing.dashboard,
        href: "/marketing",
        isActive: (p) => p === "/marketing",
      },
      {
        label: t.leads.title,
        href: "/marketing/leads",
        isActive: (p) => p === "/marketing/leads" || p.startsWith("/marketing/leads/"),
      },
      {
        label: t.campaigns.title,
        href: "/marketing/campaigns",
        isActive: (p) => p === "/marketing/campaigns" || p.startsWith("/marketing/campaigns/"),
      },
      {
        label: t.adminForms.title,
        href: "/marketing/forms",
        isActive: (p) => p === "/marketing/forms" || p.startsWith("/marketing/forms/"),
      },
    ],
    []
  );

  return (
    <div className="w-full">
      {/* Desktop: horizontal section tabs */}
      <div className="hidden sm:flex items-center gap-2">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center h-[40px] px-4 rounded-full border text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-text-primary hover:bg-background"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile: segmented control */}
      <div className="sm:hidden">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white border border-border shadow-sm">
          {tabs.map((tab) => {
            const active = tab.isActive(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center justify-center h-[40px] rounded-xl text-[12px] font-semibold transition-colors ${
                  active ? "bg-primary text-white" : "text-text-muted hover:bg-background"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

