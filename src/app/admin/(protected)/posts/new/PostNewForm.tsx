"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Toast } from "@/components/Toast";
import { RichEditorField } from "@/app/admin/(protected)/posts/RichEditorField";
import { CoverImagePicker } from "@/app/admin/(protected)/posts/CoverImagePicker";

interface Category { id: string; name: string }
interface MediaItem { id: string; originalName: string; url: string }

type ActionState = { ok: true } | { ok: false; error: string } | null;

interface Props {
  categories: Category[];
  media: MediaItem[];
  defaultSlug: string;
  createAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
}

export function PostNewForm({ categories, media, defaultSlug, createAction }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createAction, null);

  return (
    <>
      {state && !state.ok && (
        <Toast message={state.error} type="error" />
      )}

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">New post</h1>
            <p className="text-sm text-zinc-600">Write with the rich text editor and publish.</p>
          </div>
          <Link className="rounded-md border px-3 py-1.5 hover:bg-zinc-50" href="/admin/posts">
            Back
          </Link>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Title</span>
              <input className="w-full rounded-md border px-3 py-2" name="title" required />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Slug</span>
              <input
                className="w-full rounded-md border px-3 py-2"
                name="slug"
                defaultValue={defaultSlug}
              />
              <span className="block text-xs text-zinc-400">
                这是 URL 上的后缀，如 /posts/<span className="font-mono">{defaultSlug}</span>。留空将自动生成。
              </span>
            </label>
            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Excerpt (optional)</span>
              <input className="w-full rounded-md border px-3 py-2" name="excerpt" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">客户 / 伙伴 Client (optional)</span>
              <input className="w-full rounded-md border px-3 py-2" name="client" placeholder="如：Apple、某合作方" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">产品标签 Tags (optional, 逗号分隔)</span>
              <input className="w-full rounded-md border px-3 py-2" name="tags" placeholder="如：设计, 品牌, 包装" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-3 md:col-span-1">
              <div>
                <div className="text-sm font-semibold">Meta</div>
                <div className="text-xs text-zinc-600">Status, cover, categories</div>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">Status</span>
                <select className="w-full rounded-md border px-3 py-2" name="status" defaultValue="DRAFT">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </label>

              <CoverImagePicker media={media} />

              <div className="space-y-2">
                <div className="text-sm font-medium">Categories (min 1)</div>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="categoryIds" value={c.id} />
                      <span>{c.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-xs text-zinc-600">
                      No categories yet.{" "}
                      <Link className="underline" href="/admin/categories">Create one first.</Link>
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={pending}
                className="w-full rounded-md bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
              >
                {pending ? "创建中…" : "Create post"}
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="text-sm font-semibold">Content</div>
              <RichEditorField name="content" media={media} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
