import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) redirect("/admin/categories");

  async function updateCategory(formData: FormData) {
    "use server";
    await requireSession();
    const name = String(formData.get("name") || "").trim();
    const slug = slugify(String(formData.get("slug") || ""));
    const title = String(formData.get("title") || "").trim() || null;
    const subtitle = String(formData.get("subtitle") || "").trim() || null;
    const description = String(formData.get("description") || "").trim() || null;
    if (!name) throw new Error("Missing name");

    await prisma.category.update({
      where: { id },
      data: { name, slug, title, subtitle, description },
    });
    revalidatePath("/admin/categories");
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit category</h1>
          <p className="text-sm text-zinc-600">{category.id}</p>
        </div>
        <Link
          className="rounded-md border px-3 py-1.5 hover:bg-zinc-50"
          href="/admin/categories"
        >
          Back
        </Link>
      </div>

      <section className="rounded-xl border bg-white p-5 space-y-4">
        <form action={updateCategory} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">分类名 Name *</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="name"
                defaultValue={category.name}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Slug</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="slug"
                defaultValue={category.slug}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">大标题 Title (optional)</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="title"
                defaultValue={category.title ?? ""}
                placeholder="页面展示的大标题"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">小标题 Subtitle (optional)</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                name="subtitle"
                defaultValue={category.subtitle ?? ""}
                placeholder="大标题下方的副标题"
              />
            </label>
            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium">描述 Description (optional)</span>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                name="description"
                rows={3}
                defaultValue={category.description ?? ""}
                placeholder="分类的简短描述"
              />
            </label>
          </div>
          <button className="rounded-md bg-black px-4 py-2 text-white font-medium text-sm">
            Save
          </button>
        </form>
      </section>
    </div>
  );
}

