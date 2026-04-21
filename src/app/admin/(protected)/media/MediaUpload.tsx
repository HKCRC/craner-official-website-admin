"use client";

import { useState } from "react";

export function MediaUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Upload failed");
      return;
    }
    setFile(null);
    window.location.reload();
  }

  return (
    <div className="rounded-xl border bg-white p-5 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Upload image</h2>
        <p className="text-sm text-zinc-600">Max size 5MB. Images only.</p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <button
        onClick={upload}
        disabled={!file || loading}
        className="rounded-md bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

