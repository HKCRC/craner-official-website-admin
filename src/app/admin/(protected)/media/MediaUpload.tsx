"use client";

import { useRef, useState } from "react";

export function MediaUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "上传失败");
      return;
    }
    setFile(null);
    window.location.reload();
  }

  return (
    <div className="rounded-xl border bg-white p-5 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">上传媒体</h2>
        <p className="text-sm text-zinc-600">
          图片最大 5MB；MP4 / WebM 视频最大 50MB。
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,.mp4,.webm"
        className="sr-only"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setError(null);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>
          选择文件
        </button>
        {file ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-600">
            <span
              className="truncate font-medium text-zinc-800"
              title={file.name}
            >
              {file.name}
            </span>
            <span className="shrink-0 text-zinc-400">
              (
              {file.size >= 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                : `${(file.size / 1024).toFixed(1)} KB`}
              )
            </span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="shrink-0 text-xs text-zinc-500 underline underline-offset-2 hover:text-black"
            >
              清除
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 sm:pt-0.5">未选择文件</p>
        )}
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <button
        type="button"
        onClick={upload}
        disabled={!file || loading}
        className="rounded-md bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
      >
        {loading ? "上传中…" : "上传"}
      </button>
    </div>
  );
}
