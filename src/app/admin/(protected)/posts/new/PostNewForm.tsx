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
            <h1 className="text-2xl font-semibold">新建文章</h1>
            <p className="text-sm text-zinc-600">使用富文本编辑器撰写并发布。</p>
          </div>
          <Link className="rounded-md border px-3 py-1.5 hover:bg-zinc-50" href="/admin/posts">
            返回
          </Link>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">标题</span>
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
              <span className="text-sm font-medium">摘要（选填）</span>
              <input className="w-full rounded-md border px-3 py-2" name="excerpt" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">客户 / 伙伴（选填）</span>
              <input className="w-full rounded-md border px-3 py-2" name="client" placeholder="如：Apple、某合作方" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">标签（选填，逗号分隔）</span>
              <input className="w-full rounded-md border px-3 py-2" name="tags" placeholder="如：设计, 品牌, 包装" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-3 md:col-span-1">
              <div>
                <div className="text-sm font-semibold">发布设置</div>
                <div className="text-xs text-zinc-600">状态、头图、分类</div>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium">状态</span>
                <select className="w-full rounded-md border px-3 py-2" name="status" defaultValue="DRAFT">
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">已发布</option>
                </select>
              </label>

              <CoverImagePicker media={media} />

              <div className="space-y-2">
                <div className="text-sm font-medium">分类（至少 1 个）</div>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="categoryIds" value={c.id} />
                      <span>{c.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-xs text-zinc-600">
                      暂无分类，请先到{" "}
                      <Link className="underline" href="/admin/categories">分类</Link>
                      中创建。
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={pending}
                className="w-full rounded-md bg-black px-4 py-2 text-white font-medium disabled:opacity-50"
              >
                {pending ? "创建中…" : "创建文章"}
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="text-sm font-semibold">正文</div>
              <RichEditorField name="content" media={media} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
