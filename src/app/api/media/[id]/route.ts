import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const media = await prisma.media.findUnique({
    where: { id },
    select: { id: true, filename: true },
  });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.updateMany({
    where: { coverMediaId: id },
    data: { coverMediaId: null },
  });
  await prisma.product.updateMany({
    where: { coverMediaId: id },
    data: { coverMediaId: null },
  });

  const diskPath = path.join(process.cwd(), "public", "uploads", media.filename);
  await fs.unlink(diskPath).catch(() => {});

  await prisma.media.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
