import "server-only";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import ContactEditor from "./ContactEditor";

export const runtime = "nodejs";

export default async function ContactInfoPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">联系方式配置</h1>
        <p className="text-sm text-zinc-500 mt-1">
          分语言配置公司地址、联系电话、二维码及社交媒体链接。
        </p>
      </div>
      <ContactEditor />
    </div>
  );
}
