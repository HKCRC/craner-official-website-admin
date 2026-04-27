import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const pageSizeRaw = Number(sp.pageSize ?? 20);
  const pageSize = Number.isFinite(pageSizeRaw)
    ? Math.min(Math.max(pageSizeRaw, 5), 100)
    : 20;
  const pageRaw = Number(sp.page ?? 1);
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;

  const skip = (page - 1) * pageSize;

  // If someone manually deletes users in MongoDB, existing posts can become
  // "orphaned" (authorId points to a non-existent user). Prisma treats `author`
  // as required and will throw when selecting it. Filter to valid authors.
  const authorIds = await prisma.user
    .findMany({ select: { id: true } })
    .then((rows) => rows.map((r) => r.id));

  const where = authorIds.length > 0 ? { authorId: { in: authorIds } } : { id: { in: [] } };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        author: { select: { email: true } },
        categories: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;

  const makeHref = (p: number) => `/admin/posts?page=${p}&pageSize=${pageSize}`;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-zinc-600">
            Create and publish articles. Total: {total}
          </p>
        </div>
        <Link
          className="rounded-md bg-black px-4 py-2 text-white font-medium"
          href="/admin/posts/new"
        >
          New post
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">
          Page <span className="font-medium text-black">{safePage}</span> /{" "}
          {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevPage ? makeHref(prevPage) : "#"}
            aria-disabled={!prevPage}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              prevPage ? "hover:bg-zinc-50" : "pointer-events-none opacity-50"
            }`}
          >
            Prev
          </Link>
          <Link
            href={nextPage ? makeHref(nextPage) : "#"}
            aria-disabled={!nextPage}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              nextPage ? "hover:bg-zinc-50" : "pointer-events-none opacity-50"
            }`}
          >
            Next
          </Link>
        </div>
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

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">
          Showing{" "}
          <span className="font-medium text-black">
            {total === 0 ? 0 : skip + 1}
          </span>{" "}
          -{" "}
          <span className="font-medium text-black">
            {Math.min(skip + pageSize, total)}
          </span>{" "}
          of {total}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevPage ? makeHref(prevPage) : "#"}
            aria-disabled={!prevPage}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              prevPage ? "hover:bg-zinc-50" : "pointer-events-none opacity-50"
            }`}
          >
            Prev
          </Link>
          <Link
            href={nextPage ? makeHref(nextPage) : "#"}
            aria-disabled={!nextPage}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              nextPage ? "hover:bg-zinc-50" : "pointer-events-none opacity-50"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
