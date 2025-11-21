import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(body.partNumber && { partNumber: body.partNumber }),
        ...(body.description && { description: body.description }),
        ...(body.orderedQty !== undefined && { orderedQty: body.orderedQty }),
        ...(body.orderedDate && { orderedDate: new Date(body.orderedDate) }),
        ...(body.unitType && { unitType: body.unitType }),
        ...(body.receivedQty !== undefined && { receivedQty: body.receivedQty }),
        ...(body.receivedDate && { receivedDate: new Date(body.receivedDate) }),
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
