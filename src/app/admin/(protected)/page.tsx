import { getCurrentUser } from "@/lib/auth";

export default async function AdminHome() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-700">
        Signed in as <span className="font-medium">{user?.email}</span>
      </p>
    </div>
  );
}
