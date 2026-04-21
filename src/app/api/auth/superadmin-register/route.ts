import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie, signSession } from "@/lib/auth";

export const runtime = "nodejs";

const BodySchema = z.object({
  accessKey: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requiredKey = process.env.SUPERADMIN_ACCESS_KEY;
  if (!requiredKey || parsed.data.accessKey !== requiredKey) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 403 });
  }

  const existingSuper = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
  if (existingSuper) {
    return NextResponse.json({ error: "Superadmin already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "SUPERADMIN",
    },
    select: { id: true, role: true },
  });

  const token = await signSession({ sub: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}

