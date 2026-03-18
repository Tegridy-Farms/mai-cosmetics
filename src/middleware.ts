import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "admin_auth";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isAllowedPath(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/site.webmanifest") return true;
  if (pathname === "/login") return true;
  if (pathname === "/api/admin/login") return true;
  if (pathname === "/api/admin/logout") return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isAllowedPath(pathname)) return NextResponse.next();

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return new NextResponse("Missing ADMIN_PASSWORD env var", { status: 500 });
  }

  const expectedHash = await sha256Hex(configuredPassword);
  const cookieHash = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (cookieHash && cookieHash === expectedHash) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

