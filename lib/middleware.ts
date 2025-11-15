import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return session;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
) {
  const session = await auth();
  if (!session) {
    return null;
  }
  if (!allowedRoles.includes((session.user as any)?.role)) {
    return false;
  }
  return session;
}
