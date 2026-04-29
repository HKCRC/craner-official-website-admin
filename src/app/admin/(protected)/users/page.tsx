import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

function roleLabel(role: string) {
  if (role === "SUPERADMIN") return "超级管理员";
  if (role === "ADMIN") return "管理员";
  return role;
}

export default async function UsersPage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPERADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  async function createUser(formData: FormData) {
    "use server";
    const session = await requireSession();
    if (session.role !== "SUPERADMIN") throw new Error("FORBIDDEN");

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const name = String(formData.get("name") || "").trim() || null;
    const password = String(formData.get("password") || "");
    if (!email || !password || password.length < 8) throw new Error("Invalid input");

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { email, name, passwordHash, role: "ADMIN" },
    });

    revalidatePath("/admin/users");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const session = await requireSession();
    if (session.role !== "SUPERADMIN") throw new Error("FORBIDDEN");

    const userId = String(formData.get("userId") || "");
    if (!userId) throw new Error("Missing userId");
    if (userId === session.sub) throw new Error("Cannot delete yourself");

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">用户</h1>
          <p className="text-sm text-zinc-600">超级管理员可在此创建或删除子账号。</p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold">新建用户</h2>
        <form action={createUser} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            className="rounded-md border px-3 py-2"
            name="email"
            placeholder="email@example.com"
            type="email"
            required
          />
          <input className="rounded-md border px-3 py-2" name="name" placeholder="姓名（选填）" />
          <input
            className="rounded-md border px-3 py-2"
            name="password"
            placeholder="密码（至少 8 位）"
            type="password"
            minLength={8}
            required
          />
          <div className="md:col-span-3">
            <button className="rounded-md bg-black px-4 py-2 text-white font-medium">
              创建
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-white overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">全部用户</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left font-medium px-5 py-3">邮箱</th>
              <th className="text-left font-medium px-5 py-3">姓名</th>
              <th className="text-left font-medium px-5 py-3">角色</th>
              <th className="text-right font-medium px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-5 py-3">{u.email}</td>
                <td className="px-5 py-3">{u.name ?? "-"}</td>
                <td className="px-5 py-3">{roleLabel(u.role)}</td>
                <td className="px-5 py-3 text-right">
                  {u.role === "SUPERADMIN" ? (
                    <span className="text-zinc-400">—</span>
                  ) : (
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button className="rounded-md border px-3 py-1.5 hover:bg-zinc-50">
                        删除
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

