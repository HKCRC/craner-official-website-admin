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

  // Public API: only published posts
  const where = { status: "PUBLISHED" as const };
  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        client: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
        coverMedia: { select: { url: true } },
        categories: { select: { name: true, slug: true } },
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

