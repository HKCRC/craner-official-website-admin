import "server-only";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { randomSlug, slugify } from "@/lib/slug";
import type { FeatureItem, ProductBlock } from "@/types/product";
import { ProductNewForm } from "./ProductNewForm";

export const runtime = "nodejs";

type ActionState = { ok: true } | { ok: false; error: string } | null;

export default async function NewProductPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const [categories, media] = await Promise.all([
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

  async function createProduct(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    try {
      const session = await requireSession();

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

      const product = await prisma.product.create({
        data: {
          title,
          subtitle,
          slug,
          status: status as "DRAFT" | "PUBLISHED",
          publishedAt: status === "PUBLISHED" ? new Date() : null,
          tags,
          featureList: featureList as object[],
          blocks: blocks as object[],
          authorId: session.sub,
          coverMediaId,
          categoryIds,
        },
        select: { id: true },
      });

      revalidatePath("/admin/products");
      redirect(`/admin/products/${product.id}/edit?created=1`);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      return { ok: false, error: e instanceof Error ? e.message : "创建失败" };
    }
  }

  const defaultSlug = randomSlug();

  return (
    <ProductNewForm
      categories={categories}
      media={media}
      defaultSlug={defaultSlug}
      createAction={createProduct}
    />
  );
}
