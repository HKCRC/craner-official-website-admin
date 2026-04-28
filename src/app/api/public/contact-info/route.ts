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

    const contact = await prisma.contactInfo.findUnique({
      where: { locale: toDbBannerLocale(parsedLocale.data) },
    });

    if (!contact) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      contact: { ...contact, locale: fromDbBannerLocale(contact.locale) },
    });
  }

  const contacts = await prisma.contactInfo.findMany({
    orderBy: { locale: "asc" },
  });

  return NextResponse.json({
    ok: true,
    contacts: contacts.map((c) => ({ ...c, locale: fromDbBannerLocale(c.locale) })),
  });
}

