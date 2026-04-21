import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "cms_token";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

async function isValidToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return typeof payload.sub === "string";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return NextResponse.next();
  }

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token || !(await isValidToken(token))) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

