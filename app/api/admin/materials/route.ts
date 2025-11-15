import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const material = await prisma.material.create({
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
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
