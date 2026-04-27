import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      tags: true,
      featureList: true,
      blocks: true,
      publishedAt: true,
      updatedAt: true,
      coverMedia: { select: { url: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    product: {
      ...product,
      coverImageUrl: product.coverMedia?.url ?? null,
      coverMedia: undefined,
    },
  });
}

