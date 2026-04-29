import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { randomSlug, slugify } from "@/lib/slug";

export default async function CategoriesPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, title: true, subtitle: true, description: true, createdAt: true },
  });

  const defaultSlug = randomSlug();

  async function createCategory(formData: FormData) {
    "use server";
    await requireSession();
    const name = String(formData.get("name") || "").trim();
    const slug = slugify(String(formData.get("slug") || name));
    const title = String(formData.get("title") || "").trim() || null;
    const subtitle = String(formData.get("subtitle") || "").trim() || null;
    const description = String(formData.get("description") || "").trim() || null;
    if (!name) throw new Error("Missing name");
    await prisma.category.create({ data: { name, slug, title, subtitle, description } });
    revalidatePath("/admin/categories");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    await requireSession();
    const id = String(formData.get("id") || "");
    if (!id) throw new Error("Missing id");
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">分类</h1>
          <p className="text-sm text-zinc-600">
            每篇文章需至少关联一个分类。
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold">新建分类</h2>
        <form action={createCategory} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">分类名 Name *</span>
              <input className="w-full rounded-md border px-3 py-2 text-sm" name="name" placeholder="如：案例研究" required />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Slug</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="slug"
                defaultValue={defaultSlug}
                placeholder="case-studies"
              />
              <span className="block text-xs text-zinc-400">
                这是 URL 上的后缀，如 /categories/<span className="font-mono">{defaultSlug}</span>。留空将自动生成。
              </span>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">大标题（选填）</span>
              <input className="w-full rounded-md border px-3 py-2 text-sm" name="title" placeholder="页面展示的大标题" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">小标题（选填）</span>
              <input className="w-full rounded-md border px-3 py-2 text-sm" name="subtitle" placeholder="大标题下方的副标题" />
            </label>
            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium">描述（选填）</span>
              <textarea className="w-full rounded-md border px-3 py-2 text-sm resize-none" name="description" rows={2} placeholder="分类的简短描述" />
            </label>
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-white font-medium text-sm">
            创建
          </button>
        </form>
      </section>

      <section className="rounded-xl border bg-white overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">全部分类</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left font-medium px-5 py-3">名称</th>
              <th className="text-left font-medium px-5 py-3">Slug</th>
              <th className="text-left font-medium px-5 py-3">大标题 / 小标题</th>
              <th className="text-left font-medium px-5 py-3">描述</th>
              <th className="text-right font-medium px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-zinc-500 text-xs">{c.slug}</td>
                <td className="px-5 py-3">
                  {c.title && <div className="text-sm font-medium">{c.title}</div>}
                  {c.subtitle && <div className="text-xs text-zinc-500">{c.subtitle}</div>}
                  {!c.title && !c.subtitle && <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="px-5 py-3 text-sm text-zinc-500 max-w-xs truncate">
                  {c.description || <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-5 py-3 text-right flex justify-end gap-2">
                  <Link
                    className="rounded-md border px-3 py-1.5 hover:bg-zinc-50"
                    href={`/admin/categories/${c.id}`}
                  >
                    编辑
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="rounded-md border px-3 py-1.5 hover:bg-zinc-50">
                      删除
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

