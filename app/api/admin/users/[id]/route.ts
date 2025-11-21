import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/crypto";
import { NextResponse } from "next/server";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, role, password } = await request.json();

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (password) {
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    updateData.password = await hashPassword(password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(user);
}
