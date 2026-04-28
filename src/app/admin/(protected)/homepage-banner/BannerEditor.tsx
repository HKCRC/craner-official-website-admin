"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Locale = "en" | "zh" | "zh-hk";
type Template = "CAROUSEL" | "VIDEO";

interface CarouselSlide {
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
}

interface CarouselContent {
  slides: CarouselSlide[];
}

interface VideoContent {
  title: string;
  subtitle: string;
  videoUrl: string;
  link?: string;
}

type BannerContent = CarouselContent | VideoContent;

interface BannerData {
  locale: Locale;
  template: Template;
  content: BannerContent;
}

const LOCALES: { key: Locale; label: string }[] = [
  { key: "en", label: "Index - EN" },
  { key: "zh", label: "首页 - 简中" },
  { key: "zh-hk", label: "首頁 - 繁中" },
];

const emptyCarousel = (): CarouselContent => ({ slides: [] });
const emptyVideo = (): VideoContent => ({
  title: "",
  subtitle: "",
  videoUrl: "",
});

function isVideoContent(c: BannerContent): c is VideoContent {
  return "videoUrl" in c;
}

function isCarouselContent(c: BannerContent): c is CarouselContent {
  return "slides" in c;
}

function defaultContent(template: Template): BannerContent {
  return template === "CAROUSEL" ? emptyCarousel() : emptyVideo();
}

