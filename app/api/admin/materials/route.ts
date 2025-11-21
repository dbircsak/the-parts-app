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
        partNumber: body.partNumber,
        description: body.description,
        orderedQty: body.orderedQty || 0,
        orderedDate: body.orderedDate ? new Date(body.orderedDate) : null,
        unitType: body.unitType,
        receivedQty: body.receivedQty || 0,
        receivedDate: body.receivedDate ? new Date(body.receivedDate) : null,
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
