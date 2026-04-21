import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { MediaUpload } from "@/app/admin/(protected)/media/MediaUpload";

export default async function MediaPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, originalName: true, sizeBytes: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Media library</h1>
          <p className="text-sm text-zinc-600">Upload and reuse images in posts.</p>
        </div>
      </div>

      <MediaUpload />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All media</h2>
        {media.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600">
            No media yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((m) => (
              <div key={m.id} className="rounded-xl border bg-white overflow-hidden">
                <div className="relative aspect-square bg-zinc-100">
                  <Image src={m.url} alt={m.originalName} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-medium" title={m.originalName}>
                    {m.originalName}
                  </div>
                  <div className="text-xs text-zinc-600">
                    {(m.sizeBytes / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

