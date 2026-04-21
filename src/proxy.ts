import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/board") || pathname.startsWith("/workspace");

  if (isProtected && !token) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  const isMainPage = pathname === "/";
  if (isMainPage && token) {
    const workspaceUrl = req.nextUrl.clone();
    workspaceUrl.pathname = "/workspace";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  const match = pathname.match(/^\/workspace\/([^/]+)/)
  if (match) {
    const slug = match[1]
    const response = NextResponse.next()
    response.cookies.set('last-workspace', slug, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: true,
    })
    return response
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
