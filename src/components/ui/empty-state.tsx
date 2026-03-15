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
      {/* Placeholder icon */}
      <div className="w-16 h-16 bg-[#E5E7EB] rounded-[8px] mb-6" aria-hidden="true" />

      <h3 className="text-[18px] font-semibold text-[#111827] mb-2">{title}</h3>
      <p className="text-[14px] text-[#6B7280] mb-6 max-w-[320px]">{description}</p>

      <Link href={ctaHref}>
        <Button variant="primary">{ctaLabel}</Button>
      </Link>
    </div>
  );
}
