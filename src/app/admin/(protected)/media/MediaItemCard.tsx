"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const manualCopyInputRef = useRef<HTMLInputElement>(null);
  const isVideo = mimeType.startsWith("video/");

  async function copyUrl() {
    const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    try {
      setError(null);
      setManualCopyOpen(false);

      // Clipboard API usually requires HTTPS (or localhost). Provide manual fallback on failure.
      const canClipboard =
        typeof navigator !== "undefined" &&
        typeof window !== "undefined" &&
        !!navigator.clipboard?.writeText &&
        window.isSecureContext;

      if (canClipboard) {
        await navigator.clipboard.writeText(absolute);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      throw new Error("clipboard-unavailable");
    } catch {
      setManualCopyOpen(true);
      setTimeout(() => {
        manualCopyInputRef.current?.focus();
        manualCopyInputRef.current?.select();
      }, 0);
    }
  }

  async function remove() {
    if (!window.confirm(`确定删除「${originalName}」？`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "删除失败");
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
            {copied ? "已复制" : "复制链接"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            {busy ? "删除中…" : "删除"}
          </button>
        </div>

        {manualCopyOpen ? (
          <div className="rounded-lg border bg-zinc-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-zinc-600">
                当前环境无法自动复制，请手动复制：
              </div>
              <button
                type="button"
                className="text-[11px] text-zinc-600 underline underline-offset-2 hover:text-black"
                onClick={() => setManualCopyOpen(false)}
              >
                关闭
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                ref={manualCopyInputRef}
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}${url}` : url}
                className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1 text-[11px] text-zinc-800"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                className="shrink-0 rounded-md border bg-white px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-100"
                onClick={() => {
                  manualCopyInputRef.current?.focus();
                  manualCopyInputRef.current?.select();
                }}
              >
                全选
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
