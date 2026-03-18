"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password, next: nextPath }),
        });

        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(json?.error ?? "Login failed");
          return;
        }

        const json = (await res.json()) as { redirectTo?: string };
        router.replace(json.redirectTo ?? nextPath ?? "/");
        router.refresh();
      } catch {
        setError("Login failed");
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white border border-border rounded-2xl shadow-sm p-6">
        <h1 className="text-[22px] font-bold text-text-primary">כניסת אדמין</h1>
        <p className="mt-1 text-[13px] text-text-muted">הזיני סיסמה כדי להמשיך.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <span className="block text-[13px] font-medium text-text-primary mb-2">סיסמה</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-11 px-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
          >
            {isPending ? "בודקת…" : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}

