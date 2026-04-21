"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Toast } from "@/components/Toast";
import { RichEditorField } from "@/app/admin/(protected)/posts/RichEditorField";
import { CoverImagePicker } from "@/app/admin/(protected)/posts/CoverImagePicker";

interface Category { id: string; name: string }
interface MediaItem { id: string; originalName: string; url: string }
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: string | null;
  tags: string[];
  status: string;
  coverMediaId: string | null;
  categories: { id: string }[];
}

type ActionState = { ok: true } | { ok: false; error: string } | null;

interface Props {
  post: Post;
  categories: Category[];
  media: MediaItem[];
  initialHtml: string;
  updateAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: () => Promise<void>;
}

export function PostEditForm({ post, categories, media, initialHtml, updateAction, deleteAction }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateAction, null);
  const selected = new Set(post.categories.map((c) => c.id));

  // key changes on each success so Toast remounts and re-animates
  const toastKey = useRef(0);
  if (state?.ok) toastKey.current += 1;

  return (
    <>
      {state?.ok && (
        <Toast key={toastKey.current} message="保存成功 ✓" type="success" />
      )}
      {state && !state.ok && (
        <Toast key={state.error} message={state.error} type="error" />
      )}

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">Edit post</h1>
            <p className="text-sm text-zinc-600">{post.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="rounded-md border px-3 py-1.5 hover:bg-zinc-50" href="/admin/posts">
              Back
            </Link>
            <form action={deleteAction}>
              <button className="rounded-md border px-3 py-1.5 hover:bg-zinc-50 text-red-700 border-red-200">
                Delete
              </button>
            </form>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Title</span>
              <input className="w-full rounded-md border px-3 py-2" name="title" defaultValue={post.title} required />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Slug</span>
              <input className="w-full rounded-md border px-3 py-2" name="slug" defaultValue={post.slug} required />
            </label>
            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Excerpt (optional)</span>
              <input className="w-full rounded-md border px-3 py-2" name="excerpt" defaultValue={post.excerpt ?? ""} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">客户 / 伙伴 Client (optional)</span>
              <input className="w-full rounded-md border px-3 py-2" name="client" defaultValue={post.client ?? ""} placeholder="如：Apple、某合作方" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">产品标签 Tags (optional, 逗号分隔)</span>
              <input className="w-full rounded-md border px-3 py-2" name="tags" defaultValue={post.tags?.join(", ") ?? ""} placeholder="如：设计, 品牌, 包装" />
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
                <select className="w-full rounded-md border px-3 py-2" name="status" defaultValue={post.status}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </label>

              <CoverImagePicker media={media} defaultMediaId={post.coverMediaId ?? ""} />

              <div className="space-y-2">
                <div className="text-sm font-medium">Categories (min 1)</div>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={selected.has(c.id)} />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={pending}
                className="w-full rounded-md bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
              >
                {pending ? "保存中…" : "Save"}
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="text-sm font-semibold">Content</div>
              <RichEditorField name="content" initialHtml={initialHtml} media={media} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
