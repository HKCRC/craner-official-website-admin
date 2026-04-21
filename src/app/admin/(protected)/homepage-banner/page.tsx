import "server-only";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import BannerEditor from "./BannerEditor";

export const runtime = "nodejs";

export default async function HomepageBannerPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">首页 Banner 配置</h1>
        <p className="text-sm text-zinc-500 mt-1">
          分语言配置首页头图 — 轮播图或视频，每个语言版本独立设置。
        </p>
      </div>
      <BannerEditor />
    </div>
  );
}
