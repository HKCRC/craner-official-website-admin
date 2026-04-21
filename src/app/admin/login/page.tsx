"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/admin", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Login failed");
      return;
    }
    window.location.href = next;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin login</h1>
          <p className="text-sm text-zinc-600">
            If you haven’t created a superadmin yet, go to{" "}
            <a className="underline" href="/admin/register">
              /admin/register
            </a>
            .
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Password</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

