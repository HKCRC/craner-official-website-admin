import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { fromDbBannerLocale, toDbBannerLocale } from "@/lib/banner-locale";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["en", "zh", "zh-hk"]);

const MediaSchema = z.union([
  z.object({ type: z.literal("carousel"), images: z.array(z.string()) }),
  z.object({ type: z.literal("video"), url: z.string() }),
]);

const FeatureItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const BodySchema = z.object({
  locale: LocaleEnum.optional(),
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  productName: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  media: MediaSchema.optional().default({ type: "carousel", images: [] }),
  featureList: z.array(FeatureItemSchema).optional().default([]),
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

  const { locale, ...rest } = parsed.data;
  const item = await prisma.featuredProduct.update({
    where: { id },
    data: locale ? { ...rest, locale: toDbBannerLocale(locale) } : rest,
  });
  return NextResponse.json({
    ok: true,
    item: { ...item, locale: fromDbBannerLocale(item.locale ?? "en") },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.featuredProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
