import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Beauty/care-inspired icon with pink tint */}
      <div className="w-16 h-16 bg-primary-tint rounded-2xl mb-6 flex items-center justify-center" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>

      <h3 className="text-[18px] font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-[14px] text-text-muted mb-6 max-w-[320px]">{description}</p>

      <Link href={ctaHref}>
        <Button variant="primary">{ctaLabel}</Button>
      </Link>
    </div>
  );
}
