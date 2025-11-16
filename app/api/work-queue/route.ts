import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { roNumber, priority, departmentCode, status } = body;

    if (!roNumber) {
      return NextResponse.json(
        { error: "roNumber is required" },
        { status: 400 }
      );
    }

    const workQueue = await prisma.workQueue.create({
      data: {
        roNumber,
        priority: priority || 0,
        departmentCode: departmentCode || "P",
        status: status || "NOT_STARTED",
      },
      include: {
        dailyOut: true,
      },
    });

    return NextResponse.json(workQueue);
  } catch (error) {
    console.error("Error creating work queue entry:", error);
    return NextResponse.json(
      { error: "Failed to create work queue entry" },
      { status: 500 }
    );
  }
}
