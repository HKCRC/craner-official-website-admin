import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["EN", "ZH_HANS", "ZH_HANT"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale");

  if (localeParam) {
    const parsedLocale = LocaleEnum.safeParse(localeParam);
    if (!parsedLocale.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid locale. Use EN | ZH_HANS | ZH_HANT." },
        { status: 400 },
      );
    }

    const banner = await prisma.homepageBanner.findUnique({
      where: { locale: parsedLocale.data },
    });

    if (!banner) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, banner });
  }

  const banners = await prisma.homepageBanner.findMany({
    orderBy: { locale: "asc" },
  });

  return NextResponse.json({ ok: true, banners });
}

