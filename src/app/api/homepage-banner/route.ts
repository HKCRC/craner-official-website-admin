import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

const LocaleEnum = z.enum(["EN", "ZH_HANS", "ZH_HANT"]);
const TemplateEnum = z.enum(["CAROUSEL", "VIDEO"]);

const CarouselSlideSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
});

const VideoContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  videoUrl: z.string(),
});

const BodySchema = z.object({
  locale: LocaleEnum,
  template: TemplateEnum,
  content: z.union([
    z.object({ slides: z.array(CarouselSlideSchema) }),
    VideoContentSchema,
  ]),
});

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const banners = await prisma.homepageBanner.findMany({
    orderBy: { locale: "asc" },
  });

  return NextResponse.json({ ok: true, banners });
}

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { locale, template, content } = parsed.data;

  const banner = await prisma.homepageBanner.upsert({
    where: { locale },
    create: { locale, template, content },
    update: { template, content },
  });

  return NextResponse.json({ ok: true, banner });
}
