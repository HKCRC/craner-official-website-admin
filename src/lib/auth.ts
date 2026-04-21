import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const TOKEN_COOKIE = "cms_token";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  role: "SUPERADMIN" | "ADMIN";
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecretKey());
  const sub = payload.sub;
  const role = payload.role;
  if (typeof sub !== "string") throw new Error("Invalid token sub");
  if (role !== "SUPERADMIN" && role !== "ADMIN") throw new Error("Invalid role");
  return { sub, role } as SessionPayload;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });
}

