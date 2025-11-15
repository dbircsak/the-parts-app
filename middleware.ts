import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  const publicPages = ["/login", "/vendors"];
  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
