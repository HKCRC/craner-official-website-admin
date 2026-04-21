import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads supported" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const safeExt = ext.slice(0, 10);
  const filename = `${crypto.randomUUID()}${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, filename);
  await fs.writeFile(diskPath, bytes);

  const url = `/uploads/${filename}`;
  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      url,
      uploadedById: session.sub,
    },
    select: { id: true, url: true },
  });

  return NextResponse.json({ ok: true, media });
}

