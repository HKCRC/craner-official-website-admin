import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidateAppConfigCache } from "@/lib/app-config-cache";
import { ConfigForm } from "./ConfigForm";

export const runtime = "nodejs";

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

type SaveState =
  | { ok: true; message?: string }
  | { ok: false; error: string }
  | null;

export default async function AdminConfigPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const entries = await prisma.appConfig.findMany({
    orderBy: { key: "asc" },
    select: { key: true, val: true },
  });

  async function saveConfig(
    _prev: SaveState,
    formData: FormData,
  ): Promise<SaveState> {
    "use server";
    try {
      await requireSession();
      const raw = String(formData.get("payload") || "[]");
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { ok: false, error: "数据格式无效" };
      }
      if (!Array.isArray(parsed)) {
        return { ok: false, error: "数据格式无效" };
      }

      const pairs: { key: string; val: string }[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const rec = item as Record<string, unknown>;
        const key = typeof rec.key === "string" ? rec.key.trim() : "";
        const val = typeof rec.val === "string" ? rec.val : "";
        if (!key && !String(val).trim()) continue;
        if (!key) {
          return { ok: false, error: "每一行都必须填写英文 Key（或删除空行）" };
        }
        if (!KEY_RE.test(key)) {
          return {
            ok: false,
            error: `Key「${key}」不合法：须以英文字母开头，只能包含字母、数字、_、-`,
          };
        }
        pairs.push({ key, val: String(val) });
      }

      const keys = pairs.map((p) => p.key);
      if (new Set(keys).size !== keys.length) {
        return { ok: false, error: "存在重复的 Key，请修正后再保存" };
      }

      const keep = new Set(keys);
      const existing = await prisma.appConfig.findMany({
        select: { key: true },
      });
      for (const { key } of existing) {
        if (!keep.has(key)) {
          await prisma.appConfig.delete({ where: { key } });
        }
      }

      for (const { key, val } of pairs) {
        await prisma.appConfig.upsert({
          where: { key },
          create: { key, val },
          update: { val },
        });
      }

      revalidateAppConfigCache();
      revalidatePath("/admin/config");
      return { ok: true, message: "已保存并刷新缓存" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "保存失败" };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Config</h1>
        <p className="text-sm text-zinc-600 mt-1">通用键值配置</p>
      </div>

      <ConfigForm initialRows={entries} saveAction={saveConfig} />
    </div>
  );
}
