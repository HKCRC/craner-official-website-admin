"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MediaItem {
  id: string;
  originalName: string;
  url: string;
}

interface Props {
  media: MediaItem[];
  defaultMediaId?: string;
}

export function CoverImagePicker({ media: initialMedia, defaultMediaId = "" }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [selectedId, setSelectedId] = useState(defaultMediaId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = mediaList.find((m) => m.id === selectedId) ?? null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Upload failed");
        return;
      }
      const newItem: MediaItem = {
        id: json.media.id,
        originalName: file.name,
        url: json.media.url,
      };
      setMediaList((prev) => [newItem, ...prev]);
      setSelectedId(newItem.id);
      setShowPicker(false);
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clear() {
    setSelectedId("");
    setShowPicker(false);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">头图 Cover image (optional)</span>

      {/* hidden input that actually submits the value */}
      <input type="hidden" name="coverMediaId" value={selectedId} />

      {selected ? (
        <div className="space-y-2">
          <div className="relative h-36 w-full overflow-hidden rounded-lg border bg-zinc-100">
            <Image src={selected.url} alt={selected.originalName} fill className="object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-zinc-50 transition"
            >
              更换 / Change
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
            >
              移除 / Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-5 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
          选择或上传头图
        </button>
      )}

      {/* Picker panel */}
      {showPicker && (
        <div className="rounded-xl border bg-white shadow-lg p-4 space-y-4">
          {/* Upload zone */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-2">上传新图片</p>
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm transition ${uploading ? "opacity-50 pointer-events-none" : "hover:border-zinc-400 hover:text-zinc-600 text-zinc-400"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
              {uploading ? "上传中…" : "点击上传图片（最大 5MB）"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
          </div>

          {/* Media library grid */}
          {mediaList.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-2">从媒体库选择</p>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {mediaList.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelectedId(m.id); setShowPicker(false); }}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                      selectedId === m.id
                        ? "border-black"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                  >
                    <Image src={m.url} alt={m.originalName} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
