"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { FeatureItem } from "@/types/product";

/* ── Types ── */
type Locale = "en" | "zh" | "zh-hk";
type MediaCarousel = { type: "carousel"; images: string[] };
type MediaVideo = { type: "video"; url: string };
type Media = MediaCarousel | MediaVideo;

interface FeaturedProduct {
  id: string;
  locale: Locale;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  productName: string;
  tags: string[];
  media: Media;
  featureList: FeatureItem[];
}

type DraftProduct = Omit<FeaturedProduct, "id"> & { id?: string };

function emptyProduct(order: number): DraftProduct {
  return {
    locale: "en",
    order,
    title: "",
    subtitle: "",
    description: "",
    productName: "",
    tags: [],
    media: { type: "carousel", images: [] },
    featureList: [],
  };
}

function parseFeatureList(raw: unknown): FeatureItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => {
    if (!x || typeof x !== "object") return { label: "", value: "" };
    const o = x as Record<string, unknown>;
    return { label: String(o.label ?? ""), value: String(o.value ?? "") };
  });
}

/* ── Main editor ── */
export default function FeaturedProductsEditor() {
  const [items, setItems] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/featured-products")
      .then((r) => r.json())
      .then(({ items }: { items?: Record<string, unknown>[] }) => {
        if (!items) return;
        setItems(
          items.map((it) => ({
            ...(it as unknown as FeaturedProduct),
            locale: (it.locale as Locale) ?? "en",
            featureList: parseFeatureList(it.featureList),
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function addNew() {
    const tempId = `new-${Date.now()}`;
    const draft = {
      ...emptyProduct(items.length),
      id: tempId,
    } as FeaturedProduct;
    setItems((prev) => [...prev, draft]);
    setExpandedId(tempId);
  }

  async function saveItem(draft: FeaturedProduct) {
    const isNew = draft.id.startsWith("new-");
    const url = isNew
      ? "/api/featured-products"
      : `/api/featured-products/${draft.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: draft.locale,
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        productName: draft.productName,
        tags: draft.tags,
        media: draft.media,
        featureList: draft.featureList,
        order: draft.order,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      const saved = json.item as Record<string, unknown>;
      const normalized: FeaturedProduct = {
        ...(saved as unknown as FeaturedProduct),
        locale: (saved.locale as Locale) ?? "en",
        featureList: parseFeatureList(saved.featureList),
      };
      setItems((prev) => prev.map((p) => (p.id === draft.id ? normalized : p)));
      setExpandedId(normalized.id);
    }
    return json.ok;
  }

  async function deleteItem(id: string) {
    if (id.startsWith("new-")) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    await fetch(`/api/featured-products/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function updateItem(id: string, patch: Partial<FeaturedProduct>) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-400">
          暂无产品，点击下方按钮添加
        </div>
      )}

      {items.map((item, idx) => (
        <ProductCard
          key={item.id}
          item={item}
          index={idx}
          expanded={expandedId === item.id}
          onToggle={() =>
            setExpandedId(expandedId === item.id ? null : item.id)
          }
          onChange={(patch) => updateItem(item.id, patch)}
          onSave={() => saveItem(item)}
          onDelete={() => deleteItem(item.id)}
        />
      ))}

      <button
        onClick={addNew}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-4 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-black"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        添加产品 / Add Product
      </button>
    </div>
  );
}

/* ── Product card ── */
function ProductCard({
  item,
  index,
  expanded,
  onToggle,
  onChange,
  onSave,
  onDelete,
}: {
  item: FeaturedProduct;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<FeaturedProduct>) => void;
  onSave: () => Promise<boolean>;
  onDelete: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSave() {
    setSaving(true);
    const ok = await onSave();
    setSaving(false);
    setSaveStatus(ok ? "success" : "error");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSaveStatus("idle"), 2500);
  }

  const isNew = item.id.startsWith("new-");

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-zinc-50 transition"
        onClick={onToggle}
      >
        <span className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {item.productName || item.title || (
              <span className="text-zinc-400 italic">未命名产品</span>
            )}
          </div>
          {item.title && item.productName && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-400 truncate">{item.title}</div>
              <span className="text-xs text-zinc-400 truncate">|</span>
              <div className="text-xs text-zinc-400 truncate">
                语言:{" "}
                {item.locale === "en"
                  ? "English"
                  : item.locale === "zh"
                    ? "中文"
                    : "繁体中文"}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.tags.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {item.tags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t px-5 py-5 space-y-5">
          {/* Basic fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="语言 Locale">
              <select
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={item.locale}
                onChange={(e) => onChange({ locale: e.target.value as Locale })}
              >
                <option value="en">en</option>
                <option value="zh">zh</option>
                <option value="zh-hk">zh-hk</option>
              </select>
            </Field>
            <Field label="产品名 Product Name">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={item.productName}
                onChange={(e) => onChange({ productName: e.target.value })}
                placeholder="产品名称"
              />
            </Field>
            <Field label="大标题 Title">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={item.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="展示标题"
              />
            </Field>
            <Field label="小标题 Subtitle">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={item.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="副标题"
              />
            </Field>
            <Field label="标签 Tags（逗号分隔）">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={item.tags.join(", ")}
                onChange={(e) =>
                  onChange({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="AI, 医疗, SaaS"
              />
            </Field>
            <Field label="描述 Description" className="md:col-span-2">
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                rows={3}
                value={item.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="产品简介"
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 space-y-3">
            <div>
              <div className="font-semibold text-sm">Feature list</div>
              <div className="text-xs text-zinc-500">
                e.g. &quot;AI 准确度&quot; /
                &quot;90%&quot;，将展示在精选产品特性区域
              </div>
            </div>
            <FeatureListEditor
              items={item.featureList}
              onChange={(featureList) => onChange({ featureList })}
            />
          </div>

          {/* Media section */}
          <MediaEditor
            media={item.media}
            onChange={(media) => onChange({ media })}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                if (confirm("确认删除？")) onDelete();
              }}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              删除 / Delete
            </button>
            <div className="flex items-center gap-3">
              {saveStatus === "success" && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ 已保存
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-sm text-red-600 font-medium">
                  保存失败
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? "保存中…" : isNew ? "创建" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureListEditor({
  items,
  onChange,
}: {
  items: FeatureItem[];
  onChange: (v: FeatureItem[]) => void;
}) {
  function update(index: number, field: keyof FeatureItem, val: string) {
    const next = items.map((row, i) =>
      i === index ? { ...row, [field]: val } : row,
    );
    onChange(next);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, { label: "", value: "" }]);
  }

  return (
    <div className="space-y-2">
      {items.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="标签 e.g. AI准确度"
            value={row.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <input
            className="w-32 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="数值 e.g. 90%"
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-700 px-1"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-zinc-500 hover:text-black underline underline-offset-2"
      >
        + 添加一行
      </button>
    </div>
  );
}

/* ── Media editor ── */
function MediaEditor({
  media,
  onChange,
}: {
  media: Media;
  onChange: (m: Media) => void;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.ok ? json.media.url : null;
  }

  async function handleImageUpload(idx: number, file: File) {
    setUploadingIdx(idx);
    const url = await uploadImage(file);
    if (url && media.type === "carousel") {
      const images = [...media.images];
      if (idx === images.length) images.push(url);
      else images[idx] = url;
      onChange({ type: "carousel", images });
    }
    setUploadingIdx(null);
  }

  async function handleVideoUpload(file: File) {
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.ok) onChange({ type: "video", url: json.media.url });
    setUploadingVideo(false);
  }

  function removeImage(idx: number) {
    if (media.type !== "carousel") return;
    onChange({
      type: "carousel",
      images: media.images.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">媒体 / Media</span>
        <div className="flex gap-1 rounded-lg border p-0.5">
          <button
            type="button"
            onClick={() => onChange({ type: "carousel", images: [] })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${media.type === "carousel" ? "bg-black text-white" : "text-zinc-500 hover:text-black"}`}
          >
            轮播图 Carousel
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: "video", url: "" })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${media.type === "video" ? "bg-black text-white" : "text-zinc-500 hover:text-black"}`}
          >
            视频 Video
          </button>
        </div>
      </div>

      {/* Carousel */}
      {media.type === "carousel" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.images.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border bg-zinc-100 group"
              >
                <Image
                  src={url}
                  alt={`image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 hidden group-hover:flex w-6 h-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            ))}
            {/* Upload slot */}
            <label
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs transition ${uploadingIdx === media.images.length ? "opacity-50 pointer-events-none border-zinc-300 text-zinc-300" : "border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"}`}
            >
              {uploadingIdx === media.images.length ? (
                <span>上传中…</span>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span>添加图片</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploadingIdx !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(media.images.length, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {media.images.length === 0 && (
            <p className="text-xs text-zinc-400">
              点击「添加图片」上传轮播图（支持多张）
            </p>
          )}
        </div>
      )}

      {/* Video */}
      {media.type === "video" && (
        <div className="space-y-3">
          <Field label="视频地址 Video URL（填入链接或上传）">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              value={media.url}
              onChange={(e) => onChange({ type: "video", url: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </Field>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">— 或 —</span>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-xs transition ${uploadingVideo ? "opacity-50 pointer-events-none border-zinc-200 text-zinc-300" : "border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
              {uploadingVideo ? "上传中…" : "上传视频文件"}
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                disabled={uploadingVideo}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVideoUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
            {media.url && (
              <span className="text-xs text-zinc-500 truncate max-w-xs">
                {media.url}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared UI ── */
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
