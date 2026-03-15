/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyState } from "@/components/ui/empty-state";

jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No data yet"
        description="Start by logging your first income entry."
        ctaLabel="Log Income"
        ctaHref="/income/new"
      />
    );
    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start by logging your first income entry.")
    ).toBeInTheDocument();
  });

  it("renders CTA link pointing to ctaHref", () => {
    render(
      <EmptyState
        title="No data yet"
        description="Start by logging your first income entry."
        ctaLabel="Log Income"
        ctaHref="/income/new"
      />
    );
    const link = screen.getByRole("link", { name: /log income/i });
    expect(link).toHaveAttribute("href", "/income/new");
  });

  it("CTA has correct label text", () => {
    render(
      <EmptyState
        title="No data yet"
        description="Start by logging your first income entry."
        ctaLabel="Log Income"
        ctaHref="/income/new"
      />
    );
    expect(screen.getByText("Log Income")).toBeInTheDocument();
  });
});
