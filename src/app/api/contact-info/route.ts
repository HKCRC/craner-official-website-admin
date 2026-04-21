import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["EN", "ZH_HANS", "ZH_HANT"]);

const QrCodeSchema = z.object({
  label: z.string(),
  imageUrl: z.string(),
});

const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

const BodySchema = z.object({
  locale: LocaleEnum,
  address1Region: z.string().optional().default(""),
  address1Detail: z.string().optional().default(""),
  address2Region: z.string().optional().default(""),
  address2Detail: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  qrCodes: z.array(QrCodeSchema).optional().default([]),
  socialLinks: z.array(SocialLinkSchema).optional().default([]),
});

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contactInfo.findMany({
    orderBy: { locale: "asc" },
  });

  return NextResponse.json({ ok: true, contacts });
}

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { locale, ...data } = parsed.data;

  const contact = await prisma.contactInfo.upsert({
    where: { locale },
    create: { locale, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true, contact });
}
