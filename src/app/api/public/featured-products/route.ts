import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { fromDbBannerLocale, toDbBannerLocale } from "@/lib/banner-locale";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["en", "zh", "zh-hk"]);

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const take = clampInt(url.searchParams.get("take"), 100, 1, 500);
  const localeParam = url.searchParams.get("locale");
  const parsedLocale = localeParam ? LocaleEnum.safeParse(localeParam) : null;
  if (parsedLocale && !parsedLocale.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid locale. Use en | zh | zh-hk." },
      { status: 400 },
    );
  }

  const items = await prisma.featuredProduct.findMany({
    orderBy: { order: "asc" },
    take,
    ...(parsedLocale?.success
      ? { where: { locale: toDbBannerLocale(parsedLocale.data) } }
      : {}),
  });

  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      ...i,
      locale: fromDbBannerLocale(i.locale ?? "en"),
    })),
  });
}

