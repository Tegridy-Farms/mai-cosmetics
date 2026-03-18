import React from "react";
import { MarketingSubNav } from "@/components/marketing/MarketingSubNav";
import { t } from "@/lib/translations";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">{t.nav.marketing}</h1>
            <div className="text-sm text-text-secondary mt-1">{t.marketing.subtitle}</div>
          </div>
          <MarketingSubNav />
        </div>
      </div>

      <div className="px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">{children}</div>
    </div>
  );
}

