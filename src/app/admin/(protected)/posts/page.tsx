import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export default async function PostsPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      author: { select: { email: true } },
      categories: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-zinc-600">Create and publish articles.</p>
        </div>
        <Link className="rounded-md bg-black px-4 py-2 text-white font-medium" href="/admin/posts/new">
          New post
        </Link>
      </div>

      <section className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left font-medium px-5 py-3">Title</th>
              <th className="text-left font-medium px-5 py-3">Slug</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-left font-medium px-5 py-3">Categories</th>
              <th className="text-right font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-5 py-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.author.email}</div>
                </td>
                <td className="px-5 py-3 text-zinc-600">{p.slug}</td>
                <td className="px-5 py-3">{p.status}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.categories.map((c, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    className="rounded-md border px-3 py-1.5 hover:bg-zinc-50"
                    href={`/admin/posts/${p.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-zinc-600" colSpan={5}>
                  No posts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

