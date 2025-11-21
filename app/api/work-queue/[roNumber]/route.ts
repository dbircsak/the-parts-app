import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roNumber: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const roNumber = parseInt(resolvedParams.roNumber);
    const body = await request.json();
    const { status, priority } = body;

    const workQueue = await prisma.workQueue.update({
      where: { roNumber },
      data: {
        ...(status && { status }),
        ...(priority !== undefined && { priority }),
      },
      include: {
        dailyOut: true,
      },
    });

    return NextResponse.json(workQueue);
  } catch (error) {
    console.error("Error updating work queue entry:", error);
    return NextResponse.json(
      { error: "Failed to update work queue entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ roNumber: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const roNumber = parseInt(resolvedParams.roNumber);

    await prisma.workQueue.delete({
      where: { roNumber },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work queue entry:", error);
    return NextResponse.json(
      { error: "Failed to delete work queue entry" },
      { status: 500 }
    );
  }
}
