import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const material = await prisma.material.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        quantity: body.quantity,
        unit: body.unit,
        reorderLevel: body.reorderLevel,
        supplier: body.supplier,
        cost: body.cost,
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.material.delete({
      where: { id: params.id },
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
