import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".gif") return "image/gif";
  if (e === ".webp") return "image/webp";
  if (e === ".svg") return "image/svg+xml";
  if (e === ".webm") return "video/webm";
  if (e === ".mp4") return "video/mp4";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  for (const s of segments) {
    if (s.includes("..") || s.includes("/") || s.includes("\\")) {
      return new NextResponse("Bad request", { status: 400 });
    }
  }

  const absolute = path.join(UPLOADS_ROOT, ...segments);
  const resolved = path.resolve(absolute);
  const rootResolved = path.resolve(UPLOADS_ROOT);
  if (!resolved.startsWith(rootResolved + path.sep)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    const st = await stat(resolved);
    if (!st.isFile()) return new NextResponse("Not found", { status: 404 });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(resolved);
  const stream = createReadStream(resolved);
  const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": mimeFromExt(ext),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
