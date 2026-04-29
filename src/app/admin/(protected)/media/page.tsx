import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { MediaUpload } from "@/app/admin/(protected)/media/MediaUpload";
import { MediaItemCard } from "@/app/admin/(protected)/media/MediaItemCard";

export default async function MediaPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      originalName: true,
      sizeBytes: true,
      mimeType: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">媒体库</h1>
          <p className="text-sm text-zinc-600">上传图片或短视频，在文章、产品等内容中复用链接。</p>
        </div>
      </div>

      <MediaUpload />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">全部文件</h2>
        {media.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600">
            暂无媒体文件。
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((m) => (
              <MediaItemCard
                key={m.id}
                id={m.id}
                url={m.url}
                originalName={m.originalName}
                sizeBytes={m.sizeBytes}
                mimeType={m.mimeType}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

