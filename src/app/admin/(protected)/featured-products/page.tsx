import "server-only";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import FeaturedProductsEditor from "./FeaturedProductsEditor";

export const runtime = "nodejs";

export default async function FeaturedProductsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">精选产品</h1>
        <p className="text-sm text-zinc-500 mt-1">
          配置首页或专题页展示的精选产品，支持轮播图或视频展示。
        </p>
      </div>
      <FeaturedProductsEditor />
    </div>
  );
}
