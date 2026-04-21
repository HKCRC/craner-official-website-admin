"use client";

import { useCallback, useRef, useState } from "react";
import type {
  BlockImage,
  BlockText,
  FeatureItem,
  FullImageBlock,
  ImageImageBlock,
  ProductBlock,
  QaBlock,
  TextImageBlock,
} from "@/types/product";

// ─── helpers ────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ─── sub-components ─────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      {multiline ? (
        <textarea
          className={cls}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={cls}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ImageFields({
  img,
  onChange,
  label = "Image",
  mediaItems,
}: {
  img: BlockImage;
  onChange: (v: BlockImage) => void;
  label?: string;
  mediaItems: MediaItem[];
}) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      {img.url && (
        <div className="rounded-lg overflow-hidden border bg-zinc-50 aspect-video flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            className="max-h-32 max-w-full object-contain"
          />
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          placeholder="图片 URL"
          value={img.url}
          onChange={(e) => onChange({ ...img, url: e.target.value })}
        />
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs hover:bg-zinc-100"
          onClick={() => setPicking(true)}
        >
          从媒体库选
        </button>
      </div>
      <input
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        placeholder="点击跳转链接（可选）"
        value={img.link ?? ""}
        onChange={(e) =>
          onChange({ ...img, link: e.target.value || undefined })
        }
      />

      {/* media picker */}
      {picking && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setPicking(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "75vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="font-semibold">从媒体库选择图片</div>
              <button
                className="text-sm text-zinc-500 hover:text-black"
                onClick={() => setPicking(false)}
              >
                关闭
              </button>
            </div>
            <div className="overflow-auto p-4">
              {mediaItems.length === 0 ? (
                <p className="text-sm text-zinc-500 py-8 text-center">
                  暂无图片，请先前往媒体库上传。
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      className="group rounded-xl border overflow-hidden text-left hover:border-black hover:shadow"
                      onClick={() => {
                        onChange({ ...img, url: m.url });
                        setPicking(false);
                      }}
                    >
                      <div className="aspect-square bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.originalName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-2 text-xs truncate text-zinc-500">
                        {m.originalName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextFields({
  text,
  onChange,
}: {
  text: BlockText;
  onChange: (v: BlockText) => void;
}) {
  return (
    <div className="space-y-2">
      <Field
        label="大标题"
        value={text.heading ?? ""}
        placeholder="大标题（可选）"
        onChange={(v) => onChange({ ...text, heading: v })}
      />
      <Field
        label="小标题"
        value={text.subheading ?? ""}
        placeholder="小标题（可选）"
        onChange={(v) => onChange({ ...text, subheading: v })}
      />
      <Field
        label="描述"
        value={text.description ?? ""}
        placeholder="正文描述（可选）"
        multiline
        onChange={(v) => onChange({ ...text, description: v })}
      />
    </div>
  );
}

// ─── Block card wrappers ─────────────────────────────────────────────────────

function BlockCard({
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: {
  index: number;
  total: number;
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      {/* block header */}
      <div className="flex items-center justify-between bg-white border-b border-zinc-200 px-4 py-2.5">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded px-2 py-1 text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-30"
            title="上移"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="rounded px-2 py-1 text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-30"
            title="下移"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded px-2 py-1 text-red-400 hover:text-red-700 hover:bg-red-50"
            title="删除此模块"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Block editors ───────────────────────────────────────────────────────────

function TextImageEditor({
  block,
  onChange,
  mediaItems,
}: {
  block: TextImageBlock;
  onChange: (b: TextImageBlock) => void;
  mediaItems: MediaItem[];
}) {
  const isTextLeft = block.layout === "text-left";
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-zinc-600">布局：</span>
        <select
          className="rounded-lg border border-zinc-200 px-2 py-1 text-sm"
          value={block.layout}
          onChange={(e) =>
            onChange({
              ...block,
              layout: e.target.value as TextImageBlock["layout"],
            })
          }
        >
          <option value="text-left">文字在左，图片在右</option>
          <option value="image-left">图片在左，文字在右</option>
        </select>
      </label>
      <div className={`grid grid-cols-2 gap-4 ${isTextLeft ? "" : "direction-rtl"}`}>
        <div className={isTextLeft ? "" : "order-2"}>
          <TextFields
            text={block.text}
            onChange={(t) => onChange({ ...block, text: t })}
          />
        </div>
        <div className={isTextLeft ? "" : "order-1"}>
          <ImageFields
            img={block.image}
            onChange={(i) => onChange({ ...block, image: i })}
            mediaItems={mediaItems}
          />
        </div>
      </div>
    </div>
  );
}

function ImageImageEditor({
  block,
  onChange,
  mediaItems,
}: {
  block: ImageImageBlock;
  onChange: (b: ImageImageBlock) => void;
  mediaItems: MediaItem[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ImageFields
        label="左侧图片"
        img={block.left}
        onChange={(v) => onChange({ ...block, left: v })}
        mediaItems={mediaItems}
      />
      <ImageFields
        label="右侧图片"
        img={block.right}
        onChange={(v) => onChange({ ...block, right: v })}
        mediaItems={mediaItems}
      />
    </div>
  );
}

function FullImageEditor({
  block,
  onChange,
  mediaItems,
}: {
  block: FullImageBlock;
  onChange: (b: FullImageBlock) => void;
  mediaItems: MediaItem[];
}) {
  return (
    <ImageFields
      label="全宽图片"
      img={block.image}
      onChange={(v) => onChange({ ...block, image: v })}
      mediaItems={mediaItems}
    />
  );
}

function QaEditor({
  block,
  onChange,
}: {
  block: QaBlock;
  onChange: (b: QaBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <Field
        label="问题 Q"
        value={block.question}
        placeholder="输入问题"
        onChange={(v) => onChange({ ...block, question: v })}
      />
      <Field
        label="回答 A"
        value={block.answer}
        placeholder="输入回答"
        multiline
        onChange={(v) => onChange({ ...block, answer: v })}
      />
    </div>
  );
}

// ─── Template picker ─────────────────────────────────────────────────────────

const TEMPLATES: { key: ProductBlock["type"]; label: string; desc: string; icon: string }[] = [
  {
    key: "text-image",
    label: "文字 + 图片",
    desc: "50/50 左右布局，文字三字段 + 图片",
    icon: "▤",
  },
  {
    key: "image-image",
    label: "图片 + 图片",
    desc: "50/50 左右两张图片",
    icon: "▥",
  },
  {
    key: "full-image",
    label: "全宽图片",
    desc: "100% 宽度大图",
    icon: "▬",
  },
  {
    key: "qa",
    label: "Q&A",
    desc: "一组问题与回答",
    icon: "❓",
  },
];

function makeBlock(type: ProductBlock["type"]): ProductBlock {
  const id = uid();
  if (type === "text-image")
    return { id, type, layout: "text-left", text: {}, image: { url: "" } };
  if (type === "image-image")
    return { id, type, left: { url: "" }, right: { url: "" } };
  if (type === "full-image") return { id, type, image: { url: "" } };
  return { id, type, question: "", answer: "" };
}

// ─── Feature list editor ─────────────────────────────────────────────────────

function FeatureListEditor({
  items,
  onChange,
}: {
  items: FeatureItem[];
  onChange: (v: FeatureItem[]) => void;
}) {
  function update(index: number, field: keyof FeatureItem, val: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
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
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="标签 e.g. AI准确度"
            value={item.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <input
            className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="数值 e.g. 90%"
            value={item.value}
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

// ─── Main BlockEditor ─────────────────────────────────────────────────────────

export type MediaItem = { id: string; url: string; originalName: string };

interface Props {
  initialBlocks?: ProductBlock[];
  initialFeatureList?: FeatureItem[];
  mediaItems: MediaItem[];
  /** hidden input names */
  blocksName?: string;
  featureListName?: string;
}

export function BlockEditor({
  initialBlocks = [],
  initialFeatureList = [],
  mediaItems,
  blocksName = "blocks",
  featureListName = "featureList",
}: Props) {
  const [blocks, setBlocks] = useState<ProductBlock[]>(initialBlocks);
  const [features, setFeatures] = useState<FeatureItem[]>(initialFeatureList);
  const previewRef = useRef<HTMLDivElement>(null);

  const addBlock = useCallback((type: ProductBlock["type"]) => {
    setBlocks((prev) => [...prev, makeBlock(type)]);
    setTimeout(
      () =>
        previewRef.current?.lastElementChild?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50
    );
  }, []);

  const updateBlock = useCallback((index: number, block: ProductBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)));
  }, []);

  const deleteBlock = useCallback((index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveBlock = useCallback((index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = clamp(index + dir, 0, next.length - 1);
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* ── hidden serialised values ── */}
      <input
        type="hidden"
        name={blocksName}
        value={JSON.stringify(blocks)}
        readOnly
      />
      <input
        type="hidden"
        name={featureListName}
        value={JSON.stringify(features)}
        readOnly
      />

      {/* ── Feature list section ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
        <div>
          <div className="font-semibold text-sm">Feature List</div>
          <div className="text-xs text-zinc-500">
            e.g. &quot;AI 准确度&quot; / &quot;90%&quot;，将展示在产品页特性区域
          </div>
        </div>
        <FeatureListEditor items={features} onChange={setFeatures} />
      </div>

      {/* ── Template palette ── */}
      <div className="space-y-3">
        <div className="font-semibold text-sm">内容模块 — 点击模板添加到下方</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => addBlock(t.key)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-4 py-5 text-center transition hover:border-zinc-700 hover:bg-zinc-50 active:scale-95"
            >
              <span className="text-3xl">{t.icon}</span>
              <span className="text-sm font-semibold">{t.label}</span>
              <span className="text-xs text-zinc-500 leading-snug">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Block list (preview + edit inline) ── */}
      {blocks.length > 0 && (
        <div className="space-y-4" ref={previewRef}>
          <div className="font-semibold text-sm">
            已添加模块（{blocks.length}）
          </div>
          {blocks.map((block, index) => {
            const label =
              TEMPLATES.find((t) => t.key === block.type)?.label ?? block.type;

            return (
              <BlockCard
                key={block.id}
                index={index}
                total={blocks.length}
                label={`#${index + 1} ${label}`}
                onMoveUp={() => moveBlock(index, -1)}
                onMoveDown={() => moveBlock(index, 1)}
                onDelete={() => deleteBlock(index)}
              >
                {/* preview strip */}
                <BlockPreview block={block} />

                {/* inline editor */}
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  {block.type === "text-image" && (
                    <TextImageEditor
                      block={block}
                      onChange={(b) => updateBlock(index, b)}
                      mediaItems={mediaItems}
                    />
                  )}
                  {block.type === "image-image" && (
                    <ImageImageEditor
                      block={block}
                      onChange={(b) => updateBlock(index, b)}
                      mediaItems={mediaItems}
                    />
                  )}
                  {block.type === "full-image" && (
                    <FullImageEditor
                      block={block}
                      onChange={(b) => updateBlock(index, b)}
                      mediaItems={mediaItems}
                    />
                  )}
                  {block.type === "qa" && (
                    <QaEditor
                      block={block}
                      onChange={(b) => updateBlock(index, b)}
                    />
                  )}
                </div>
              </BlockCard>
            );
          })}
        </div>
      )}

      {blocks.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
          还没有内容模块，点击上方模板添加
        </div>
      )}
    </div>
  );
}

// ─── Compact preview strip inside each card ──────────────────────────────────

function BlockPreview({ block }: { block: ProductBlock }) {
  if (block.type === "text-image") {
    const isTextLeft = block.layout === "text-left";
    return (
      <div
        className={`flex gap-3 rounded-xl bg-white border border-zinc-100 p-3 text-xs ${
          isTextLeft ? "" : "flex-row-reverse"
        }`}
      >
        <div className="flex-1 space-y-1">
          {block.text.heading && (
            <p className="font-bold text-sm truncate">{block.text.heading}</p>
          )}
          {block.text.subheading && (
            <p className="font-medium text-zinc-600 truncate">
              {block.text.subheading}
            </p>
          )}
          {block.text.description && (
            <p className="text-zinc-400 line-clamp-2">{block.text.description}</p>
          )}
          {!block.text.heading &&
            !block.text.subheading &&
            !block.text.description && (
              <p className="text-zinc-300 italic">文字待填写…</p>
            )}
        </div>
        <div className="w-24 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
          {block.image.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.image.url}
              alt=""
              className="h-16 w-24 object-cover"
            />
          ) : (
            <span className="text-zinc-300 text-xs">图片</span>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "image-image") {
    return (
      <div className="flex gap-3 rounded-xl bg-white border border-zinc-100 p-3">
        {[block.left, block.right].map((img, i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-zinc-100 h-20 flex items-center justify-center overflow-hidden"
          >
            {img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-zinc-300 text-xs">图片</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "full-image") {
    return (
      <div className="rounded-xl bg-white border border-zinc-100 p-3">
        <div className="w-full h-20 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
          {block.image.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.image.url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-zinc-300 text-xs">全宽图片</span>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "qa") {
    return (
      <div className="rounded-xl bg-white border border-zinc-100 p-3 text-xs space-y-1">
        <p className="font-semibold truncate">
          Q: {block.question || <span className="text-zinc-300 italic">问题待填写</span>}
        </p>
        <p className="text-zinc-500 line-clamp-2">
          A: {block.answer || <span className="text-zinc-300 italic">回答待填写</span>}
        </p>
      </div>
    );
  }

  return null;
}
