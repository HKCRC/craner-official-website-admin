"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Toast } from "@/components/Toast";
import { BlockEditor } from "../../BlockEditor";
import { CoverImagePicker } from "@/app/admin/(protected)/posts/CoverImagePicker";
import type { FeatureItem, ProductBlock } from "@/types/product";

interface Category {
  id: string;
  name: string;
}
interface MediaItem {
  id: string;
  originalName: string;
  url: string;
}
interface Product {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  tags: string[];
  status: string;
  coverMediaId: string | null;
  categories: { id: string }[];
}

type ActionState = { ok: true } | { ok: false; error: string } | null;

interface Props {
  product: Product;
  categories: Category[];
  media: MediaItem[];
  initialBlocks: ProductBlock[];
  initialFeatures: FeatureItem[];
  justCreated?: boolean;
  updateAction: (
    state: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteAction: () => Promise<void>;
}

export function ProductEditForm({
  product,
  categories,
  media,
  initialBlocks,
  initialFeatures,
  justCreated = false,
  updateAction,
  deleteAction,
}: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateAction,
    null,
  );
  const selectedCats = new Set(product.categories.map((c) => c.id));

  const toastKey = useRef<number>(0);

  // eslint-disable-next-line react-hooks/refs
  if (state?.ok) toastKey.current += 1;

  return (
    <>
      {justCreated && <Toast key="created-product" message="创建成功 ✓" type="success" />}
      {state?.ok && (
        // eslint-disable-next-line react-hooks/refs
        <Toast key={toastKey.current} message="保存成功 ✓" type="success" />
      )}
      {state && !state.ok && (
        <Toast key={state.error} message={state.error} type="error" />
      )}

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">编辑产品</h1>
            <p className="text-zinc-400 font-mono text-xs">{product.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              返回
            </Link>
            <form action={deleteAction}>
              <button className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                删除
              </button>
            </form>
          </div>
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
                  defaultValue={product.title}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">副标题</span>
                <input
                  name="subtitle"
                  defaultValue={product.subtitle ?? ""}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Slug</span>
                <input
                  name="slug"
                  defaultValue={product.slug}
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <span className="block text-xs text-zinc-400">
                  这是 URL 上的后缀，如 /products/
                  <span className="font-mono">{product.slug}</span>。
                </span>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Tags（逗号分隔）</span>
                <input
                  name="tags"
                  defaultValue={product.tags.join(", ") ?? ""}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">状态</span>
                <select
                  name="status"
                  defaultValue={product.status}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">发布</option>
                </select>
              </label>

              <CoverImagePicker
                media={media}
                defaultMediaId={product.coverMediaId ?? ""}
              />

              <div className="space-y-1">
                <div className="text-sm font-medium">分类（至少选一个）*</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={c.id}
                        defaultChecked={selectedCats.has(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <BlockEditor
            initialBlocks={initialBlocks}
            initialFeatureList={initialFeatures}
            mediaItems={media}
          />

          <div className="flex justify-end gap-3 pb-10">
            <Link
              href="/admin/products"
              className="rounded-xl border px-5 py-2.5 text-sm hover:bg-zinc-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {pending ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
