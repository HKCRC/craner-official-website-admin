import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      client: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
      coverMedia: { select: { url: true } },
      categories: { select: { name: true, slug: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    post: {
      ...post,
      coverImageUrl: post.coverMedia?.url ?? null,
      coverMedia: undefined,
    },
  });
}

