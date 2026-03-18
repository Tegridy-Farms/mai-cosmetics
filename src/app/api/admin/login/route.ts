import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

const AUTH_COOKIE_NAME = "admin_auth";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export async function POST(req: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return NextResponse.json(
      { error: "Missing ADMIN_PASSWORD env var" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { password?: string; next?: string }
    | null;
  const password = body?.password ?? "";
  const nextPath = typeof body?.next === "string" ? body.next : "/";

  if (!password || password !== configuredPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const hash = sha256Hex(configuredPassword);
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });

  return NextResponse.json({ redirectTo: nextPath });
}

