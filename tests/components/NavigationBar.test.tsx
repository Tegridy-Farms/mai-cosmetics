/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";
import { NavigationBar } from "@/components/NavigationBar";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

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

describe("NavigationBar", () => {
  it("renders Mai Cosmetics brand name", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<NavigationBar />);
    expect(screen.getByText("Mai Cosmetics")).toBeInTheDocument();
  });

  it("renders nav links for Dashboard, Income, Expenses", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<NavigationBar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /income/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /expenses/i })).toBeInTheDocument();
  });

  it("active link (pathname '/') has aria-current='page'", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<NavigationBar />);
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("active link (pathname '/income') has aria-current='page' on Income link", () => {
    (usePathname as jest.Mock).mockReturnValue("/income");
    render(<NavigationBar />);
    const incomeLink = screen.getByRole("link", { name: /income/i });
    expect(incomeLink).toHaveAttribute("aria-current", "page");
  });

  it("active link does NOT have aria-current='page' on inactive links", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<NavigationBar />);
    const incomeLink = screen.getByRole("link", { name: /income/i });
    const expensesLink = screen.getByRole("link", { name: /expenses/i });
    expect(incomeLink).not.toHaveAttribute("aria-current", "page");
    expect(expensesLink).not.toHaveAttribute("aria-current", "page");
  });
});
