"use client";

import { useState } from "react";

export default function AdminRegisterPage() {
  const [accessKey, setAccessKey] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/superadmin-register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        accessKey,
        email,
        password,
        name: name || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Register failed");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl text-black font-semibold">
            Bootstrap superadmin
          </h1>
          <p className="text-sm text-zinc-600">
            This route is protected by an{" "}
            <span className="font-medium">accessKey</span>.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Access key</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              type="password"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Name (optional)</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Password</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create superadmin"}
          </button>
        </form>
      </div>
    </div>
  );
}
