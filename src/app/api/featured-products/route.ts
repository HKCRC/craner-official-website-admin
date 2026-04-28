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
  locale: LocaleEnum.optional().default("en"),
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  productName: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  media: MediaSchema.optional().default({ type: "carousel", images: [] }),
  featureList: z.array(FeatureItemSchema).optional().default([]),
  order: z.number().optional().default(0),
});

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.featuredProduct.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      ...i,
      locale: fromDbBannerLocale(i.locale ?? "en"),
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { locale, ...rest } = parsed.data;
  const item = await prisma.featuredProduct.create({
    data: { ...rest, locale: toDbBannerLocale(locale) },
  });
  return NextResponse.json({
    ok: true,
    item: { ...item, locale: fromDbBannerLocale(item.locale ?? "en") },
  });
}
