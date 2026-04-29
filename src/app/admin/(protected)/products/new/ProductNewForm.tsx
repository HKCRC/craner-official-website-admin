"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Toast } from "@/components/Toast";
import { BlockEditor } from "../BlockEditor";
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

export function ProductNewForm({ categories, media, defaultSlug, createAction }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createAction, null);

  return (
    <>
      {state && !state.ok && <Toast message={state.error} type="error" />}

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">新建产品</h1>
            <p className="text-sm text-zinc-500">填写产品信息并添加内容模块</p>
          </div>
          <Link href="/admin/products" className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
            返回
          </Link>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
            <div className="font-semibold">基础信息</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">标题 *</span>
                <input
                  name="title"
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="产品名称"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">副标题</span>
                <input
                  name="subtitle"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="一句话描述"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Slug</span>
                <input
                  name="slug"
                  defaultValue={defaultSlug}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="url-friendly-slug"
                />
                <span className="block text-xs text-zinc-400">
                  这是 URL 上的后缀，如 /products/<span className="font-mono">{defaultSlug}</span>。留空将自动生成。
                </span>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Tags（逗号分隔）</span>
                <input
                  name="tags"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="AI, 医疗, SaaS"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">状态</span>
                <select
                  name="status"
                  defaultValue="DRAFT"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">发布</option>
                </select>
              </label>

              <CoverImagePicker media={media} />

              <div className="space-y-1">
                <div className="text-sm font-medium">分类（至少选一个）*</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <p className="text-xs text-zinc-400">
                      暂无分类，请先去{" "}
                      <Link href="/admin/categories" className="underline">分类管理</Link>{" "}
                      创建。
                    </p>
                  ) : (
                    categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="categoryIds" value={c.id} />
                        {c.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <BlockEditor mediaItems={media} />

          <div className="flex justify-end gap-3 pb-10">
            <Link href="/admin/products" className="rounded-xl border px-5 py-2.5 text-sm hover:bg-zinc-50">
              取消
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {pending ? "创建中…" : "创建产品"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
