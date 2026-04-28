import { NextResponse } from "next/server";
import { getAppConfigRowsCached } from "@/lib/app-config-cache";

export const runtime = "nodejs";

export async function GET() {
  const entries = await getAppConfigRowsCached();
  const map: Record<string, string> = {};
  for (const row of entries) {
    map[row.key] = row.val;
  }
  return NextResponse.json({ ok: true, data: map });
}
