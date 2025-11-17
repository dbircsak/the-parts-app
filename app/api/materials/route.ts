import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating material with data:", body);

    const material = await prisma.material.create({
      data: {
        partNumber: body.partNumber,
        description: body.description,
        orderedQty: body.orderedQty,
        orderedDate: body.orderedDate ? new Date(body.orderedDate) : null,
        unitType: body.unitType,
        receivedQty: body.receivedQty,
        receivedDate: body.receivedDate ? new Date(body.receivedDate) : null,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating material:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