export default function BannerEditor() {
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [data, setData] = useState<Record<Locale, BannerData>>({
    en: { locale: "en", template: "CAROUSEL", content: emptyCarousel() },
    zh: {
      locale: "zh",
      template: "CAROUSEL",
      content: emptyCarousel(),
    },
    "zh-hk": {
      locale: "zh-hk",
      template: "CAROUSEL",
      content: emptyCarousel(),
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/homepage-banner", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw new Error(text || `Request failed (${r.status})`);
        }
        return r.json();
      })
      .then(({ banners }: { banners: BannerData[] }) => {
        if (!banners) return;
        setData((prev) => {
          const next = { ...prev };
          for (const b of banners) {
            next[b.locale] = b;
          }
          return next;
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const current = data[activeLocale];

  const updateCurrent = useCallback(
    (patch: Partial<BannerData>) => {
      setData((prev) => ({
        ...prev,
        [activeLocale]: { ...prev[activeLocale], ...patch },
      }));
    },
    [activeLocale],
  );

  function setTemplate(template: Template) {
    updateCurrent({ template, content: defaultContent(template) });
  }

  /* ── Carousel helpers ── */
  function addSlide() {
    if (!isCarouselContent(current.content)) return;
    updateCurrent({
      content: {
        slides: [
          ...current.content.slides,
        { title: "", subtitle: "", imageUrl: "", link: "" },
        ],
      },
    });
  }

  function removeSlide(idx: number) {
    if (!isCarouselContent(current.content)) return;
    const slides = current.content.slides.filter((_, i) => i !== idx);
    updateCurrent({ content: { slides } });
  }

  function patchSlide(idx: number, patch: Partial<CarouselSlide>) {
    if (!isCarouselContent(current.content)) return;
    const slides = current.content.slides.map((s, i) =>
      i === idx ? { ...s, ...patch } : s,
    );
    updateCurrent({ content: { slides } });
  }

  async function uploadSlideImage(idx: number, file: File) {
    setUploadingIndex(idx);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.ok) patchSlide(idx, { imageUrl: json.media.url });
    } finally {
      setUploadingIndex(null);
    }
  }

  /* ── Video helpers ── */
  function patchVideo(patch: Partial<VideoContent>) {
    if (!isVideoContent(current.content)) return;
    updateCurrent({ content: { ...current.content, ...patch } });
  }

  /* ── Save ── */
  async function save() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/homepage-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      setSaveStatus(res.ok ? "success" : "error");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Language tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveLocale(key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${
              activeLocale === key
                ? "bg-white border border-b-white border-zinc-200 -mb-px text-black"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Template selector */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-700">
          选择模版 / Template
        </h2>
        <div className="flex gap-3">
          <TemplateCard
            active={current.template === "CAROUSEL"}
            onClick={() => setTemplate("CAROUSEL")}
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1 5h2v14H1V5zm4 0h2v14H5V5zm16 0H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-1 12H10V7h10v10z" />
              </svg>
            }
            title="轮播图 Carousel"
            desc="多张图片 + 大标题 + 小标题"
          />
          <TemplateCard
            active={current.template === "VIDEO"}
            onClick={() => setTemplate("VIDEO")}
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            }
            title="视频 Video"
            desc="单一视频 + 大标题 + 小标题"
          />
        </div>
      </div>

      {/* Content editor */}
      {current.template === "CAROUSEL" &&
        isCarouselContent(current.content) && (
          <CarouselEditor
            slides={current.content.slides}
            uploadingIndex={uploadingIndex}
            onAdd={addSlide}
            onRemove={removeSlide}
            onPatch={patchSlide}
            onUpload={uploadSlideImage}
          />
        )}

      {current.template === "VIDEO" && isVideoContent(current.content) && (
        <VideoEditor content={current.content} onPatch={patchVideo} />
      )}

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存 Save"}
        </button>
        {saveStatus === "success" && (
          <span className="text-sm text-green-600 font-medium">✓ 已保存</span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-red-600 font-medium">
            保存失败，请重试
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Template card ── */
function TemplateCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition ${
        active
          ? "border-black bg-zinc-50 text-black"
          : "border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"
      }`}
    >
      {icon}
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-zinc-500">{desc}</div>
    </button>
  );
}

/* ── Carousel editor ── */
function CarouselEditor({
  slides,
  uploadingIndex,
  onAdd,
  onRemove,
  onPatch,
  onUpload,
}: {
  slides: CarouselSlide[];
  uploadingIndex: number | null;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onPatch: (i: number, p: Partial<CarouselSlide>) => void;
  onUpload: (i: number, f: File) => void;
}) {
  return (
    <div className="space-y-4">
      {slides.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-400">
          暂无轮播项，点击下方按钮添加
        </div>
      )}
      {slides.map((slide, idx) => (
        <div key={idx} className="rounded-xl border bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-600">
              第 {idx + 1} 张 / Slide {idx + 1}
            </span>
            <button
              onClick={() => onRemove(idx)}
              className="text-xs text-red-500 hover:text-red-700 transition"
            >
              删除 / Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">
                大标题 Title
              </label>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={slide.title}
                onChange={(e) => onPatch(idx, { title: e.target.value })}
                placeholder="Banner 大标题"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">
                小标题 Subtitle
              </label>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={slide.subtitle}
                onChange={(e) => onPatch(idx, { subtitle: e.target.value })}
                placeholder="Banner 小标题"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-medium">
              点击跳转链接 Link（可选）
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              value={slide.link ?? ""}
              onChange={(e) => onPatch(idx, { link: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-medium">
              图片 Image
            </label>
            {slide.imageUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-40 overflow-hidden rounded-lg border bg-zinc-100">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || "banner"}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => onPatch(idx, { imageUrl: "" })}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  移除图片
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition">
                {uploadingIndex === idx ? (
                  <span>上传中…</span>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                    </svg>
                    <span>点击上传图片 / Upload image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingIndex !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(idx, f);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-4 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-black"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        添加轮播项 / Add slide
      </button>
    </div>
  );
}

/* ── Video editor ── */
function VideoEditor({
  content,
  onPatch,
}: {
  content: VideoContent;
  onPatch: (p: Partial<VideoContent>) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <h2 className="text-base font-semibold text-zinc-700">
        视频配置 / Video Config
      </h2>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 font-medium">
          大标题 Title
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={content.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="视频 Banner 大标题"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 font-medium">
          小标题 Subtitle
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={content.subtitle}
          onChange={(e) => onPatch({ subtitle: e.target.value })}
          placeholder="视频 Banner 小标题"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 font-medium">
          视频链接 Video URL
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={content.videoUrl}
          onChange={(e) => onPatch({ videoUrl: e.target.value })}
          placeholder="https://example.com/video.mp4"
        />
        <p className="text-xs text-zinc-400">
          支持 MP4 / YouTube embed / Vimeo embed 链接
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 font-medium">
          点击跳转链接 Link（可选）
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={content.link ?? ""}
          onChange={(e) => onPatch({ link: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      {content.videoUrl && (
        <div className="rounded-lg border bg-zinc-50 p-3 text-xs text-zinc-500 break-all">
          预览链接: {content.videoUrl}
        </div>
      )}
    </div>
  );
}
