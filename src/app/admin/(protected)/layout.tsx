import "server-only";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/* ── inline SVG icons (no extra dep) ── */
function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  posts:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  products:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm10 8h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V7h8v2z",
  categories:
    "M12 2l-5.5 9h11zm0 3.84L13.93 9h-3.87zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7c-1.38 0-2.5-1.12-2.5-2.5S16.12 15 17.5 15s2.5 1.12 2.5 2.5S18.88 20 17.5 20zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z",
  media:
    "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  banner:
    "M1 5h2v14H1V5zm4 0h2v14H5V5zm16 0H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-1 12H10V7h10v10z",
  contact:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  config:
    "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z",
  featured:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z",
  users:
    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  logout:
    "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-56 flex-col bg-zinc-900 text-white">
        {/* Logo / brand */}
        <div className="px-5 py-5 border-b border-zinc-700">
          <Link
            href="/admin"
            className="text-base font-bold tracking-tight hover:opacity-80"
          >
            Craner 管理后台
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 text-sm">
          {[
            { href: "/admin/posts", label: "文章", icon: ICONS.posts },
            {
              href: "/admin/products",
              label: "产品",
              icon: ICONS.products,
            },
            {
              href: "/admin/categories",
              label: "分类",
              icon: ICONS.categories,
            },
            { href: "/admin/media", label: "媒体库", icon: ICONS.media },
            {
              href: "/admin/homepage-banner",
              label: "首页 Banner",
              icon: ICONS.banner,
            },
            {
              href: "/admin/contact-info",
              label: "联系方式",
              icon: ICONS.contact,
            },
            {
              href: "/admin/config",
              label: "站点配置",
              icon: ICONS.config,
            },
            {
              href: "/admin/featured-products",
              label: "精选产品",
              icon: ICONS.featured,
            },
            ...(user.role === "SUPERADMIN"
              ? [{ href: "/admin/users", label: "用户", icon: ICONS.users }]
              : []),
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <NavIcon d={icon} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info + logout at the bottom */}
        <div className="border-t border-zinc-700 px-4 py-4 space-y-2">
          <div className="truncate text-xs text-zinc-400">{user.email}</div>
          <form action="/api/auth/logout" method="post">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
              <NavIcon d={ICONS.logout} />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-56 flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
