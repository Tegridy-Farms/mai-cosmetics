import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "admin_auth";

export async function POST() {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}

