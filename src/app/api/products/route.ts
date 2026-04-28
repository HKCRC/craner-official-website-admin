import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = Number(value ?? def);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = clampInt(url.searchParams.get("page"), 1, 1, 10_000);
  const pageSize = clampInt(url.searchParams.get("pageSize"), 20, 5, 100);
  const category = url.searchParams.get("category");

  const categoryId = category
    ? await prisma.category
        .findUnique({ where: { slug: category }, select: { id: true } })
        .then((c) => c?.id ?? null)
    : null;

  // If caller specifies a category slug that doesn't exist, return empty results
  // instead of returning unrelated products with empty `categories` arrays.
  if (category && !categoryId) {
    return NextResponse.json({
      ok: true,
      page,
      pageSize,
      total: 0,
      totalPages: 1,
      items: [],
    });
  }

  // Public API: only published products
  const where = {
    status: "PUBLISHED" as const,
    ...(categoryId ? { categoryIds: { has: categoryId } } : {}),
  };
  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        subtitle: true,
        slug: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
        coverMedia: { select: { url: true } },
        categories: {
          select: { name: true, slug: true },
          where: category ? { slug: category } : undefined,
        },
        featureList: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    ok: true,
    page,
    pageSize,
    total,
    totalPages,
    items: items.map((p) => ({
      ...p,
      coverImageUrl: p.coverMedia?.url ?? null,
      coverMedia: undefined,
    })),
  });
}

