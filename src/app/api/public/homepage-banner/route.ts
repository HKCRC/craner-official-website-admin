import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fromDbBannerLocale, toDbBannerLocale } from "@/lib/banner-locale";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["en", "zh", "zh-hk"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale");

  if (localeParam) {
    const parsedLocale = LocaleEnum.safeParse(localeParam);
    if (!parsedLocale.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid locale. Use en | zh | zh-hk." },
        { status: 400 },
      );
    }

    const banner = await prisma.homepageBanner.findUnique({
      where: { locale: toDbBannerLocale(parsedLocale.data) },
    });

    if (!banner) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      banner: { ...banner, locale: fromDbBannerLocale(banner.locale) },
    });
  }

  const banners = await prisma.homepageBanner.findMany({
    orderBy: { locale: "asc" },
  });

  return NextResponse.json({
    ok: true,
    banners: banners.map((b) => ({ ...b, locale: fromDbBannerLocale(b.locale) })),
  });
}

