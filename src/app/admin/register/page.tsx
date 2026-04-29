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
      setError(data?.error ?? "注册失败");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl text-black font-semibold">
            创建超级管理员
          </h1>
          <p className="text-sm text-zinc-600">
            此页面需填写与服务器环境变量{" "}
            <span className="font-mono text-xs">SUPERADMIN_ACCESS_KEY</span>{" "}
            一致的访问密钥。
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">访问密钥</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              type="password"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">姓名（选填）</span>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">密码</span>
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
            {loading ? "创建中…" : "创建超级管理员"}
          </button>
        </form>
      </div>
    </div>
  );
}
