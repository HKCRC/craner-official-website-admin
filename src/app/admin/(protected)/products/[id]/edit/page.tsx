import "server-only";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { FeatureItem, ProductBlock } from "@/types/product";
import { ProductEditForm } from "./ProductEditForm";

export const runtime = "nodejs";

type ActionState = { ok: true } | { ok: false; error: string } | null;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const [product, categories, media] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: { select: { id: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, originalName: true, url: true },
    }),
  ]);

  if (!product) redirect("/admin/products");

  let initialBlocks: ProductBlock[] = [];
  let initialFeatures: FeatureItem[] = [];
  try {
    initialBlocks = product.blocks as unknown as ProductBlock[];
  } catch {}
  try {
    initialFeatures = product.featureList as unknown as FeatureItem[];
  } catch {}

  async function updateProduct(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    try {
      await requireSession();

      const title = String(formData.get("title") || "").trim();
      const subtitle = String(formData.get("subtitle") || "").trim() || null;
      const slugRaw = String(formData.get("slug") || "");
      const slug = slugify(slugRaw || title);
      const status = String(formData.get("status") || "DRAFT");
      const tagsRaw = String(formData.get("tags") || "");
      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const coverMediaId =
        String(formData.get("coverMediaId") || "").trim() || null;
      const categoryIds = formData.getAll("categoryIds").map(String);

      let blocks: ProductBlock[] = [];
      let featureList: FeatureItem[] = [];
      try {
        blocks = JSON.parse(String(formData.get("blocks") || "[]"));
      } catch {}
      try {
        featureList = JSON.parse(String(formData.get("featureList") || "[]"));
      } catch {}

      if (!title) return { ok: false, error: "请填写标题" };
      if (categoryIds.length < 1)
        return { ok: false, error: "至少选择一个分类" };
      if (status !== "DRAFT" && status !== "PUBLISHED")
        return { ok: false, error: "无效的状态" };

      await prisma.product.update({
        where: { id },
        data: {
          title,
          subtitle,
          slug,
          status: status as "DRAFT" | "PUBLISHED",
          publishedAt:
            status === "PUBLISHED"
              ? (product!.publishedAt ?? new Date())
              : null,
          tags,
          featureList: featureList as unknown as Prisma.InputJsonValue,
          blocks: blocks as unknown as Prisma.InputJsonValue,
          coverMediaId,
          categoryIds: { set: categoryIds },
        },
      });

      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}/edit`);
      return { ok: true };
    } catch (e) {
      if (isRedirectError(e)) throw e;
      return { ok: false, error: e instanceof Error ? e.message : "保存失败" };
    }
  }

  async function deleteProduct() {
    "use server";
    await requireSession();
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    redirect("/admin/products");
  }

  return (
    <ProductEditForm
      product={product}
      categories={categories}
      media={media}
      initialBlocks={initialBlocks}
      initialFeatures={initialFeatures}
      updateAction={updateProduct}
      deleteAction={deleteProduct}
    />
  );
}
