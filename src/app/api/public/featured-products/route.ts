import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function clampInt(value: string | null, def: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const take = clampInt(url.searchParams.get("take"), 100, 1, 500);

  const items = await prisma.featuredProduct.findMany({
    orderBy: { order: "asc" },
    take,
  });

  return NextResponse.json({ ok: true, items });
}

