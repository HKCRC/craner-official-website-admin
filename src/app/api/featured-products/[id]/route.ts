import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

const MediaSchema = z.union([
  z.object({ type: z.literal("carousel"), images: z.array(z.string()) }),
  z.object({ type: z.literal("video"), url: z.string() }),
]);

const BodySchema = z.object({
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  productName: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  media: MediaSchema.optional().default({ type: "carousel", images: [] }),
  order: z.number().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.featuredProduct.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.featuredProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
