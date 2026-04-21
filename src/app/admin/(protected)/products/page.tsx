import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

export default async function ProductsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-zinc-500">{products.length} 个产品</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新建产品
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center text-sm text-zinc-400">
          还没有产品，点击右上角新建。
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3">标题</th>
                <th className="px-5 py-3">分类</th>
                <th className="px-5 py-3">状态</th>
                <th className="px-5 py-3">创建时间</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-medium">
                    <div>{p.title}</div>
                    {p.subtitle && (
                      <div className="text-xs text-zinc-400">{p.subtitle}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {p.categories.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {p.status === "PUBLISHED" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-400 text-xs">
                    {p.createdAt.toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-100"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
