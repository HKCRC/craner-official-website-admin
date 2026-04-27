"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  url: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function MediaItemCard({ id, url, originalName, sizeBytes, mimeType }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isVideo = mimeType.startsWith("video/");

  async function copyUrl() {
    const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy");
      setTimeout(() => setError(null), 2000);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${originalName}”?`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Delete failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="relative aspect-square bg-zinc-100">
        {isVideo ? (
          <video src={url} className="h-full w-full object-cover" muted playsInline controls />
        ) : (
          <Image src={url} alt={originalName} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="truncate text-sm font-medium" title={originalName}>
          {originalName}
        </div>
        <div className="text-xs text-zinc-600">{formatSize(sizeBytes)}</div>
        {error ? <div className="text-xs text-red-600">{error}</div> : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
