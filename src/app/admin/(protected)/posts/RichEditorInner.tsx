"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useState } from "react";

export type MediaItem = { id: string; url: string; originalName: string };

type Props = {
  name: string;
  initialHtml?: string;
  media?: MediaItem[];
};

/* ─── tiny icon components (inline SVG, no extra dep) ─── */
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  bold: "M15.6 11.8c.9-.7 1.4-1.7 1.4-2.8C17 6.2 14.8 4 12 4H6v16h7c2.8 0 5-2.2 5-5 0-1.7-.9-3.3-2.4-4.2zM9 7h3c.8 0 1.5.7 1.5 1.5S12.8 10 12 10H9V7zm3.5 10H9v-3h3.5c.8 0 1.5.7 1.5 1.5S13.3 17 12.5 17z",
  italic: "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z",
  strike: "M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.87.77 1.36 1.94 1.36 3.2h-3.1c0-.59-.15-1.08-.45-1.44-.29-.36-.8-.56-1.46-.56-.45 0-.87.1-1.15.3-.28.19-.57.56-.57 1.18 0 .37.17.68.5.93.32.25.79.48 1.24.65.89.32 2.07.72 2.91 1.19M3 13h18v-2H3v2zm7.86 1.19c.65.27 1.27.58 1.7.9.43.32.64.77.64 1.35 0 .63-.24 1.06-.71 1.38-.48.32-1.08.48-1.77.48-1.3 0-2.48-.58-2.87-1.75H4.74c.14.98.65 1.93 1.52 2.66.87.73 2.16 1.13 3.74 1.13 1.57 0 2.84-.4 3.72-1.16.88-.76 1.28-1.72 1.28-2.79 0-.71-.16-1.32-.48-1.86l-3.66-.34z",
  h1: "M3 4h2v7h4V4h2v16H9v-7H5v7H3zm14 12h2v2h-6v-2h2v-7h-2v-2l4-1z",
  h2: "M3 4h2v7h4V4h2v16H9v-7H5v7H3zm11 14v-2h4v-2h-4v-2h2c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-4v2h4v2h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4z",
  h3: "M3 4h2v7h4V4h2v16H9v-7H5v7H3zm11 14v-2h2c1.1 0 2-.9 2-2v-1c0-.7-.6-1.3-1.3-1.5.7-.2 1.3-.8 1.3-1.5v-1c0-1.1-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.9 2-2z",
  ul: "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  ol: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-8v2h14V3H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",
  quote: "M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z",
  code: "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  unlink: "M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 3l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l2.97 2.97L19 18.69 3.27 3 2 4.27z",
  image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  undo: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z",
  redo: "M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z",
  divider: "",
};

type ToolbarButtonProps = {
  label: string;
  icon: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, icon, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors",
        "hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed",
        active ? "bg-zinc-200 text-black" : "text-zinc-600",
      ].join(" ")}
    >
      <Icon d={icon} />
      <span className="hidden sm:inline text-xs">{label}</span>
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px self-center bg-zinc-200" />;
}

export default function RichEditorInner({ name, initialHtml, media = [] }: Props) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [html, setHtml] = useState<string>(initialHtml ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: initialHtml || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc prose-headings:font-semibold max-w-none focus:outline-none min-h-[420px] px-5 py-4 text-[15px] leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-zinc-400">
        编辑器加载中…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <input type="hidden" name={name} value={html} readOnly />

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        {/* Text style */}
        <ToolbarButton label="粗体" icon={ICONS.bold} active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="斜体" icon={ICONS.italic} active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="删除线" icon={ICONS.strike} active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()} />

        <Divider />

        {/* Headings */}
        <ToolbarButton label="标题1" icon={ICONS.h1} active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarButton label="标题2" icon={ICONS.h2} active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="标题3" icon={ICONS.h3} active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

        <Divider />

        {/* Lists */}
        <ToolbarButton label="无序列表" icon={ICONS.ul} active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="有序列表" icon={ICONS.ol} active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="引用" icon={ICONS.quote} active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="代码块" icon={ICONS.code} active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} />

        <Divider />

        {/* Link */}
        <ToolbarButton
          label="插入链接"
          icon={ICONS.link}
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href ?? "";
            const url = window.prompt("链接地址 (URL)", prev);
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }
          }}
        />
        <ToolbarButton
          label="清除链接"
          icon={ICONS.unlink}
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        />

        <Divider />

        {/* Image from media library */}
        <ToolbarButton
          label="插入图片"
          icon={ICONS.image}
          onClick={() => setMediaOpen(true)}
        />

        {/* Spacer */}
        <span className="flex-1" />

        {/* Undo / Redo */}
        <ToolbarButton label="撤销" icon={ICONS.undo}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="重做" icon={ICONS.redo}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()} />
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />

      {/* ── Media picker modal ── */}
      {mediaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setMediaOpen(false)}
        >
          <div
            className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="font-semibold text-base">从媒体库选择图片</div>
              <button
                className="rounded-md px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
                onClick={() => setMediaOpen(false)}
              >
                关闭
              </button>
            </div>

            {/* modal body */}
            <div className="overflow-auto p-5">
              {media.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500">
                  还没有上传任何图片，请先前往{" "}
                  <a href="/admin/media" className="underline text-blue-600">
                    媒体库
                  </a>{" "}
                  上传。
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {media.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      title={m.originalName}
                      className="group rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden text-left transition hover:border-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
                      onClick={() => {
                        editor.chain().focus().setImage({ src: m.url, alt: m.originalName }).run();
                        setMediaOpen(false);
                      }}
                    >
                      <div className="relative aspect-square bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.originalName}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="px-2 py-1.5 text-xs text-zinc-600 truncate">
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
